// local-test.mjs — 本地模拟 EdgeOne Node Functions 运行时，部署前全链路验证
// 用法：node local-test.mjs，另开终端访问 http://localhost:3100/health 等
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { onRequest as healthFn } from './deploy-edgeone/node-functions/health.js';
import { onRequest as resetFn } from './deploy-edgeone/node-functions/ai/reset.js';
import { onRequest as ragStreamFn } from './deploy-edgeone/node-functions/ai/rag/stream.js';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
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
  if (!fn) { res.writeHead(404); return res.end('not found'); }
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

server.listen(3100, () => console.log('[test] EdgeOne 模拟服务器已启动: http://localhost:3100'));
