// api/rag.js — Vercel Serverless Function (SSE 流式 RAG 问答)
const fs = require('fs');
const path = require('path');
const https = require('https');

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

// 全局状态（Vercel 热实例间共享）
let vectorStore = [];
let bm25Index = null;
let kbReady = false;
let kbInitializing = false;

// 按 sessionId 隔离的对话历史（解决多用户/多设备串台问题）
const { getSessionHistory, resetSession } = require('./_lib/sessions');

// ── 预加载文档 ──
let KNOWLEDGE_TEXT = '';
try {
  KNOWLEDGE_TEXT = fs.readFileSync(path.join(process.cwd(), 'data', 'test.md'), 'utf-8');
} catch (e) { console.error('Cannot load test.md:', e.message); }

// ── HTTPS POST 封装 ──
function httpsPost(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + DASHSCOPE_API_KEY, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = ''; res.on('data', (c) => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error(d.substring(0, 200))); } });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body); req.end();
  });
}

// ── HTTPS POST 流式 ──
function httpsPostStream(url, data, onChunk) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + DASHSCOPE_API_KEY, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let buf = '';
      res.on('data', (chunk) => {
        buf += chunk.toString();
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) if (line.trim()) onChunk(line);
      });
      res.on('end', () => { if (buf.trim()) onChunk(buf); resolve(); });
    });
    req.on('error', reject);
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body); req.end();
  });
}

// ── Embedding ──
async function getEmbedding(text) {
  const res = await httpsPost(DASHSCOPE_BASE + '/embeddings', { model: 'text-embedding-v3', input: text });
  return res.data[0].embedding;
}

// ── 向量相似度 ──
function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// ── BM25 ──
function tokenize(text) {
  const tokens = []; const re = /[a-zA-Z0-9]+|[\u4e00-\u9fff]/g; let m;
  while ((m = re.exec(text)) !== null) tokens.push(m[0].toLowerCase());
  return tokens;
}
function buildBM25() {
  const df = {};
  vectorStore.forEach((doc) => {
    const tf = {}; tokenize(doc.text).forEach((w) => tf[w] = (tf[w] || 0) + 1);
    doc.tf = tf; doc.len = tokenize(doc.text).length;
    Object.keys(tf).forEach((w) => df[w] = (df[w] || 0) + 1);
  });
  bm25Index = { df, docCount: vectorStore.length, avgdl: vectorStore.reduce((s, d) => s + d.len, 0) / (vectorStore.length || 1) };
}
function bm25Score(qt, doc, k1, b) {
  k1 = k1 || 1.5; b = b || 0.75; let s = 0;
  qt.forEach((q) => {
    const f = doc.tf[q] || 0; if (f === 0) return;
    const idf = Math.log((bm25Index.docCount - (bm25Index.df[q] || 0) + 0.5) / ((bm25Index.df[q] || 0) + 0.5) + 1);
    s += (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + b * (doc.len / bm25Index.avgdl)));
  });
  return s;
}

// ── 分块 ──
function chunkText(text, size, overlap) {
  size = size || 300; overlap = overlap || 50;
  const paras = text.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 0);
  const chunks = []; let cur = '';
  for (const p of paras) {
    if (/^#{1,3}\s/.test(p)) { if (cur) { chunks.push(cur); cur = ''; } cur = p; continue; }
    const c = cur ? cur + '\n' + p : p;
    if (c.length > size && cur) { chunks.push(cur); cur = cur.slice(-overlap) + '\n' + p; } else { cur = c; }
  }
  if (cur) chunks.push(cur);
  return chunks.filter((c) => c.trim().length > 0);
}

// ── 初始化知识库 ──
async function initKB() {
  if (kbReady) return;
  if (kbInitializing) { while (kbInitializing) await new Promise((r) => setTimeout(r, 300)); return; }
  kbInitializing = true;
  try {
    const chunks = chunkText(KNOWLEDGE_TEXT, 300, 50);
    for (let i = 0; i < chunks.length; i++) {
      const v = await getEmbedding(chunks[i]);
      vectorStore.push({ text: chunks[i], vector: v, source: 'test.md' });
    }
    buildBM25(); kbReady = true;
    console.log('[kb] Ready:', chunks.length, 'chunks');
  } finally { kbInitializing = false; }
}

// ── LLM 重排序 ──
async function llmRerank(question, candidates) {
  const numbered = candidates.map((c, i) => '[' + (i + 1) + '] ' + c.text).join('\n\n');
  try {
    const res = await httpsPost(DASHSCOPE_BASE + '/chat/completions', {
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: '你是检索重排序器，只输出 JSON 数组。' },
        { role: 'user', content: '请判断哪几段与问题最相关。只输出最相关的3段编号，格式为JSON数组，例如[3,1,2]。\n\n【问题】' + question + '\n\n【候选】\n' + numbered }
      ]
    });
    const raw = (res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content) || '';
    const match = raw.match(/\[[\d,\s]+\]/);
    if (!match) return candidates.slice(0, 3);
    const idx = JSON.parse(match[0]).map((n) => n - 1).filter((i) => i >= 0 && i < candidates.length);
    const sel = new Set(idx);
    return idx.map((i) => candidates[i]).concat(candidates.filter((_, i) => !sel.has(i))).slice(0, 3);
  } catch (e) { return candidates.slice(0, 3); }
}

// ── 混合检索 ──
async function retrieve(question) {
  const qv = await getEmbedding(question);
  const qt = tokenize(question);
  const scored = vectorStore.map((d) => ({ doc: d, cos: cosineSimilarity(qv, d.vector), bm: bm25Score(qt, d) }));
  const cMin = Math.min(...scored.map((s) => s.cos)); const cMax = Math.max(...scored.map((s) => s.cos));
  const bMin = Math.min(...scored.map((s) => s.bm)); const bMax = Math.max(...scored.map((s) => s.bm));
  scored.forEach((s) => { s.hybrid = 0.6 * (cMax > cMin ? (s.cos - cMin) / (cMax - cMin) : 0) + 0.4 * (bMax > bMin ? (s.bm - bMin) / (bMax - bMin) : 0); });
  scored.sort((a, b) => b.hybrid - a.hybrid);
  const cands = scored.slice(0, 6).map((s) => ({ text: s.doc.text, source: s.doc.source, score: parseFloat(s.hybrid.toFixed(4)) }));
  return llmRerank(question, cands).then((r) => r.slice(0, 3));
}

// ── 构建消息 ──
function buildMessages(context, question, history) {
  const histStr = history.slice(-6).map((m) => (m.role === 'user' ? '用户' : '助手') + '：' + m.content).join('\n');
  const system = '你是公司内部知识库问答助手，职责仅限于根据参考资料回答与公司制度、政策、流程相关的问题。\n\n【必须遵守的规则】\n1. 只回答与参考资料内容直接相关的问题。如果问题与参考资料无关，只回复：不好意思呀，我正在学习更多技能呢，您可以联系人工客服询问哦\n2. 回答时不要提及自己是AI、大模型、助手等身份，不要透露任何技术实现细节。\n3. 回答要简洁直接，不要过度解释。\n4. 如果参考资料中没有足够信息，只回复：不好意思呀，这个问题我暂时答不上来呢，建议您联系人工客服确认哦';
  let user = '';
  if (histStr) user += '【对话历史】\n' + histStr + '\n\n';
  user += '【参考资料】\n' + context + '\n\n【用户问题】\n' + question;
  return [{ role: 'system', content: system }, { role: 'user', content: user }];
}

// ── Vercel Handler ──
module.exports = async (req, res) => {
  const question = req.query.question;
  const sid = (req.query.sid || '').trim(); // 前端传来的会话 ID

  if (!question || !question.trim()) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' });
    res.write('data: ' + JSON.stringify({ type: 'content', content: '请输入您的问题' }) + '\n\ndata: [DONE]\n\n');
    return res.end();
  }

  // 每个用户/标签页独立的对话历史
  const myHistory = getSessionHistory(sid || 'anonymous');

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const send = (data) => res.write('data: ' + JSON.stringify(data) + '\n\n');

  try {
    if (!kbReady) { send({ type: 'status', content: '正在初始化知识库，请稍候…' }); await initKB(); }

    const topK = await retrieve(question);
    const THRESHOLD = 0.12;
    if (topK.length === 0 || topK[0].score < THRESHOLD) {
      send({ type: 'content', content: '不好意思呀，我正在学习更多技能呢，您可以联系人工客服询问哦' });
      res.write('data: [DONE]\n\n'); return res.end();
    }

    const context = topK.map((d, i) => '[' + (i + 1) + '] ' + d.text).join('\n\n');
    const messages = buildMessages(context, question, myHistory);

    let fullAnswer = '';
    await httpsPostStream(DASHSCOPE_BASE + '/chat/completions', {
      model: 'qwen-plus', messages, stream: true
    }, (line) => {
      if (line.startsWith('data:')) {
        const d = line.slice(5).trim();
        if (d === '[DONE]') return;
        try {
          const p = JSON.parse(d);
          const delta = p.choices && p.choices[0] && p.choices[0].delta;
          if (delta && delta.content) { fullAnswer += delta.content; send({ type: 'content', content: delta.content }); }
        } catch (e) {}
      }
    });

    myHistory.push({ role: 'user', content: question });
    myHistory.push({ role: 'assistant', content: fullAnswer });
    res.write('data: [DONE]\n\n'); res.end();
  } catch (err) {
    console.error('[rag]', err.message);
    send({ type: 'content', content: '抱歉，服务暂时不可用，请稍后重试。' });
    res.write('data: [DONE]\n\n'); res.end();
  }
};