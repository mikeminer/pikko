// TypeScript port of the DevFridge skill's tested evaluator (assets/timelock-gate.mjs).
// Pure evidence evaluation: it does not authenticate wallets, prove chain data or protect content.
const U64_MAX = (1n << 64n) - 1n;

export function toRawAmount(value: string, decimals: number): bigint {
  if (typeof value !== 'string' || value.length > 100 || !/^\d+(\.\d+)?$/.test(value)) throw Error('Use a decimal token string without commas');
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) throw Error('Verify token decimals');
  const [whole, fraction = ''] = value.split('.');
  if (fraction.length > decimals) throw Error('Too many decimal places');
  const raw = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0') || '0');
  if (raw <= 0n || raw > U64_MAX) throw Error('Amount must fit a positive Solana token balance');
  return raw;
}

export interface LockEvidence {
  wallet: string;
  mint: string;
  ts: number;
  activeLocks: Array<{ address: string; depositor: string; mint: string; amount: string; createdAt: number; unlockAt: number }>;
}

export interface LockPolicy {
  wallet: string;
  mint: string;
  minimumRaw: bigint;
  minOriginalSeconds?: number;
  minRemainingSeconds?: number;
  maxAgeSeconds?: number;
  aggregation?: 'sum' | 'single';
}

export interface LockDecision { eligible: boolean; totalRaw: bigint; largestRaw: bigint; nextCheckAt: number; latestUnlockAt: number | null }

export function evaluateTimelocks(evidence: LockEvidence, policy: LockPolicy, now = Math.floor(Date.now() / 1000)): LockDecision {
  const { wallet, mint, minimumRaw, minOriginalSeconds = 0, minRemainingSeconds = 0, maxAgeSeconds = 90, aggregation = 'sum' } = policy;
  if (!['sum', 'single'].includes(aggregation)) throw Error('Choose sum or single-lock aggregation');
  if (!wallet || !mint || typeof minimumRaw !== 'bigint' || minimumRaw <= 0n || minimumRaw > U64_MAX) throw Error('Configure a verified wallet, mint and positive raw minimum');
  for (const n of [now, minOriginalSeconds, minRemainingSeconds, maxAgeSeconds]) {
    if (!Number.isSafeInteger(n) || n < 0) throw Error('Invalid time policy');
  }
  if (!evidence || evidence.wallet !== wallet || evidence.mint !== mint || !Array.isArray(evidence.activeLocks)) throw Error('Lock evidence identity mismatch');
  if (!Number.isSafeInteger(evidence.ts) || evidence.ts > now + 5 || now - evidence.ts > maxAgeSeconds) throw Error('Lock evidence is stale or has an invalid timestamp');
  const ids = new Set<string>();
  let totalRaw = 0n;
  let largestRaw = 0n;
  let latestUnlockAt: number | null = null;
  let nextCheckAt = Math.min(now + maxAgeSeconds + 1, evidence.ts + maxAgeSeconds + 1);
  for (const lock of evidence.activeLocks) {
    if (!lock || typeof lock.address !== 'string' || !lock.address || ids.has(lock.address)) throw Error('Missing or duplicate lock address');
    ids.add(lock.address);
    if (lock.depositor !== wallet || lock.mint !== mint) throw Error('Lock owner or mint mismatch');
    if (typeof lock.amount !== 'string' || !/^\d{1,20}$/.test(lock.amount) || BigInt(lock.amount) > U64_MAX) throw Error('Invalid raw lock amount');
    if (!Number.isSafeInteger(lock.createdAt) || !Number.isSafeInteger(lock.unlockAt) || lock.createdAt < 0 || lock.createdAt > now + 5 || lock.unlockAt <= lock.createdAt) throw Error('Invalid lock times');
    if (lock.unlockAt <= now || lock.unlockAt - now < minRemainingSeconds || lock.unlockAt - lock.createdAt < minOriginalSeconds) continue;
    const amount = BigInt(lock.amount);
    totalRaw += amount;
    largestRaw = amount > largestRaw ? amount : largestRaw;
    latestUnlockAt = latestUnlockAt === null ? lock.unlockAt : Math.max(latestUnlockAt, lock.unlockAt);
    nextCheckAt = Math.min(nextCheckAt, lock.unlockAt, lock.unlockAt - minRemainingSeconds + 1);
  }
  return { eligible: (aggregation === 'single' ? largestRaw : totalRaw) >= minimumRaw, totalRaw, largestRaw, nextCheckAt, latestUnlockAt };
}
