// Port of the DevFridge skill evaluator tests + PIKKO gate behaviour.
import { describe, expect, it } from 'vitest';
import { evaluateTimelocks, toRawAmount } from '../src/access/timelock';
import { checkBag, checkPass, isAccessLive } from '../src/access/gate';
import { BAG_ACCESS, isBagLive, PASS_ACCESS } from '../src/access/bags.config';

const now = 2_000_000_000;
const policy = { wallet: 'verified-wallet', mint: 'verified-mint', minimumRaw: 500_000_000_000n };
const lock = (address: string, amount: string, unlockAt = now + 60) => ({ address, depositor: policy.wallet, mint: policy.mint, amount, createdAt: now - 100, unlockAt });
const evidence = (...activeLocks: ReturnType<typeof lock>[]) => ({ wallet: policy.wallet, mint: policy.mint, ts: now, activeLocks });

describe('timelock evaluator', () => {
  it('decimal conversion stays exact', () => {
    expect(toRawAmount('9007199254.740993', 6)).toBe(9007199254740993n);
    expect(() => toRawAmount('1.0000001', 6)).toThrow();
    expect(() => toRawAmount('500,000', 6)).toThrow();
    expect(() => toRawAmount('0', 6)).toThrow();
  });
  it('aggregates same-mint locks; a lock expiring in 1 s still qualifies; threshold is exact', () => {
    const r = evaluateTimelocks(evidence(lock('a', '300000000000'), lock('b', '200000000000', now + 1)), policy, now);
    expect(r.eligible).toBe(true);
    expect(r.nextCheckAt).toBe(now + 1);
    expect(evaluateTimelocks(evidence(lock('a', '499999999999')), policy, now).eligible).toBe(false);
  });
  it('expired lock does not qualify', () => {
    expect(evaluateTimelocks(evidence(lock('a', '500000000000', now)), policy, now).eligible).toBe(false);
  });
  it('fails closed on foreign, duplicate, malformed or stale evidence', () => {
    const good = lock('a', '500000000000');
    expect(() => evaluateTimelocks(evidence(good, good), policy, now)).toThrow();
    expect(() => evaluateTimelocks(evidence({ ...good, depositor: 'other' }), policy, now)).toThrow();
    expect(() => evaluateTimelocks({ ...evidence(good), ts: now - 91 }, policy, now)).toThrow(/stale/);
    expect(() => evaluateTimelocks({ ...evidence(good), wallet: 'other' }, policy, now)).toThrow();
  });
});

const PASTA = '39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump';
const FIVE_M = '5000000000000'; // 5,000,000 PASTA, 6 decimals
const wallet = 'tester-wallet';
const nowS = () => Math.floor(Date.now() / 1000);
const pastaLock = (address: string, amount: string, unlockAt = nowS() + 86_400) => ({ address, depositor: wallet, mint: PASTA, amount, createdAt: nowS() - 100, unlockAt });
function fakeApi(locks: ReturnType<typeof pastaLock>[], opts: { ts?: number; status?: number } = {}) {
  const urls: string[] = [];
  const fn = (async (url: string) => {
    urls.push(String(url));
    if (opts.status) return new Response('{}', { status: opts.status });
    return new Response(JSON.stringify({ wallet, mint: PASTA, ts: opts.ts ?? nowS(), activeLocks: locks }));
  }) as unknown as typeof fetch;
  return { fn, urls };
}

describe('PASTA master pass (all bags, until the country tokens launch)', () => {
  it('is pinned to the verified PASTA mint, 6 decimals and 5,000,000 PASTA (raw 5e12)', () => {
    expect(PASS_ACCESS.mint).toBe(PASTA);
    expect(PASS_ACCESS.decimals).toBe(6);
    expect(PASS_ACCESS.minimumTokens).toBe('5000000');
    expect(toRawAmount(PASS_ACCESS.minimumTokens!, PASS_ACCESS.decimals!)).toBe(5_000_000_000_000n);
    expect(PASS_ACCESS.aggregation).toBe('single');
    expect(isBagLive(PASS_ACCESS)).toBe(true);
  });
  it('country tokens stay unconfigured (24 bags) but every bag is reachable through the pass', () => {
    expect(BAG_ACCESS).toHaveLength(24);
    expect(BAG_ACCESS.every((r) => !isBagLive(r))).toBe(true);
    expect(BAG_ACCESS.every((r) => isAccessLive(r.bagId))).toBe(true);
  });
  it('starter bag is free and never touches the network; no wallet means no network call either', async () => {
    const api = fakeApi([]);
    expect(await checkBag('base', null, api.fn)).toEqual({ kind: 'free' });
    expect(await checkBag('japan', null, api.fn)).toEqual({ kind: 'no_wallet' });
    expect(api.urls).toHaveLength(0);
  });
  it('one active lock of exactly 5,000,000 PASTA unlocks every country bag, checked against the PASTA mint', async () => {
    for (const bag of BAG_ACCESS.map((r) => r.bagId)) {
      const api = fakeApi([pastaLock('a', FIVE_M)]);
      const r = await checkBag(bag, wallet, api.fn);
      expect(r.kind, bag).toBe('unlocked');
      if (r.kind === 'unlocked') { expect(r.via).toBe('pass'); expect(r.until).not.toBeNull(); }
      expect(api.urls).toHaveLength(1);
      expect(api.urls[0]).toContain(`mint=${PASTA}`);
    }
  });
  it('one raw unit short, several small locks, an expired lock or no lock stay locked', async () => {
    expect((await checkBag('italy', wallet, fakeApi([pastaLock('a', '4999999999999')]).fn)).kind).toBe('locked');
    expect((await checkBag('italy', wallet, fakeApi([pastaLock('a', '3000000000000'), pastaLock('b', '3000000000000')]).fn)).kind).toBe('locked');
    expect((await checkBag('italy', wallet, fakeApi([pastaLock('a', FIVE_M, nowS() - 1)]).fn)).kind).toBe('locked');
    expect((await checkBag('italy', wallet, fakeApi([]).fn)).kind).toBe('locked');
  });
  it('errors and stale evidence are "unavailable", never "locked" or "unlocked"', async () => {
    expect((await checkBag('italy', wallet, fakeApi([pastaLock('a', FIVE_M)], { status: 500 }).fn)).kind).toBe('unavailable');
    expect((await checkBag('italy', wallet, fakeApi([pastaLock('a', FIVE_M)], { ts: nowS() - 600 }).fn)).kind).toBe('unavailable');
    expect((await checkBag('italy', wallet, fakeApi([{ ...pastaLock('a', FIVE_M), depositor: 'someone-else' }]).fn)).kind).toBe('unavailable');
  });
  it('checkPass reports the same decision without needing a bag', async () => {
    expect((await checkPass(wallet, fakeApi([pastaLock('a', FIVE_M)]).fn)).kind).toBe('unlocked');
    expect((await checkPass(null)).kind).toBe('no_wallet');
  });
});
