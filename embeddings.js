const axios = require('axios');
require('dotenv').config();

const EMBEDDING_URL =
    'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings';

// 准备：一段"知识库"（模拟文档切成的块）+ 一个"用户问题"
const documents = [
    '员工入职满一年后享有 5 天带薪年假，入职满三年享有 10 天年假',
    '病假需提供医院证明，连续超过 3 天需部门负责人审批',
    '员工在 OA 系统提交请假申请后，直属上级 1 个工作日内审批',
    '公司食堂午餐时间为 11:30 到 13:00，提供中餐和西餐',
];

const query = '年假有多少天';

// 调用通义千问 Embedding API，把文本转成向量
async function getEmbedding(text) {
    const response = await axios.post(
        EMBEDDING_URL,
        {
            model: 'text-embedding-v3',
            input: text,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.data[0].embedding; // 这就是 1024 维向量
}

// 计算两个向量的余弦相似度
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
    console.log('🔍 用户问题：', query);
    console.log('');

    // 把所有文档块转成向量
    const docEmbeddings = [];
    for (const doc of documents) {
        const vec = await getEmbedding(doc);
        docEmbeddings.push({ text: doc, vector: vec });
        console.log('✅ 已向量化：', doc.substring(0, 30) + '...');
    }

    // 把用户问题也转成向量
    const queryVec = await getEmbedding(query);

    // 计算每个文档块与问题的相似度
    console.log('\n📊 语义相似度排名：\n');
    const results = docEmbeddings.map((doc) => ({
        text: doc.text,
        score: cosineSimilarity(queryVec, doc.vector),
    }));

    results.sort((a, b) => b.score - a.score);

    results.forEach((r, i) => {
        const bar = '█'.repeat(Math.round(r.score * 50));
        console.log(
            `${i + 1}. [${r.score.toFixed(4)}] ${bar}`
        );
        console.log(`   ${r.text}\n`);
    });
}

main();
