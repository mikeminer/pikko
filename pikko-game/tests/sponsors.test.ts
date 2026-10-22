// Grown-ups mode: when the two promotions appear, and the sponsor feed validation / adapter / client.
// Fixtures only: no network, no real sponsor, nothing bought.
import { describe, expect, it, beforeEach } from 'vitest';
import { cleanText, isMint, normalizeRecord, validateFeed, validateSponsors, validLogo } from '../api/_policy.mjs';
import { createSponsorsHandler, UPSTREAM } from '../api/sponsors.mjs';
import { placement, resetForTests, stillValid } from '../src/sponsors/client';
import { promoDue, sponsorVisible } from '../src/sponsors/promo';

const NOW = 1_800_000_000_000;
const MINT = '39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump';
const MINT2 = '9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6';
const CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
const rec = (o: Record<string, unknown> = {}) => ({ mint: MINT, name: 'Pasta Coin', symbol: '$PASTA', image: `/api/logo?cid=${CID}`, expiresAt: NOW + 3_600_000, tier: 1, payer: 'x', signature: 'y', ...o });

describe('when the promotions appear', () => {
  const cfg = (o = {}) => ({ mode: 'classic' as const, bagId: 'base', trial: false, ...o });
  it('grown-ups mode: before every round, in any bag (the Mart is open)', () => {
    expect(promoDue(cfg(), false)).toBe(true);
    expect(promoDue(cfg({ bagId: 'italy' }), false)).toBe(true);
    expect(promoDue(cfg({ bagId: 'italy', trial: true }), false)).toBe(true);
    expect(promoDue(cfg({ mode: 'daily' }), false)).toBe(true);
  });
  it('kids mode: never, in any bag (paid or locked rounds carry no promotion)', () => {
    expect(promoDue(cfg(), true)).toBe(false);
    expect(promoDue(cfg({ bagId: 'italy' }), true)).toBe(false);
  });
  it('never in the tutorial practice', () => {
    expect(promoDue(cfg({ script: [['apple', 'crisps']] }), false)).toBe(false);
  });
  it('the sponsor card: title and promoted runs in grown-ups mode only', () => {
    const v = (kidMode: boolean, screen: string, lastRunPromoted: boolean) => sponsorVisible({ kidMode, screen, lastRunPromoted });
    expect(v(true, 'title', true)).toBe(false);
    expect(v(true, 'none', true)).toBe(false);
    expect(v(false, 'title', false)).toBe(true);
    expect(v(false, 'none', true)).toBe(true);
    expect(v(false, 'pause', true)).toBe(true);
    expect(v(false, 'results', true)).toBe(true);
    for (const s of ['tutorial', 'languages', 'promo', 'unlock', 'adult', 'settings', 'mode', 'mart', 'recipes']) expect(v(false, s, true), s).toBe(false);
    expect(v(false, 'none', false)).toBe(false); // the tutorial practice (not promoted)
  });
});

describe('sponsor validation', () => {
  it('recognises 32-byte base58 mints only', () => {
    expect(isMint(MINT)).toBe(true);
    expect(isMint(MINT2)).toBe(true);
    expect(isMint('11111111111111111111111111111111')).toBe(true);
    for (const bad of ['', 'abc', MINT.slice(4), `${MINT}1`, MINT.replace('k', '0'), 12, null]) expect(isMint(bad as never)).toBe(false);
  });
  it('cleans text: markup, control, bidi and invisible characters out, bounded length', () => {
    expect(cleanText('<img src=x onerror=alert(1)>Pasta‮Coin​  \n now', 64)).toBe('Pasta Coin now');
    expect(cleanText('x'.repeat(100), 64).length).toBe(64);
    expect(cleanText(5 as never, 10)).toBe('');
  });
  it('normalises a record and builds the destination locally', () => {
    const s = normalizeRecord(rec({ url: 'https://evil.example/' }), NOW)!;
    expect(s.symbol).toBe('PASTA');
    expect(s.url).toBe(`https://scan.devfridge.cool/t/${MINT}`);
    expect(s.logo).toBe(`https://scan.devfridge.cool/api/logo?cid=${CID}&mint=${MINT}&v=3`);
    expect(normalizeRecord(rec({ name: '', symbol: '' }), NOW)).toMatchObject({ name: `Token ${MINT.slice(0, 4)}`, symbol: MINT.slice(0, 4) });
  });
  it('drops expired, malformed and unsafe records', () => {
    expect(normalizeRecord(rec({ expiresAt: NOW }), NOW)).toBeNull();
    expect(normalizeRecord(rec({ expiresAt: NOW + 0.5 }), NOW)).toBeNull();
    expect(normalizeRecord(rec({ expiresAt: '99999999999999' }), NOW)).toBeNull();
    expect(normalizeRecord(rec({ mint: 'nope' }), NOW)).toBeNull();
    expect(normalizeRecord(null, NOW)).toBeNull();
  });
  it('accepts logos only through the Scan /api/logo proxy, with local mint and version', () => {
    const ok = (u: string) => validLogo(u, MINT);
    expect(ok(`/api/logo?cid=${CID}&path=/img.png&mint=OTHER&v=1`)).toBe(`https://scan.devfridge.cool/api/logo?cid=${CID}&path=%2Fimg.png&mint=${MINT}&v=3`);
    expect(ok('https://scan.devfridge.cool/api/logo?url=https%3A%2F%2Fcdn.example.com%2Fa.png')).toContain('url=https%3A%2F%2Fcdn.example.com%2Fa.png');
    for (const bad of [
      'https://evil.example/api/logo?cid=' + CID, 'http://scan.devfridge.cool/api/logo?cid=' + CID, 'https://scan.devfridge.cool:8443/api/logo?cid=' + CID,
      'https://user:pw@scan.devfridge.cool/api/logo?cid=' + CID, 'https://scan.devfridge.cool/api/logo?cid=' + CID + '#x', 'https://scan.devfridge.cool/other?cid=' + CID,
      '/api/logo', '/api/logo?cid=short', `/api/logo?cid=${CID}&cid=${CID}`, `/api/logo?cid=${CID}&evil=1`, `/api/logo?cid=${CID}&path=//x`, `/api/logo?cid=${CID}&path=x`,
      '/api/logo?url=http%3A%2F%2Fcdn.example.com%2Fa.png', '/api/logo?url=https%3A%2F%2F10.0.0.1%2Fa.png', '/api/logo?url=https%3A%2F%2Flocalhost%2Fa.png', '/api/logo?url=https%3A%2F%2Fu%3Ap%40cdn.example.com%2Fa.png',
      `/api/logo?cid=${CID}\\x`, `/api/logo?cid=${CID} x`, `/api/logo?cid=${CID}&path=` + '/a'.repeat(300), 'x'.repeat(3000),
    ]) expect(ok(bad), bad.slice(0, 60)).toBeNull();
    expect(validLogo(null as never, MINT)).toBeNull();
  });
  it('keeps at most 12 unique mints out of at most 256 candidates', () => {
    const many = Array.from({ length: 300 }, () => rec());
    expect(validateFeed({ tokens: many }, NOW)).toHaveLength(1); // duplicates collapse
    expect(validateFeed({ tokens: [rec(), rec({ mint: MINT2 })] }, NOW).map((s) => s.mint)).toEqual([MINT, MINT2]);
    expect(validateFeed({ tokens: 'x' }, NOW)).toEqual([]);
    expect(validateFeed(null, NOW)).toEqual([]);
    expect(validateSponsors({ sponsors: [{ mint: MINT, name: 'A', symbol: 'A', logo: null, expiresAt: NOW + 1 }] }, NOW)).toHaveLength(1);
  });
});

function fakeRes() {
  const r = { statusCode: 0, headers: {} as Record<string, string>, body: '', setHeader(k: string, v: string) { r.headers[k.toLowerCase()] = v; }, end(b: string) { r.body = b; } };
  return r;
}
const feedResponse = (body: unknown, init: { status?: number; type?: string; length?: string } = {}) => {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(text, { status: init.status ?? 200, headers: { 'content-type': init.type ?? 'application/json', ...(init.length ? { 'content-length': init.length } : {}) } });
};

describe('same-origin adapter /api/sponsors', () => {
  it('serves validated sponsors with a CDN lifetime equal to the snapshot remaining time', async () => {
    let t = NOW;
    let calls = 0;
    const h = createSponsorsHandler({ now: () => t, fetchImpl: (async (url: string, init: RequestInit) => { calls++; expect(url).toBe(UPSTREAM); expect(init.redirect).toBe('error'); return feedResponse({ tokens: [rec()] }); }) as never });
    const a = fakeRes();
    await h({ method: 'GET' } as never, a as never);
    expect(a.statusCode).toBe(200);
    expect(JSON.parse(a.body).sponsors).toHaveLength(1);
    expect(a.headers['cache-control']).toBe('public, max-age=0, s-maxage=60, must-revalidate');
    t += 20_000;
    const b = fakeRes();
    await h({ method: 'GET' } as never, b as never);
    expect(calls).toBe(1); // cached for 60 s
    expect(b.headers['cache-control']).toContain('s-maxage=40');
    t += 41_000; // past 60 s: refreshed
    await h({ method: 'GET' } as never, fakeRes() as never);
    expect(calls).toBe(2);
  });
  it('shares one refresh between concurrent callers', async () => {
    let calls = 0;
    const h = createSponsorsHandler({ now: () => NOW, fetchImpl: (async () => { calls++; await new Promise((r) => setTimeout(r, 5)); return feedResponse({ tokens: [rec()] }); }) as never });
    await Promise.all([1, 2, 3].map(() => h({ method: 'GET' } as never, fakeRes() as never)));
    expect(calls).toBe(1);
  });
  it('drops an expired record from a cached snapshot without fetching again', async () => {
    let t = NOW;
    let calls = 0;
    const h = createSponsorsHandler({ now: () => t, fetchImpl: (async () => { calls++; return feedResponse({ tokens: [rec({ expiresAt: NOW + 10_000 })] }); }) as never });
    await h({ method: 'GET' } as never, fakeRes() as never);
    t += 15_000;
    const r = fakeRes();
    await h({ method: 'GET' } as never, r as never);
    expect(JSON.parse(r.body).sponsors).toEqual([]);
    expect(calls).toBe(1);
  });
  it('failures become an empty list (cached 60 s), never an old placement', async () => {
    for (const make of [
      () => feedResponse('<html>', { type: 'text/html' }),
      () => feedResponse({ tokens: [] }, { status: 500 }),
      () => feedResponse('{"tokens":', {}),
      () => feedResponse({ tokens: [rec()] }, { length: String(10 * 1024 * 1024) }),
      () => feedResponse(JSON.stringify({ tokens: [rec()], pad: 'x'.repeat(200 * 1024) })),
    ]) {
      const h = createSponsorsHandler({ now: () => NOW, fetchImpl: (async () => make()) as never });
      const r = fakeRes();
      await h({ method: 'GET' } as never, r as never);
      expect(JSON.parse(r.body).sponsors).toEqual([]);
    }
    const down = createSponsorsHandler({ now: () => NOW, fetchImpl: (async () => { throw new Error('redirect'); }) as never });
    const r = fakeRes();
    await down({ method: 'GET' } as never, r as never);
    expect(JSON.parse(r.body).sponsors).toEqual([]);
  });
  it('is GET/HEAD only, JSON, nosniff, and sends nothing about the player', async () => {
    const seen: RequestInit[] = [];
    const h = createSponsorsHandler({ now: () => NOW, fetchImpl: (async (_u: string, i: RequestInit) => { seen.push(i); return feedResponse({ tokens: [] }); }) as never });
    const post = fakeRes();
    await h({ method: 'POST' } as never, post as never);
    expect(post.statusCode).toBe(405);
    const g = fakeRes();
    await h({ method: 'GET', headers: { cookie: 'secret=1' } } as never, g as never);
    expect(g.headers['x-content-type-options']).toBe('nosniff');
    expect(g.headers['content-type']).toContain('application/json');
    expect(JSON.stringify(seen[0])).not.toContain('secret');
  });
});

describe('browser client', () => {
  beforeEach(() => resetForTests());
  const okFetch = (body: unknown, status = 200, type = 'application/json') => (async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': type } })) as unknown as typeof fetch;
  it('shows a valid sponsor, once per visit, and revalidates what the adapter sent', async () => {
    let n = 0;
    const f = (async () => { n++; return new Response(JSON.stringify({ sponsors: [{ mint: MINT, name: '<b>X</b>', symbol: '$X', logo: 'https://evil.example/a.png', url: 'https://evil.example/', expiresAt: NOW + 5000 }, { mint: 'bad', expiresAt: NOW + 5000 }] }), { headers: { 'content-type': 'application/json' } }); }) as unknown as typeof fetch;
    const p = await placement(f, () => NOW);
    expect(p).toMatchObject({ kind: 'sponsor', sponsor: { mint: MINT, name: 'X', symbol: 'X', logo: null, url: `https://scan.devfridge.cool/t/${MINT}` } });
    expect(await placement(f, () => NOW)).toBe(p); // stable
    expect(n).toBe(1);
  });
  it('anything wrong means YOUR AD HERE (empty), never an error', async () => {
    for (const f of [okFetch({ sponsors: [] }), okFetch('x', 200, 'text/html'), okFetch({}, 404), okFetch('{"sponsors":'), (async () => { throw new Error('offline'); }) as unknown as typeof fetch]) {
      resetForTests();
      expect(await placement(f, () => NOW)).toEqual({ kind: 'empty' });
    }
  });
  it('an expired sponsor turns into the empty card; it is never replaced by another', () => {
    const p = { kind: 'sponsor' as const, sponsor: { mint: MINT, name: 'A', symbol: 'A', logo: null, url: 'u', expiresAt: NOW + 1000 } };
    expect(stillValid(p, NOW)).toBe(p);
    expect(stillValid(p, NOW + 1000)).toEqual({ kind: 'empty' });
  });
});
