// Validation for the Free Play sponsor placement (grown-ups mode only), shared by the same-origin adapter
// (api/sponsors.mjs, a Vercel function) and the game. Pure functions, no I/O.
// Contract: https://world.devfridge.cool/skill (references/free-play-sponsors.md, reviewed 2026-10-21).
// Everything that comes from the upstream feed is untrusted data: only identity, logo and expiry are kept,
// and every destination URL is built locally from the validated mint.

export const SCAN_ORIGIN = 'https://scan.devfridge.cool';
export const FEATURE_URL = `${SCAN_ORIGIN}/#feature`;
export const MAX_CANDIDATES = 256;
export const MAX_SPONSORS = 12;

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** A Solana address: base58 that decodes to exactly 32 bytes. */
export function isMint(s) {
  if (typeof s !== 'string' || s.length < 32 || s.length > 44) return false;
  let n = 0n;
  for (const ch of s) {
    const i = B58.indexOf(ch);
    if (i < 0) return false;
    n = n * 58n + BigInt(i);
  }
  let zeros = 0;
  for (const ch of s) { if (ch === '1') zeros++; else break; }
  const bytes = n === 0n ? 0 : Math.ceil(n.toString(16).length / 2);
  return zeros + bytes === 32;
}

/** Plain text for display: no markup, control or invisible/bidi characters, single spaces, bounded length. */
export function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  const s = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff\ufff9-\ufffb]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(s).slice(0, max).join('');
}

const BAD_CHARS = /[\u0000-\u0020\u007f-\u009f\\]/;
const LOCAL_HOST = /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.lan|metadata\.google\.internal)$/i;

function safeHttpsImage(raw) {
  if (typeof raw !== 'string' || raw.length > 2048 || BAD_CHARS.test(raw)) return false;
  let u;
  try { u = new URL(raw); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.password || u.hash || u.port) return false;
  const host = u.hostname.toLowerCase();
  if (!host.includes('.') || LOCAL_HOST.test(host)) return false;
  if (/^\d+(\.\d+){3}$/.test(host) || host.includes(':') || host.startsWith('[')) return false; // IP literals
  return true;
}

/**
 * A logo is accepted only through the Scan origin's /api/logo proxy. Returns a normalised URL (mint and v set
 * locally) or null.
 */
export function validLogo(raw, mint) {
  if (typeof raw !== 'string' || raw.length > 2048 || BAD_CHARS.test(raw)) return null;
  let u;
  try { u = new URL(raw, SCAN_ORIGIN); } catch { return null; }
  if (u.origin !== SCAN_ORIGIN || u.pathname !== '/api/logo' || u.username || u.password || u.hash || u.port) return null;
  const keys = [...u.searchParams.keys()];
  if (new Set(keys).size !== keys.length || keys.some((k) => !['cid', 'path', 'mint', 'url', 'v'].includes(k))) return null;
  const cid = u.searchParams.get('cid');
  const nested = u.searchParams.get('url');
  const path = u.searchParams.get('path');
  const cidOk = cid !== null && /^[A-Za-z0-9]{46,90}$/.test(cid);
  const nestedOk = nested !== null && safeHttpsImage(nested);
  if (!cidOk && !nestedOk) return null;
  if (cid !== null && !cidOk) return null;
  if (nested !== null && !nestedOk) return null;
  if (path !== null && (path.length > 512 || !path.startsWith('/') || path.startsWith('//') || /[?#\\\u0000-\u001f]/.test(path))) return null;
  const out = new URL('/api/logo', SCAN_ORIGIN);
  if (cidOk) out.searchParams.set('cid', cid);
  if (path !== null) out.searchParams.set('path', path);
  if (nestedOk) out.searchParams.set('url', nested);
  out.searchParams.set('mint', mint);
  out.searchParams.set('v', '3');
  return out.href;
}

/** One record (upstream `image` or adapter `logo`) -> the sponsor the game may show, or null. */
export function normalizeRecord(r, now) {
  if (!r || typeof r !== 'object') return null;
  const mint = r.mint;
  if (!isMint(mint)) return null;
  const expiresAt = r.expiresAt;
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return null;
  const name = cleanText(r.name, 64) || `Token ${mint.slice(0, 4)}`;
  const symbol = cleanText(r.symbol, 16).replace(/^\$+/, '').trim() || mint.slice(0, 4);
  return {
    mint,
    name,
    symbol,
    logo: validLogo(r.image ?? r.logo ?? null, mint),
    url: `${SCAN_ORIGIN}/t/${mint}`,
    expiresAt,
  };
}

function collect(list, now) {
  const out = [];
  const seen = new Set();
  for (const r of list.slice(0, MAX_CANDIDATES)) {
    const s = normalizeRecord(r, now);
    if (!s || seen.has(s.mint)) continue;
    seen.add(s.mint);
    out.push(s);
    if (out.length >= MAX_SPONSORS) break;
  }
  return out;
}

/** Upstream envelope `{ tokens: [...] }` -> sponsors. Anything malformed yields an empty list. */
export function validateFeed(json, now) {
  if (!json || typeof json !== 'object' || !Array.isArray(json.tokens)) return [];
  return collect(json.tokens, now);
}

/** The adapter's own envelope `{ sponsors: [...] }` (re-validated in the browser) -> sponsors. */
export function validateSponsors(json, now) {
  if (!json || typeof json !== 'object' || !Array.isArray(json.sponsors)) return [];
  return collect(json.sponsors, now);
}
