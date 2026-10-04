// Per-bag access rules (GDD §13.4). Decided 2026-10-03: one Pump.fun token per country bag (logo in PIKKO_TOKEN_LOGOS/), any ACTIVE lock unlocks it.
// PLACEHOLDERS: no mint is configured yet. A bag becomes "live" only when ALL of these are filled in after
// verification (Token-2022 owner, decimals, extensions, Jupiter redemption route) — until then: trial mode only.
export interface BagAccessRule {
  bagId: string;
  mint: string | null;       // full base58 Pump.fun CA, never a ticker
  decimals: number | null;   // read from trusted RPC, never guessed
  minimumTokens: string | null; // decimal string; OPEN DECISION (GDD §13.4): without a minimum, dust locks would unlock
  verified: boolean;         // true only after the checks above
  aggregation?: 'sum' | 'single'; // default: ACCESS_POLICY.aggregation
}

const BAG_IDS = [
  'italy', 'poland', 'japan', 'mexico', 'usa', 'india', 'france', 'spain', 'greece', 'turkey',
  'china', 'korea', 'thailand', 'vietnam', 'brazil', 'peru', 'morocco', 'uk', 'germany', 'nigeria',
  'indonesia', 'russia', 'ukraine', 'philippines', // added 2026-10-04 with the id/ru/uk/fil languages
];

export const BAG_ACCESS: BagAccessRule[] = BAG_IDS.map((bagId) => ({ bagId, mint: null, decimals: null, minimumTokens: null, verified: false }));

/**
 * Interim "master pass" (decided 2026-10-04): until the single-country tokens launch, ONE active DevFridge lock of
 * 5,000,000 PASTA unlocks EVERY bag. It stays valid after the country tokens exist (either rule unlocks a bag).
 * PASTA mint source: https://docs.devfridge.cool/tokenomics (the user's own project); on-chain check 2026-10-04 via
 * mainnet RPC: owner = Token-2022 program, decimals = 6, no mint/freeze authority, extensions = metadataPointer +
 * tokenMetadata only (name "pappardelle", symbol "PASTA"). PASTA locks are burned directly on redemption (no Jupiter route needed).
 * aggregation 'single': it must be one lock of at least 5,000,000 PASTA (not several small ones). Set 'sum' to allow combining.
 */
export const PASS_ACCESS: BagAccessRule = {
  bagId: '*',
  mint: '39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump',
  decimals: 6,
  minimumTokens: '5000000',
  verified: true,
  aggregation: 'single',
};

export const ACCESS_POLICY = {
  minOriginalSeconds: 0,    // decided: any lock duration
  minRemainingSeconds: 0,   // decided: the lock only needs to be active now
  aggregation: 'sum' as const,
  maxAgeSeconds: 90,
  recheckIntervalMs: 60_000,
};

export const DEVFRIDGE = {
  app: 'https://devfridge.cool',
  scan: 'https://scan.devfridge.cool',
  checkApi: 'https://scan.devfridge.cool/api/sdk/check',
  docsFridge: 'https://docs.devfridge.cool/fridge',
  program: '9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6',
};

export function isBagLive(rule: BagAccessRule): boolean {
  return !!(rule.verified && rule.mint && rule.decimals !== null && rule.minimumTokens);
}
