const fs = require('fs');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

// 读文件
const text = fs.readFileSync('./data/test.md', 'utf-8');

async function main() {
    // 创建分块器
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,      // 每块最多 500 个字符
        chunkOverlap: 100,   // 块与块之间重叠 100 字符
        separators: ['\n## ', '\n# ', '\n', '。', '.', ' '],  // 优先按标题/段落切
    });

    // 执行分块
    const chunks = await splitter.createDocuments(
        [text],                                    // 要切的文本
        [{ source: 'test.md', type: 'policy' }]    // 元数据（后续检索时会用到）
    );

    // 打印结果
    console.log(`📄 文档切成了 ${chunks.length} 块：\n`);
    chunks.forEach((chunk, i) => {
        console.log(`--- 块 ${i + 1} ---`);
        console.log(chunk.pageContent);
        console.log(`元数据:`, chunk.metadata, '\n');
    });
}

main();
