const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
require('dotenv').config();

const app = express();
const PORT = 8080;

// ============================================================
// 第一部分：启动时加载文档 → 分块 → 向量化（只做一次）
// ============================================================

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
let vectorStore = []; // 内存向量库：[{ text, vector, source }]

// 调 Embedding API
async function getEmbedding(text) {
    const res = await axios.post(
        `${DASHSCOPE_BASE}/embeddings`,
        { model: 'text-embedding-v3', input: text },
        { headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return res.data.data[0].embedding;
}

// 调 Chat API
async function chat(prompt) {
    const res = await axios.post(
        `${DASHSCOPE_BASE}/chat/completions`,
        {
            model: 'qwen-plus',
            messages: [
                { role: 'system', content: '你是一个知识库问答助手。请严格根据提供的参考资料回答问题。' },
                { role: 'user', content: prompt },
            ],
        },
        { headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return res.data.choices[0].message.content;
}

// 余弦相似度
function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 启动时初始化知识库
async function initKnowledgeBase() {
    console.log('📚 正在加载文档并构建向量库...');

    // 1. 读文件
    const text = fs.readFileSync('./data/test.md', 'utf-8');

    // 2. 分块
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
        separators: ['\n## ', '\n# ', '\n', '。', '.', ' '],
    });
    const chunks = await splitter.createDocuments([text], [{ source: 'test.md' }]);

    // 3. 逐块向量化
    for (const chunk of chunks) {
        const vector = await getEmbedding(chunk.pageContent);
        vectorStore.push({
            text: chunk.pageContent,
            vector: vector,
            source: chunk.metadata.source,
        });
    }

    console.log(`✅ 知识库就绪：${vectorStore.length} 个文档块已向量化\n`);
}

// ============================================================
// 第二部分：RAG 问答核心逻辑
// ============================================================

async function ragQuery(question) {
    // 1. 把用户问题向量化
    const queryVector = await getEmbedding(question);

    // 2. 计算相似度，取 Top 3
    const scored = vectorStore.map((doc) => ({
        text: doc.text,
        source: doc.source,
        score: cosineSimilarity(queryVector, doc.vector),
    }));
    scored.sort((a, b) => b.score - a.score);
    const topK = scored.slice(0, 3);

    // 3. 拼 RAG Prompt
    const context = topK
        .map((doc, i) => `[${i + 1}] ${doc.text}`)
        .join('\n\n');

    const prompt = `请根据以下参考资料回答用户的问题。
如果参考资料中没有相关信息，请回答"根据现有资料无法回答该问题"。

【参考资料】
${context}

【用户问题】
${question}`;

    // 4. 调大模型生成回答
    const answer = await chat(prompt);

    // 5. 返回答案 + 引用来源
    return {
        question: question,
        answer: answer,
        sources: topK.map((doc) => ({
            text: doc.text.substring(0, 50) + '...',
            source: doc.source,
            score: parseFloat(doc.score.toFixed(4)),
        })),
    };
}

// ============================================================
// 第三部分：Express 路由
// ============================================================

// RAG 问答接口
app.get('/ai/rag', async (req, res) => {
    const question = req.query.question;
    if (!question) {
        return res.status(400).json({ error: '请提供 question 参数' });
    }

    try {
        const result = await ragQuery(question);
        res.json(result);
    } catch (error) {
        console.error('RAG 查询失败:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

// 启动
initKnowledgeBase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 RAG 服务已启动: http://localhost:${PORT}`);
        console.log(`📝 测试: http://localhost:${PORT}/ai/rag?question=年假有多少天\n`);
    });
});
