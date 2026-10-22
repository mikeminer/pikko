// Kids mode: an adult can pay 0.001 SOL for ONE round of a locked bag, as an alternative to a DevFridge timelock.
// A plain System Program transfer from the connected wallet to the game's address; the game then confirms it on-chain
// (succeeded, right amount, right sender and recipient, recent, never used before) before the round starts.
// Fail closed: any doubt means "not paid". Like the lock check this runs in the browser: it is a convenience, not security.
import { b58decode, buildTransfer } from './solana';

/** A DevFridge vault used to buy and burn PASTA (confirmed by the owner; on-chain it receives 0.001 SOL payments and the Fridge program spends from it through Jupiter swaps and burns). */
export const PAY_TO = 'AXomB2bpJ7F3EFVPQwrwBV4yVE7bazshZaVa64KhGCfE';
/** PASTA contract address (CA), shown next to the payment so the player sees what the money is used for. */
export const PASTA_CA = '39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump';
export const PRICE_LAMPORTS = 1_000_000n; // 0.001 SOL
export const PRICE_SOL = '0.001';
export const RPC_URL = 'https://solana-rpc.publicnode.com'; // CORS-enabled public endpoint (the wallet address and signature are sent to it)
export const MAX_AGE_SECONDS = 300;

export type PayFailure = 'rejected' | 'no_send' | 'not_confirmed' | 'mismatch' | 'used' | 'rpc';
export type PayResult = { ok: true; signature: string } | { ok: false; reason: PayFailure };

export interface PayDeps {
  rpc(method: string, params: unknown[]): Promise<unknown>;
  /** Sends the unsigned transaction through the wallet; resolves to the base58 signature. */
  send(tx: Uint8Array): Promise<string>;
  now(): number; // ms
  sleep(ms: number): Promise<void>;
  used: { has(sig: string): boolean; add(sig: string): void };
}

type Json = Record<string, unknown>;
const obj = (v: unknown): Json | null => (v && typeof v === 'object' ? (v as Json) : null);

/** Does this parsed transaction contain exactly the payment we asked for? */
export function isPayment(tx: unknown, wallet: string, nowMs: number): boolean {
  const t = obj(tx);
  const meta = obj(t?.meta);
  if (!t || !meta || meta.err !== null) return false;
  const blockTime = t.blockTime;
  if (typeof blockTime !== 'number') return false;
  const age = nowMs / 1000 - blockTime;
  if (age > MAX_AGE_SECONDS || age < -120) return false;
  const message = obj(obj(t.transaction)?.message);
  const instructions = message?.instructions;
  if (!Array.isArray(instructions)) return false;
  return instructions.some((ix) => {
    const i = obj(ix);
    const parsed = obj(i?.parsed);
    const info = obj(parsed?.info);
    if (!i || i.program !== 'system' || parsed?.type !== 'transfer' || !info) return false;
    const lamports = info.lamports;
    return info.source === wallet && info.destination === PAY_TO && typeof lamports === 'number' && Number.isSafeInteger(lamports) && BigInt(lamports) >= PRICE_LAMPORTS;
  });
}

export async function payForRound(wallet: string, d: PayDeps): Promise<PayResult> {
  let blockhash: string;
  try {
    const r = obj(obj(await d.rpc('getLatestBlockhash', [{ commitment: 'confirmed' }]))?.value);
    if (typeof r?.blockhash !== 'string') return { ok: false, reason: 'rpc' };
    blockhash = r.blockhash;
    b58decode(blockhash);
  } catch { return { ok: false, reason: 'rpc' }; }

  let signature: string;
  try {
    signature = await d.send(buildTransfer(wallet, PAY_TO, PRICE_LAMPORTS, blockhash));
  } catch (e) {
    return { ok: false, reason: e instanceof Error && e.message === 'wallet_no_send' ? 'no_send' : 'rejected' };
  }
  if (d.used.has(signature)) return { ok: false, reason: 'used' };

  // wait for confirmation (about a minute), then read the transaction back and check it
  for (let i = 0; i < 30; i++) {
    try {
      const res = obj(await d.rpc('getSignatureStatuses', [[signature], { searchTransactionHistory: true }]));
      const st = Array.isArray(res?.value) ? obj(res.value[0]) : null;
      if (st && st.err) return { ok: false, reason: 'not_confirmed' };
      if (st && (st.confirmationStatus === 'confirmed' || st.confirmationStatus === 'finalized')) break;
    } catch { /* transient RPC error: keep waiting */ }
    if (i === 29) return { ok: false, reason: 'not_confirmed' };
    await d.sleep(2000);
  }
  try {
    const tx = await d.rpc('getTransaction', [signature, { encoding: 'jsonParsed', commitment: 'confirmed', maxSupportedTransactionVersion: 0 }]);
    if (!isPayment(tx, wallet, d.now())) return { ok: false, reason: 'mismatch' };
  } catch { return { ok: false, reason: 'rpc' }; }
  d.used.add(signature); // one payment buys one round, never two
  return { ok: true, signature };
}

/** One JSON-RPC call to the public endpoint: bounded time, no credentials, errors become exceptions. */
export async function jsonRpc(method: string, params: unknown[], fetchImpl: typeof fetch = fetch): Promise<unknown> {
  const r = await fetchImpl(RPC_URL, {
    method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15_000),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!r.ok) throw new Error(`rpc ${r.status}`);
  const j = obj(await r.json());
  if (!j || j.error) throw new Error('rpc error');
  return j.result;
}
