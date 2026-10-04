// Client-side access check for a bag. This is UX only: downloaded code/assets are not protected
// and scores are not proven. Server-side wallet challenge + fresh evidence are needed to protect content.
import { ACCESS_POLICY, BAG_ACCESS, type BagAccessRule, DEVFRIDGE, isBagLive, PASS_ACCESS } from './bags.config';
import { evaluateTimelocks, type LockEvidence, toRawAmount } from './timelock';

export type AccessState =
  | { kind: 'free' }
  | { kind: 'not_configured' }
  | { kind: 'no_wallet' }
  | { kind: 'checking' }
  | { kind: 'unlocked'; until: number | null; checkedAt: number; nextCheckAt: number; via: 'pass' | 'bag' }
  | { kind: 'locked'; checkedAt: number }
  | { kind: 'unavailable'; reason: string };

export function ruleFor(bagId: string): BagAccessRule | null {
  return BAG_ACCESS.find((r) => r.bagId === bagId) ?? null;
}

/** The interim PASTA master pass, when configured and verified. */
export const passRule = (): BagAccessRule | null => (isBagLive(PASS_ACCESS) ? PASS_ACCESS : null);

/** Rules that can unlock a bag right now: the master pass and/or the bag's own token. */
export function liveRules(bagId: string): BagAccessRule[] {
  if (bagId === 'base') return [];
  return [passRule(), ruleFor(bagId)].filter((r): r is BagAccessRule => !!r && isBagLive(r));
}

/** True when the bag is free or at least one lock rule is configured for it (so it is not "coming soon"). */
export const isAccessLive = (bagId: string): boolean => bagId === 'base' || liveRules(bagId).length > 0;

const inflight = new Map<string, Promise<AccessState>>();
let backoffUntil = 0;

async function checkRule(rule: BagAccessRule, wallet: string, via: 'pass' | 'bag', fetchImpl: typeof fetch): Promise<AccessState> {
  if (Date.now() < backoffUntil) return { kind: 'unavailable', reason: 'rate_limited' };
  const key = `${wallet}:${rule.mint}:${via}`;
  const existing = inflight.get(key);
  if (existing) return existing;
  const p = (async (): Promise<AccessState> => {
    try {
      const url = `${DEVFRIDGE.checkApi}?wallet=${encodeURIComponent(wallet)}&mint=${encodeURIComponent(rule.mint!)}`;
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(15_000) });
      if (res.status === 429) { backoffUntil = Date.now() + 60_000; return { kind: 'unavailable', reason: 'rate_limited' }; }
      if (!res.ok) return { kind: 'unavailable', reason: `http_${res.status}` };
      const evidence = (await res.json()) as LockEvidence;
      const now = Math.floor(Date.now() / 1000);
      const d = evaluateTimelocks(evidence, {
        wallet, mint: rule.mint!, minimumRaw: toRawAmount(rule.minimumTokens!, rule.decimals!),
        minOriginalSeconds: ACCESS_POLICY.minOriginalSeconds, minRemainingSeconds: ACCESS_POLICY.minRemainingSeconds,
        maxAgeSeconds: ACCESS_POLICY.maxAgeSeconds, aggregation: rule.aggregation ?? ACCESS_POLICY.aggregation,
      }, now);
      // errors mean "unavailable", never "zero holdings"
      return d.eligible ? { kind: 'unlocked', until: d.latestUnlockAt, checkedAt: now, nextCheckAt: d.nextCheckAt, via } : { kind: 'locked', checkedAt: now };
    } catch (e) {
      return { kind: 'unavailable', reason: e instanceof Error ? e.message : 'error' };
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

/** Access to the PASTA master pass alone (used to unlock every bag at once). */
export async function checkPass(wallet: string | null, fetchImpl: typeof fetch = fetch): Promise<AccessState> {
  const rule = passRule();
  if (!rule) return { kind: 'not_configured' };
  if (!wallet) return { kind: 'no_wallet' };
  return checkRule(rule, wallet, 'pass', fetchImpl);
}

/** A bag unlocks with the PASTA master pass OR with its own token lock. An unreadable rule never counts as "locked". */
export async function checkBag(bagId: string, wallet: string | null, fetchImpl: typeof fetch = fetch): Promise<AccessState> {
  if (bagId === 'base') return { kind: 'free' };
  const rules = liveRules(bagId);
  if (!rules.length) return { kind: 'not_configured' };
  if (!wallet) return { kind: 'no_wallet' };
  const results = await Promise.all(rules.map((r) => checkRule(r, wallet, r === PASS_ACCESS ? 'pass' : 'bag', fetchImpl)));
  const ok = results.filter((r): r is Extract<AccessState, { kind: 'unlocked' }> => r.kind === 'unlocked');
  if (ok.length) {
    // when both rules qualify, report the one that stays valid longest
    return ok.reduce((a, b) => ((b.until ?? 0) > (a.until ?? 0) ? b : a));
  }
  const bad = results.find((r) => r.kind === 'unavailable');
  return bad ?? { kind: 'locked', checkedAt: Math.floor(Date.now() / 1000) };
}
