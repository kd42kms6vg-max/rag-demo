// 本地运行桥接服务器：纯本地启动 RAG demo，无需 Vercel 登录态 / VPN。
// 作用：托管 public/ 静态页 + 把 /ai/* 路由转发到 api/ 下的 Vercel 函数（它们已是标准 Node handler）。
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const ragHandler = require('./api/rag.js');
const healthHandler = require('./api/health.js');
const resetHandler = require('./api/reset.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? '/index.html' : pathname;
  const full = path.join(PUBLIC_DIR, rel);
  if (!full.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const url = new URL(req.url, `http://localhost:${PORT}`);
  req.query = Object.fromEntries(url.searchParams); // Vercel handler 读取 req.query
  const p = url.pathname;
  if (p === '/ai/rag/stream') return ragHandler(req, res);
  if (p === '/ai/health') return healthHandler(req, res);
  if (p === '/ai/reset') return resetHandler(req, res);
  return serveStatic(req, res, p);
});

server.listen(PORT, () => {
  console.log(`RAG demo 本地服务已启动: http://localhost:${PORT}`);
});
