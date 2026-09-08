// node-functions/ai/reset.js — 重置指定会话的对话历史
// 注意：Node Functions 每个文件是独立实例，此处的 Map 与 rag/stream.js 不共享，
// 与 Vercel 版行为一致（"新对话"由前端轮换 sid 实现，旧 sid 自然废弃）。
const sessions = new Map();

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const sid = (url.searchParams.get('sid') || '').trim();
  if (sid) sessions.delete(sid);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
}
