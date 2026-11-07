// Minimal Upstash Redis REST client (works with Vercel's Upstash / KV integration env vars).
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const hasRedis = () => Boolean(URL_ && TOKEN);

export async function redis(...command) {
  if (!hasRedis()) throw new Error('storage_not_configured');
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) throw new Error(body.error || `redis_${res.status}`);
  return body.result;
}

// Count a request against a daily budget. Returns true when the request is allowed.
export async function allow(key, limit) {
  if (!hasRedis()) return true; // no storage: rely on the Anthropic spending limit
  const day = new Date().toISOString().slice(0, 10);
  const k = `rl:${key}:${day}`;
  const n = await redis('INCR', k);
  if (n === 1) await redis('EXPIRE', k, 90000);
  return n <= limit;
}
