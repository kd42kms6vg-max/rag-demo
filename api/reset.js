// api/reset.js — 重置指定会话的对话历史
const { resetSession } = require('./_lib/sessions');

module.exports = (req, res) => {
  const sid = (req.query.sid || '').trim();
  if (sid) resetSession(sid);
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: true }));
};
