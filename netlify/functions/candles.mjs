// Candles of remembrance: a shared list kept in Netlify Blobs.
// GET returns the latest candles; POST {n} lights a new one (first name only).
import { getStore } from '@netlify/blobs';

const MAX = 400;
const BLOCK = /(http|www\.|\.com|fuck|shit|cunt|nigg|fag|bitch|porn|sex)/i;
const clean = t => String(t || '').replace(/[^\p{L}\p{M}' .-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 30);
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async (req) => {
  const store = getStore('candles');
  const list = (await store.get('list', { type: 'json' })) || [];
  if (req.method === 'GET') return json({ candles: list.slice(-MAX) });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let body = {};
  try { body = await req.json(); } catch {}
  let n = clean(body.n);
  if (!n || BLOCK.test(n)) n = 'Someone dear';
  const t = Date.now();
  list.push({ n, t });
  const trimmed = list.slice(-MAX);
  await store.setJSON('list', trimmed);
  return json({ candles: trimmed });
};
