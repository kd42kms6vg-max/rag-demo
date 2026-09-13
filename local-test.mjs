// local-test.mjs — 本地模拟 EdgeOne Node Functions 运行时，部署前全链路验证
// 用法：node local-test.mjs，然后浏览器打开 http://localhost:3100
//   - 静态页面：public/ 目录（前端界面）
//   - API 路由：/health、/ai/reset、/ai/rag/stream
//   - 加载的是 node-functions/ 下的代码，即线上 EdgeOne 真正运行的那一份
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { onRequest as healthFn } from './node-functions/health.js';
import { onRequest as resetFn } from './node-functions/ai/reset.js';
import { onRequest as ragStreamFn } from './node-functions/ai/rag/stream.js';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const PUBLIC_DIR = path.join(ROOT, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

let apiKey = '';
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^\s*DASHSCOPE_API_KEY\s*=\s*(.+?)\s*$/);
  if (m) apiKey = m[1].trim();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3100');
  let fn = null;
  if (url.pathname === '/health') fn = healthFn;
  else if (url.pathname === '/ai/reset') fn = resetFn;
  else if (url.pathname === '/ai/rag/stream') fn = ragStreamFn;

  // 静态文件：托管前端页面
  if (!fn) {
    const rel = url.pathname === '/' ? '/index.html' : url.pathname;
    const full = path.join(PUBLIC_DIR, rel);
    if (full.startsWith(PUBLIC_DIR) && fs.existsSync(full) && fs.statSync(full).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
      return res.end(fs.readFileSync(full));
    }
    res.writeHead(404); return res.end('not found');
  }

  try {
    const webReq = new Request(url.href, { method: req.method });
    const resp = await fn({ request: webReq, env: { DASHSCOPE_API_KEY: apiKey } });
    res.writeHead(resp.status, Object.fromEntries(resp.headers));
    if (resp.body) {
      const reader = resp.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (e) {
    console.error('[test] handler error:', e);
    res.writeHead(500); res.end('error: ' + e.message);
  }
});

server.listen(3100, () => console.log('[test] 本地服务器已启动: http://localhost:3100'));
