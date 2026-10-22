// Browser side of the sponsor card: one lazy request to the game's own /api/sponsors adapter per visit, validated
// again here, one stable placement per visit, and YOUR AD HERE whenever nothing valid is available.
// The request carries no wallet, score or identifier; the card is never fetched in kids mode or in paid play.
import { type Sponsor, validateSponsors } from '../../api/_policy.mjs';

export type Placement = { kind: 'sponsor'; sponsor: Sponsor } | { kind: 'empty' };

const MAX_BYTES = 64 * 1024;
let chosen: Promise<Placement> | null = null;

async function load(fetchImpl: typeof fetch, now: () => number): Promise<Placement> {
  try {
    const r = await fetchImpl('/api/sponsors', { credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(4000), headers: { accept: 'application/json' } });
    if (!r.ok || !/application\/json/i.test(r.headers.get('content-type') ?? '')) return { kind: 'empty' };
    const text = await r.text();
    if (text.length > MAX_BYTES) return { kind: 'empty' };
    const list = validateSponsors(JSON.parse(text), now());
    if (!list.length) return { kind: 'empty' };
    return { kind: 'sponsor', sponsor: list[Math.floor(Math.random() * list.length)] };
  } catch {
    return { kind: 'empty' };
  }
}

/** The placement for this visit: fetched on the first call, then reused (never rotated during a round). */
export function placement(fetchImpl: typeof fetch = fetch, now: () => number = Date.now): Promise<Placement> {
  chosen ??= load(fetchImpl, now);
  return chosen;
}

/** Re-check expiry at render, foreground and click time: an expired sponsor becomes the empty card, never a replacement. */
export function stillValid(p: Placement, now: number = Date.now()): Placement {
  return p.kind === 'sponsor' && p.sponsor.expiresAt <= now ? { kind: 'empty' } : p;
}

export function resetForTests(): void { chosen = null; }
