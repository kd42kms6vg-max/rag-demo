module.exports = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: true, ts: Date.now(), hasKey: !!process.env.DASHSCOPE_API_KEY }));
};