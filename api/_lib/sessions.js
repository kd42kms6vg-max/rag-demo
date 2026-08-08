// api/_lib/sessions.js — 按会话隔离的对话历史
// 注意：Vercel 上每个 api/*.js 是独立 Serverless Function，内存互不相通。
// 因此本模块的 Map 仅在 api/rag.js 自身的热实例内有效；
// "新对话"通过前端轮换 sid 实现（旧 sid 被孤立），而非跨函数删除。

const sessions = new Map();
const MAX_SESSIONS = 2000; // 容量保护：超过后清理最早的一半，防止孤儿会话无限堆积

function getSessionHistory(sid) {
  if (!sessions.has(sid)) {
    sessions.set(sid, []);
    if (sessions.size > MAX_SESSIONS) {
      const toEvict = Math.floor(sessions.size / 2);
      let n = 0;
      for (const key of sessions.keys()) {
        if (n++ >= toEvict) break;
        sessions.delete(key);
      }
    }
  }
  return sessions.get(sid);
}

function resetSession(sid) {
  return sessions.delete(sid);
}

module.exports = { getSessionHistory, resetSession, _sessions: sessions };
