// Tiria's own journal. Readable and writable only with the owner passcode (OWNER_KEY).
import { redis, hasRedis } from './_lib/redis.js';
import { send, readJson, sameSecret } from './_lib/http.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  if (!sameSecret(req.headers['x-owner-key'], process.env.OWNER_KEY)) return send(res, 401, { error: 'wrong_passcode' });
  if (!hasRedis()) return send(res, 503, { error: 'storage_not_configured' });
  try {
    if (req.method === 'GET') {
      const flat = (await redis('HGETALL', 'journal')) || [];
      const entries = [];
      for (let i = 0; i < flat.length; i += 2) { try { entries.push(JSON.parse(flat[i + 1])); } catch (e) {} }
      return send(res, 200, { entries });
    }
    if (req.method === 'PUT') {
      const entry = await readJson(req);
      if (!entry || !DATE.test(entry.date) || !Array.isArray(entry.marks)) return send(res, 400, { error: 'bad_entry' });
      const json = JSON.stringify(entry);
      if (json.length > 60000) return send(res, 413, { error: 'too_large' });
      await redis('HSET', 'journal', entry.date, json);
      return send(res, 200, { ok: true });
    }
    if (req.method === 'DELETE') {
      const date = new URL(req.url, 'http://x').searchParams.get('date');
      if (!DATE.test(date || '')) return send(res, 400, { error: 'bad_date' });
      await redis('HDEL', 'journal', date);
      return send(res, 200, { ok: true });
    }
    return send(res, 405, { error: 'method_not_allowed' });
  } catch (e) {
    return send(res, e.message === 'too_large' ? 413 : 500, { error: e.message || 'server_error' });
  }
}
