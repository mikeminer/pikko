// Same-origin adapter for the Free Play sponsor card (grown-ups mode only): GET /api/sponsors ->
//   { sponsors: [{ mint, name, symbol, logo, url, expiresAt }], fetchedAt }
// A Vercel function (Node runtime). The upstream URL is fixed; redirects, non-JSON and oversized bodies are refused;
// results (and failures) are cached for 60 s per warm instance and a refresh is shared by concurrent callers;
// an expired record is never returned. Nothing about the player is sent upstream: no wallet, score or identifier.
import { validateFeed } from './_policy.mjs';

export const UPSTREAM = 'https://scan.devfridge.cool/api/feed/boosted';
const TIMEOUT_MS = 4000;
const MAX_BYTES = 128 * 1024;
const TTL_MS = 60_000;

/** Read the body with a hard byte cap (the declared length is not trusted). */
async function readCapped(response, max) {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > max) throw new Error('too large');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('no body');
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel().catch(() => {}); throw new Error('too large'); }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
}

export function createSponsorsHandler({ fetchImpl = fetch, now = Date.now } = {}) {
  let cache = null; // { at, sponsors }
  let inflight = null;

  async function refresh() {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      const r = await fetchImpl(UPSTREAM, { redirect: 'error', signal: ctl.signal, headers: { accept: 'application/json' } });
      if (!r.ok || !/application\/json/i.test(r.headers.get('content-type') ?? '')) return [];
      return validateFeed(JSON.parse(await readCapped(r, MAX_BYTES)), now());
    } catch {
      return []; // a failed refresh never serves an old placement
    } finally {
      clearTimeout(timer);
    }
  }

  async function snapshot() {
    if (cache && now() - cache.at < TTL_MS && now() >= cache.at) return cache;
    inflight ??= refresh().then((sponsors) => { cache = { at: now(), sponsors }; return cache; }).finally(() => { inflight = null; });
    return inflight;
  }

  return async function handler(req, res) {
    const send = (status, headers, body) => {
      res.statusCode = status;
      for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
      res.end(body);
    };
    const base = { 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff' };
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, { ...base, allow: 'GET, HEAD', 'cache-control': 'no-store' }, '{"error":"method"}');
    try {
      const snap = await snapshot();
      const t = now();
      const sponsors = snap.sponsors.filter((s) => s.expiresAt > t); // expired records are dropped on every response
      const remaining = Math.max(0, Math.floor((TTL_MS - (t - snap.at)) / 1000));
      const fresh = t >= snap.at && remaining > 0;
      const cc = `public, max-age=0, s-maxage=${fresh ? remaining : 0}, must-revalidate`;
      return send(200, { ...base, 'cache-control': cc }, req.method === 'HEAD' ? '' : JSON.stringify({ sponsors, fetchedAt: snap.at }));
    } catch {
      return send(200, { ...base, 'cache-control': 'no-store' }, JSON.stringify({ sponsors: [], fetchedAt: now() }));
    }
  };
}

export default createSponsorsHandler();
