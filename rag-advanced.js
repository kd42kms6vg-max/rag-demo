// Step 7：混合检索（BM25 + 向量）+ LLM 重排序 + 多轮对话记忆
// 在 rag-stream.js 基础上增强；SSE 契约（sources / content / [DONE]）保持不变，
// 因此 public/index.html 无需改动（仅新增"新对话"按钮依赖 /ai/reset 接口）。

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;
const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

let vectorStore = [];   // 向量库：[{ text, vector, source, tf, len }]
let bm25Index = null;   // 词法检索索引

// ── 多轮对话记忆（生产环境应按 session / 用户隔离，这里用全局数组演示）──
let conversationHistory = [];
const MAX_HISTORY = 6;  // 只保留最近 6 条，避免 Prompt 过长、费 token

app.use(express.static('public'));

// ============================================================
// 基础能力
// ============================================================
async function getEmbedding(text) {
  const res = await axios.post(
    `${DASHSCOPE_BASE}/embeddings`,
    { model: 'text-embedding-v3', input: text },
    { headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`, 'Content-Type': 'application/json' } }
  );
  return res.data.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ============================================================
// 词法检索：BM25（解决"语义检索漏掉精确关键词"的问题）
// ============================================================

// 中文没有空格，简单做法：中文按"字"切、英文/数字按"词"切
function tokenize(text) {
  const tokens = [];
  const regex = /[a-zA-Z0-9]+|[\u4e00-\u9fff]/g;
  let m;
  while ((m = regex.exec(text)) !== null) tokens.push(m[0].toLowerCase());
  return tokens;
}

// 启动时构建 BM25 索引（文档频率 df、平均长度等）
function buildBM25() {
  const df = {};
  vectorStore.forEach((doc) => {
    const tokens = tokenize(doc.text);
    const tf = {};
    tokens.forEach((w) => (tf[w] = (tf[w] || 0) + 1));
    doc.tf = tf;
    doc.len = tokens.length;
    Object.keys(tf).forEach((w) => (df[w] = (df[w] || 0) + 1));
  });
  bm25Index = {
    df,
    docCount: vectorStore.length,
    avgdl: vectorStore.reduce((s, d) => s + d.len, 0) / (vectorStore.length || 1),
  };
}

// 单篇文档对查询的 BM25 得分
function bm25Score(queryTokens, doc, k1 = 1.5, b = 0.75) {
  let score = 0;
  queryTokens.forEach((q) => {
    const f = doc.tf[q] || 0;
    if (f === 0) return;
    const idf = Math.log(
      (bm25Index.docCount - (bm25Index.df[q] || 0) + 0.5) / ((bm25Index.df[q] || 0) + 0.5) + 1
    );
    score += (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + b * (doc.len / bm25Index.avgdl)));
  });
  return score;
}

// ============================================================
// 第二阶段：LLM 重排序（用大模型从候选里挑最相关的 Top-3）
// ============================================================
async function llmRerank(question, candidates) {
  const numbered = candidates.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');
  const prompt = `你是一个检索质量评估器。下面是从知识库检索出的若干候选资料，请判断哪几段与用户问题最相关，用于回答该问题。
只输出最相关的 3 段资料编号（方括号里的数字），按相关性从高到低排列，格式为 JSON 数组，例如 [3,1,2]。不要输出任何解释或多余文字。

【用户问题】
${question}

【候选资料】
${numbered}`;

  try {
    const res = await axios.post(
      `${DASHSCOPE_BASE}/chat/completions`,
      {
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: '你是一个严谨的检索重排序器，只输出 JSON 数组。' },
          { role: 'user', content: prompt },
        ],
      },
      { headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    const raw = res.data.choices[0].message.content || '';
    const match = raw.match(/\[[\d,\s]+\]/);
    if (!match) return candidates.slice(0, 3);
    const idx = JSON.parse(match[0]).map((n) => n - 1).filter((i) => i >= 0 && i < candidates.length);
    const selected = new Set(idx);
    const reordered = idx.map((i) => candidates[i]);
    const rest = candidates.filter((_, i) => !selected.has(i));
    return [...reordered, ...rest].slice(0, 3);
  } catch (e) {
    console.error('⚠️ 重排序失败，回退到混合检索顺序:', e.message);
    return candidates.slice(0, 3);
  }
}

// ============================================================
// 混合检索 + 重排序：返回 Top-3 结果 [{ text, source, score }]
// ============================================================
async function retrieve(question, topN = 6) {
  const queryVector = await getEmbedding(question);
  const queryTokens = tokenize(question);

  // 第一步：向量语义分 + BM25 词法分，各归一化后加权融合
  const scored = vectorStore.map((doc) => ({
    doc,
    cos: cosineSimilarity(queryVector, doc.vector),
    bm: bm25Score(queryTokens, doc),
  }));

  const cMin = Math.min(...scored.map((s) => s.cos));
  const cMax = Math.max(...scored.map((s) => s.cos));
  const bMin = Math.min(...scored.map((s) => s.bm));
  const bMax = Math.max(...scored.map((s) => s.bm));

  scored.forEach((s) => {
    const cosN = cMax > cMin ? (s.cos - cMin) / (cMax - cMin) : 0;
    const bmN = bMax > bMin ? (s.bm - bMin) / (bMax - bMin) : 0;
    s.hybrid = 0.6 * cosN + 0.4 * bmN; // 语义 0.6 + 词法 0.4（可调）
  });

  scored.sort((a, b) => b.hybrid - a.hybrid);
  const candidates = scored.slice(0, topN).map((s) => ({
    text: s.doc.text,
    source: s.doc.source,
    score: parseFloat(s.hybrid.toFixed(4)),
  }));

  // 第二步：LLM 重排序，从 topN 里精选出 Top-3
  return llmRerank(question, candidates).then((r) => r.slice(0, 3));
}

// ============================================================
// 对话记忆：把最近几轮拼进 Prompt，支持追问/指代消解
// ============================================================
function buildMessages(context, question) {
  const history = conversationHistory
    .slice(-MAX_HISTORY)
    .map((m) => `${m.role === 'user' ? '用户' : '助手'}：${m.content}`)
    .join('\n');

  const system = [
    '你是公司内部知识库问答助手，职责仅限于根据参考资料回答与公司制度、政策、流程相关的问题。',
    '',
    '【必须遵守的规则】',
    '1. 只回答与参考资料内容直接相关的问题。如果问题与参考资料无关（包括但不限于：询问你的身份/模型/技术细节、闲聊寒暄、个人问题、外部话题等），只回复：不好意思呀，我正在学习更多技能呢，您可以联系人工客服询问哦',
    '2. 回答时不要提及自己是AI、大模型、助手等身份，不要透露任何技术实现细节。',
    '3. 回答要简洁直接，不要过度解释、不要展开无关建议、不要使用表情符号或客服式套话。',
    '4. 如果参考资料中没有足够信息，只回复：不好意思呀，这个问题我暂时答不上来呢，建议您联系人工客服确认哦 不要再补充任何其他文字。',
  ].join('\n');

  let user = '';
  if (history) user += `【对话历史】\n${history}\n\n`;
  user += `【参考资料】\n${context}\n\n【用户问题】\n${question}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

// ============================================================
// 启动时：加载文档 → 分块 → 向量化 → 构建 BM25（只做一次）
// ============================================================
async function initKnowledgeBase() {
  console.log('📚 正在加载文档并构建向量库...');
  const text = fs.readFileSync('./data/test.md', 'utf-8');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
    separators: ['\n## ', '\n# ', '\n', '。', '.', ' '],
  });
  const chunks = await splitter.createDocuments([text], [{ source: 'test.md' }]);

  for (const chunk of chunks) {
    const vector = await getEmbedding(chunk.pageContent);
    vectorStore.push({ text: chunk.pageContent, vector, source: chunk.metadata.source });
  }
  buildBM25();
  console.log(`✅ 知识库就绪：${vectorStore.length} 个文档块（混合检索 + 重排序已启用）`);
}

// ============================================================
// 流式 RAG 接口（SSE）
// ============================================================
app.get('/ai/rag/stream', async (req, res) => {
  const question = req.query.question;
  if (!question) return res.status(400).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 1. 混合检索 + 重排序
  const topK = await retrieve(question);

  // 2. 意图门槛：如果最高相关度太低，说明问题与知识库无关，直接拒答（省 token、防跑偏）
  const RELEVANCE_THRESHOLD = 0.12;
  if (topK.length === 0 || topK[0].score < RELEVANCE_THRESHOLD) {
    res.write(`data: ${JSON.stringify({ type: 'content', content: '不好意思呀，我正在学习更多技能呢，您可以联系人工客服询问哦' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // 3. 构建消息
  const context = topK.map((d, i) => `[${i + 1}] ${d.text}`).join('\n\n');
  const messages = buildMessages(context, question);

  // 4. 流式调用大模型
  const stream = await axios.post(
    `${DASHSCOPE_BASE}/chat/completions`,
    { model: 'qwen-plus', stream: true, messages },
    {
      headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`, 'Content-Type': 'application/json' },
      responseType: 'stream',
    }
  );

  let buffer = '';
  let fullAnswer = '';

  // 4. 逐字转发
  stream.data.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') {
        // 5. 本轮结束，写入对话记忆
        conversationHistory.push({ role: 'user', content: question });
        conversationHistory.push({ role: 'assistant', content: fullAnswer });
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          fullAnswer += delta;
          res.write(`data: ${JSON.stringify({ type: 'content', content: delta })}\n\n`);
        }
      } catch (e) {
        /* 忽略偶发解析错误 */
      }
    }
  });

  stream.data.on('end', () => {
    conversationHistory.push({ role: 'user', content: question });
    conversationHistory.push({ role: 'assistant', content: fullAnswer });
    res.write('data: [DONE]\n\n');
    res.end();
  });

  stream.data.on('error', (err) => {
    console.error('流错误:', err.message);
    res.end();
  });
});

// 清空对话记忆
app.get('/ai/reset', (req, res) => {
  conversationHistory = [];
  res.json({ ok: true });
});

initKnowledgeBase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RAG 进阶服务已启动: http://0.0.0.0:${PORT}`);
    console.log('📝 已启用：混合检索(BM25+向量) + LLM重排序 + 多轮对话记忆');
  });
});
