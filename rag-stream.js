 const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
require('dotenv').config();

const app = express();
const PORT = 8080;

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
let vectorStore = [];

// 让 public 文件夹里的 index.html 能被浏览器直接访问（http://localhost:8080/）
app.use(express.static('public'));

// 调 Embedding API：把文字转成 1024 维向量
async function getEmbedding(text) {
  const res = await axios.post(
    `${DASHSCOPE_BASE}/embeddings`,
    { model: 'text-embedding-v3', input: text },
    {
      headers: {
        Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data.data[0].embedding;
}

// 余弦相似度：衡量两个向量语义有多接近
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 启动时：加载文档 → 分块 → 向量化（只做一次）
async function initKnowledgeBase() {
  console.log('📚 正在加载文档并构建向量库...');
  const text = fs.readFileSync('./data/test.md', 'utf-8');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
    separators: ['\n## ', '\n# ', '\n', '。', '.', ' '],
  });
  const chunks = await splitter.createDocuments([text], [{ source: 'test.md' }]);

  for (const chunk of chunks) {
    const vector = await getEmbedding(chunk.pageContent);
    vectorStore.push({
      text: chunk.pageContent,
      vector: vector,
      source: chunk.metadata.source,
    });
  }
  console.log(`✅ 知识库就绪：${vectorStore.length} 个文档块已向量化`);
}

// ============================================================
// 核心：流式 RAG 接口（打字机效果）
// ============================================================
app.get('/ai/rag/stream', async (req, res) => {
  const question = req.query.question;
  if (!question) return res.status(400).end();

  // 1. 设置 SSE 响应头（告诉浏览器：这是一个"持续推送"的响应）
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 2. 检索 Top-3（跟 rag.js 一样）
  const queryVector = await getEmbedding(question);
  const scored = vectorStore.map((doc) => ({
    text: doc.text,
    source: doc.source,
    score: cosineSimilarity(queryVector, doc.vector),
  }));
  scored.sort((a, b) => b.score - a.score);
  const topK = scored.slice(0, 3);

  const context = topK.map((d, i) => `[${i + 1}] ${d.text}`).join('\n\n');
  const prompt = `请根据以下参考资料回答用户的问题。
如果参考资料中没有相关信息，请回答"根据现有资料无法回答该问题"。

【参考资料】
${context}

【用户问题】
${question}`;

  // 3. 先把"引用来源"作为第一个事件推给前端（让界面先显示引用）
  res.write(
    `data: ${JSON.stringify({
      type: 'sources',
      sources: topK.map((d) => ({ source: d.source, score: parseFloat(d.score.toFixed(4)) })),
    })}\n\n`
  );

  // 4. 调用流式 Chat API（stream:true + responseType:'stream'）
  const stream = await axios.post(
    `${DASHSCOPE_BASE}/chat/completions`,
    {
      model: 'qwen-plus',
      stream: true,
      messages: [
        {
          role: 'system',
          content: '你是一个知识库问答助手。请严格根据提供的参考资料回答问题。',
        },
        { role: 'user', content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream',
    }
  );

  // 5. 逐块读取大模型返回的文字，一个个转发给浏览器
  let buffer = '';
  stream.data.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 最后一行可能不完整，留到下次

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') {
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          // 每个字都实时推送给浏览器
          res.write(`data: ${JSON.stringify({ type: 'content', content: delta })}\n\n`);
        }
      } catch (e) {
        /* 忽略偶发的解析错误 */
      }
    }
  });

  stream.data.on('end', () => {
    res.write('data: [DONE]\n\n');
    res.end();
  });

  stream.data.on('error', (err) => {
    console.error('流错误:', err.message);
    res.end();
  });
});

initKnowledgeBase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 RAG 流式服务已启动: http://localhost:${PORT}`);
    console.log('📝 浏览器打开上面的地址即可使用聊天界面');
  });
});
