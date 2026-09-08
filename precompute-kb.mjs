// precompute-kb.mjs — 知识库向量预计算脚本（本地运行，部署前执行一次）
// 用法：在 rag-demo 目录下  node precompute-kb.mjs
// 读取 .env 中的 DASHSCOPE_API_KEY，将 data/test.md 按 api/rag.js 完全一致的分块逻辑
// 切块并向量化，输出 deploy-edgeone/node-functions/ai/_kb-data.js
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// ── 读取 .env（手写解析，不依赖 dotenv）──
function loadEnvKey() {
  if (process.env.DASHSCOPE_API_KEY) return process.env.DASHSCOPE_API_KEY;
  const envPath = path.join(ROOT, '.env');
  const raw = fs.readFileSync(envPath, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*DASHSCOPE_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) return m[1].trim();
  }
  throw new Error('未找到 DASHSCOPE_API_KEY');
}

// ── HTTPS POST（与 api/rag.js 逻辑一致）──
function httpsPost(url, data, apiKey) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = ''; res.on('data', (c) => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error(d.substring(0, 200))); } });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body); req.end();
  });
}

// ── 分块（与 api/rag.js 的 chunkText 完全一致）──
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

// ── 主流程 ──
async function main() {
  const apiKey = loadEnvKey();
  const text = fs.readFileSync(path.join(ROOT, 'data', 'test.md'), 'utf-8');
  const chunks = chunkText(text, 300, 50);
  console.log('[kb] 知识库分块数:', chunks.length);

  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const res = await httpsPost(DASHSCOPE_BASE + '/embeddings', { model: 'text-embedding-v3', input: chunks[i] }, apiKey);
    vectors.push(res.data[0].embedding);
    console.log('[kb] 向量化进度:', i + 1 + '/' + chunks.length, '维度:', res.data[0].embedding.length);
  }

  const outDir = path.join(ROOT, 'deploy-edgeone', 'node-functions', 'ai');
  fs.mkdirSync(outDir, { recursive: true });
  const header = '// ⚠️ 自动生成文件：由 precompute-kb.mjs 生成（' + new Date().toISOString() + '），请勿手工编辑\n'
    + '// 知识库：data/test.md → ' + chunks.length + ' 个分块，向量维度 ' + vectors[0].length + '\n'
    + 'export const KB_CHUNKS = ' + JSON.stringify(chunks) + ';\n\n'
    + 'export const KB_VECTORS = ' + JSON.stringify(vectors) + ';\n';
  const outFile = path.join(outDir, '_kb-data.js');
  fs.writeFileSync(outFile, header, 'utf-8');
  console.log('[kb] 已写出:', outFile, '大小:', fs.statSync(outFile).size, '字节');
}

main().catch((e) => { console.error('[kb] 失败:', e.message); process.exit(1); });
