// node-functions/ai/rag/stream.js — EdgeOne Pages Node Functions（SSE 流式 RAG 问答）
// 由 Vercel 版 api/rag.js 适配，差异：
// 1) 知识库向量预计算打包进 _kb-data.js（消除冷启动 embedding，规避 30s 运行限制）
// 2) 入口从 Node req/res 改为 Web Request/Response（EdgeOne 规范）
// 3) 环境变量从 context.env 读取（回退 process.env）
import https from 'node:https';
import { KB_CHUNKS, KB_VECTORS } from '../_kb-data.js';

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
let API_KEY = '';

// 全局状态（热实例间共享）
let vectorStore = [];
let bm25Index = null;
let kbReady = false;
let kbInitializing = false;

// ── 按 sessionId 隔离的对话历史（实例内存态，行为与 Vercel 版一致）──
const sessions = new Map();
const MAX_SESSIONS = 2000;
function getSessionHistory(sid) {
  if (!sessions.has(sid)) {
    sessions.set(sid, []);
    if (sessions.size > MAX_SESSIONS) {
      const toEvict = Math.floor(sessions.size / 2);
      let n = 0;
      for (const key of sessions.keys()) {
        if (n++ >= toEvict) break;
        sessions.delete(key);
      }
    }
  }
  return sessions.get(sid);
}

// ── HTTPS POST（一次性 JSON 响应）──
function httpsPost(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = ''; res.on('data', (c) => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error(d.substring(0, 200))); } });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body); req.end();
  });
}

// ── HTTPS POST 流式（SSE 逐行回调）──
function httpsPostStream(url, data, onChunk) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY, 'Content-Length': Buffer.byteLength(body) }
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

// ── Embedding（仅用于用户问题；知识库向量已预计算）──
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

// ── 初始化知识库（向量已预计算，毫秒级完成）──
function initKB() {
  if (kbReady) return;
  KB_CHUNKS.forEach((text, i) => vectorStore.push({ text, vector: KB_VECTORS[i], source: 'test.md' }));
  buildBM25();
  kbReady = true;
  console.log('[kb] Ready:', KB_CHUNKS.length, 'chunks (precomputed)');
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

// ── 混合检索（分段计时：向量化 / 混合打分 / LLM 重排，供前端性能指标展示）──
async function retrieve(question) {
  const t0 = Date.now();
  const qv = await getEmbedding(question);
  const embedMs = Date.now() - t0;
  const qt = tokenize(question);
  const scored = vectorStore.map((d) => ({ doc: d, cos: cosineSimilarity(qv, d.vector), bm: bm25Score(qt, d) }));
  const cMin = Math.min(...scored.map((s) => s.cos)); const cMax = Math.max(...scored.map((s) => s.cos));
  const bMin = Math.min(...scored.map((s) => s.bm)); const bMax = Math.max(...scored.map((s) => s.bm));
  scored.forEach((s) => { s.hybrid = 0.6 * (cMax > cMin ? (s.cos - cMin) / (cMax - cMin) : 0) + 0.4 * (bMax > bMin ? (s.bm - bMin) / (bMax - bMin) : 0); });
  scored.sort((a, b) => b.hybrid - a.hybrid);
  const cands = scored.slice(0, 6).map((s) => ({ text: s.doc.text, source: s.doc.source, score: parseFloat(s.hybrid.toFixed(4)) }));
  const hybridMs = Date.now() - t0 - embedMs;
  const t1 = Date.now();
  const docs = (await llmRerank(question, cands)).slice(0, 3);
  const rerankMs = Date.now() - t1;
  return { docs, timing: { embedMs, hybridMs, rerankMs, totalMs: Date.now() - t0 } };
}

// ── 构建消息 ──
function buildMessages(kbContext, question, history) {
  const histStr = history.slice(-6).map((m) => (m.role === 'user' ? '用户' : '助手') + '：' + m.content).join('\n');
  const system = '你是公司内部知识库问答助手，职责仅限于根据参考资料回答与公司制度、政策、流程相关的问题。\n\n【必须遵守的规则】\n1. 只回答与参考资料内容直接相关的问题。如果问题与参考资料无关，只回复：不好意思呀，我正在学习更多技能呢，您可以联系人工客服询问哦\n2. 回答时不要提及自己是AI、大模型、助手等身份，不要透露任何技术实现细节。\n3. 回答要简洁直接，不要过度解释。\n4. 如果参考资料中没有足够信息，只回复：不好意思呀，这个问题我暂时答不上来呢，建议您联系人工客服确认哦';
  let user = '';
  if (histStr) user += '【对话历史】\n' + histStr + '\n\n';
  user += '【参考资料】\n' + kbContext + '\n\n【用户问题】\n' + question;
  return [{ role: 'system', content: system }, { role: 'user', content: user }];
}

// ── 空问题时的静态 SSE 响应 ──
function sseText(body) {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
}

// ── Function Handler ──
export async function onRequest(context) {
  API_KEY = (context && context.env && context.env.DASHSCOPE_API_KEY) || process.env.DASHSCOPE_API_KEY || '';

  const url = new URL(context.request.url);
  const question = url.searchParams.get('question');
  const sid = (url.searchParams.get('sid') || '').trim();

  if (!question || !question.trim()) {
    return sseText('data: ' + JSON.stringify({ type: 'content', content: '请输入您的问题' }) + '\n\ndata: [DONE]\n\n');
  }

  const myHistory = getSessionHistory(sid || 'anonymous');

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (data) => controller.enqueue(enc.encode('data: ' + JSON.stringify(data) + '\n\n'));
      const done = () => controller.enqueue(enc.encode('data: [DONE]\n\n'));
      try {
        if (!kbReady) { send({ type: 'status', content: '正在初始化知识库，请稍候…' }); initKB(); }

        const { docs: topK, timing } = await retrieve(question);
        const THRESHOLD = 0.12;
        // RAG 可解释性事件：检索性能指标 + 命中片段（拒答时也发，让前端能展示"为什么拒答"）
        send({ type: 'stats', embedMs: timing.embedMs, hybridMs: timing.hybridMs, rerankMs: timing.rerankMs, totalMs: timing.totalMs });
        send({ type: 'sources', sources: topK.map((d, i) => ({ no: i + 1, score: d.score, excerpt: d.text.slice(0, 72).replace(/\s+/g, ' ') })) });
        if (topK.length === 0 || topK[0].score < THRESHOLD) {
          send({ type: 'content', content: '不好意思呀，我正在学习更多技能呢，您可以联系人工客服询问哦' });
          done();
          return;
        }

        const kbContext = topK.map((d, i) => '[' + (i + 1) + '] ' + d.text).join('\n\n');
        const messages = buildMessages(kbContext, question, myHistory);

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
        done();
      } catch (err) {
        console.error('[rag]', err && err.message);
        try { send({ type: 'content', content: '抱歉，服务暂时不可用，请稍后重试。' }); done(); } catch (e2) {}
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
