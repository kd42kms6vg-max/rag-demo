// node-functions/health.js — EdgeOne Pages Node Functions 健康检查
export async function onRequest(context) {
  const hasKey = !!(context?.env?.DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY);
  return new Response(JSON.stringify({ ok: true, ts: Date.now(), hasKey }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
}
