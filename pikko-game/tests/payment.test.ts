// Kids mode pay-per-round: 0.001 SOL to the game's address, confirmed on-chain before the round starts.
// Everything here is a fake: no wallet, no RPC, no transaction is ever sent.
import { describe, expect, it } from 'vitest';
import type { Wallet } from '@wallet-standard/base';
import { PASS_ACCESS } from '../src/access/bags.config';
import { isPayment, MAX_AGE_SECONDS, PASTA_CA, PAY_TO, type PayDeps, payForRound, PRICE_LAMPORTS } from '../src/access/payment';
import { b58decode, b58encode, buildTransfer, key32 } from '../src/access/solana';
import { createWalletController, type Registry } from '../src/access/wallet';

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
const OTHER = '9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6';
const HASH = '83RvwuPGyKPsVnbRoBGpDcnKxckPWtwZHga6SsdTCd3W';
const NOW = 1_800_000_000_000;
const SIG = b58encode(new Uint8Array(64).fill(7));

describe('what the payment is for', () => {
  it('the CA shown next to the payment is the PASTA mint the pass uses', () => {
    expect(PASTA_CA).toBe(PASS_ACCESS.mint);
    expect(b58decode(PASTA_CA).length).toBe(32);
  });
});

describe('base58 and the transfer message', () => {
  it('round-trips keys and keeps leading zeros', () => {
    expect([...b58decode('11111111111111111111111111111111')]).toEqual(new Array(32).fill(0));
    for (const k of [WALLET, OTHER, PAY_TO, HASH]) expect(b58encode(key32(k))).toBe(k);
    expect(() => key32('abc')).toThrow();
    expect(() => b58decode('0OIl')).toThrow();
  });

  it('builds the standard 215-byte legacy transfer: one empty signature slot, 3 accounts, the amount in little endian', () => {
    const tx = buildTransfer(WALLET, PAY_TO, PRICE_LAMPORTS, HASH);
    expect(tx.length).toBe(215);
    expect(tx[0]).toBe(1);
    expect(tx.slice(1, 65).every((b) => b === 0)).toBe(true); // the wallet fills the signature
    expect([...tx.slice(65, 68)]).toEqual([1, 0, 1]); // 1 signer, 0 readonly signed, 1 readonly unsigned (System Program)
    expect(tx[68]).toBe(3);
    expect(b58encode(tx.slice(69, 101))).toBe(WALLET);
    expect(b58encode(tx.slice(101, 133))).toBe(PAY_TO);
    expect(tx.slice(133, 165).every((b) => b === 0)).toBe(true); // System Program
    expect(b58encode(tx.slice(165, 197))).toBe(HASH);
    expect([...tx.slice(197, 203)]).toEqual([1, 2, 2, 0, 1, 12]); // 1 instruction, program 2, accounts [0,1], 12 data bytes
    const dv = new DataView(tx.buffer, tx.byteOffset + 203, 12);
    expect(dv.getUint32(0, true)).toBe(2); // Transfer
    expect(dv.getBigUint64(4, true)).toBe(1_000_000n); // 0.001 SOL
  });

  it('refuses nonsense', () => {
    expect(() => buildTransfer(WALLET, WALLET, 1n, HASH)).toThrow();
    expect(() => buildTransfer(WALLET, PAY_TO, 0n, HASH)).toThrow();
    expect(() => buildTransfer(WALLET, PAY_TO, 1n, 'short')).toThrow();
  });
});

const parsed = (over: Record<string, unknown> = {}, info: Record<string, unknown> = {}, tx: Record<string, unknown> = {}) => ({
  blockTime: NOW / 1000 - 10,
  meta: { err: null },
  transaction: { message: { instructions: [{ program: 'system', parsed: { type: 'transfer', info: { source: WALLET, destination: PAY_TO, lamports: 1_000_000, ...info } }, ...over }] } },
  ...tx,
});

describe('confirming the payment on-chain', () => {
  it('accepts exactly the payment: succeeded, from the player, to the game, at least 0.001 SOL, recent', () => {
    expect(isPayment(parsed(), WALLET, NOW)).toBe(true);
    expect(isPayment(parsed({}, { lamports: 5_000_000 }), WALLET, NOW)).toBe(true);
  });
  it('rejects everything else (fail closed)', () => {
    expect(isPayment(parsed({}, { lamports: 999_999 }), WALLET, NOW)).toBe(false); // one lamport short
    expect(isPayment(parsed({}, { destination: OTHER }), WALLET, NOW)).toBe(false);
    expect(isPayment(parsed({}, { source: OTHER }), WALLET, NOW)).toBe(false); // somebody else's payment
    expect(isPayment(parsed({}, {}, { meta: { err: { InstructionError: [0, 'Custom'] } } }), WALLET, NOW)).toBe(false);
    expect(isPayment(parsed({}, {}, { blockTime: NOW / 1000 - MAX_AGE_SECONDS - 1 }), WALLET, NOW)).toBe(false); // an old payment
    expect(isPayment(parsed({}, {}, { blockTime: NOW / 1000 + 600 }), WALLET, NOW)).toBe(false);
    expect(isPayment(parsed({ program: 'spl-token' }), WALLET, NOW)).toBe(false);
    expect(isPayment(parsed({}, { lamports: '1000000' }), WALLET, NOW)).toBe(false); // wrong type
    expect(isPayment(null, WALLET, NOW)).toBe(false);
    expect(isPayment({ meta: { err: null } }, WALLET, NOW)).toBe(false);
  });
});

function deps(o: { send?: () => Promise<string>; tx?: unknown; status?: unknown; used?: Set<string>; rpcFail?: string } = {}) {
  const used = o.used ?? new Set<string>();
  const calls: string[] = [];
  const d: PayDeps = {
    rpc: async (method) => {
      calls.push(method);
      if (o.rpcFail === method) throw new Error('rpc down');
      if (method === 'getLatestBlockhash') return { value: { blockhash: HASH } };
      if (method === 'getSignatureStatuses') return { value: [!('status' in o) ? { confirmationStatus: 'confirmed', err: null } : o.status] };
      if (method === 'getTransaction') return o.tx ?? parsed();
      throw new Error(method);
    },
    send: o.send ?? (async () => SIG),
    now: () => NOW,
    sleep: async () => {},
    used,
  };
  return { d, used, calls };
}

describe('payForRound', () => {
  it('pays, confirms, reads the transaction back and remembers the signature', async () => {
    const { d, used, calls } = deps();
    expect(await payForRound(WALLET, d)).toEqual({ ok: true, signature: SIG });
    expect(used.has(SIG)).toBe(true);
    expect(calls).toEqual(['getLatestBlockhash', 'getSignatureStatuses', 'getTransaction']);
  });
  it('sends the right transaction to the wallet', async () => {
    let sent: Uint8Array | null = null;
    const { d } = deps({ send: async () => { throw new Error('x'); } });
    d.send = async (tx) => { sent = tx; return SIG; };
    await payForRound(WALLET, d);
    expect(sent).not.toBeNull();
    expect(sent!.length).toBe(215);
    expect(b58encode(sent!.slice(101, 133))).toBe(PAY_TO);
  });
  it('a rejected wallet prompt means nothing was paid and nothing starts', async () => {
    const { d, used } = deps({ send: async () => { throw new Error('User rejected the request'); } });
    expect(await payForRound(WALLET, d)).toEqual({ ok: false, reason: 'rejected' });
    expect(used.size).toBe(0);
  });
  it('a wallet that cannot send is reported as such', async () => {
    expect(await payForRound(WALLET, deps({ send: async () => { throw new Error('wallet_no_send'); } }).d)).toEqual({ ok: false, reason: 'no_send' });
  });
  it('a failed transaction, a wrong payment or an RPC outage never starts a round', async () => {
    expect(await payForRound(WALLET, deps({ status: { err: { InstructionError: [0, 'x'] }, confirmationStatus: 'confirmed' } }).d)).toEqual({ ok: false, reason: 'not_confirmed' });
    expect(await payForRound(WALLET, deps({ tx: parsed({}, { lamports: 1 }) }).d)).toEqual({ ok: false, reason: 'mismatch' });
    expect(await payForRound(WALLET, deps({ rpcFail: 'getLatestBlockhash' }).d)).toEqual({ ok: false, reason: 'rpc' });
    expect(await payForRound(WALLET, deps({ rpcFail: 'getTransaction' }).d)).toEqual({ ok: false, reason: 'rpc' });
  });
  it('one signature never pays for two rounds', async () => {
    const { d, used } = deps({ used: new Set([SIG]) });
    expect(await payForRound(WALLET, d)).toEqual({ ok: false, reason: 'used' });
    expect(used.size).toBe(1);
  });
  it('gives up when the transaction never confirms', async () => {
    const { d } = deps({ status: null });
    expect(await payForRound(WALLET, d)).toEqual({ ok: false, reason: 'not_confirmed' });
  });
});

describe('wallet.signAndSend (Wallet Standard)', () => {
  const ICON = 'data:image/svg+xml;base64,PHN2Zy8+';
  function setup(withFeature: boolean, sigLen = 64) {
    const sent: { transaction: Uint8Array; chain: string; account: string }[] = [];
    const account = { address: WALLET, publicKey: new Uint8Array(32), chains: ['solana:mainnet'], features: [] };
    const features: Record<string, unknown> = {
      'standard:connect': { version: '1.0.0', connect: async () => ({ accounts: [account] }) },
      'standard:events': { version: '1.0.0', on: () => () => {} },
    };
    if (withFeature) features['solana:signAndSendTransaction'] = { version: '1.0.0', signAndSendTransaction: async (i: { transaction: Uint8Array; chain: string; account: { address: string } }) => { sent.push({ transaction: i.transaction, chain: i.chain, account: i.account.address }); return [{ signature: new Uint8Array(sigLen).fill(7) }]; } };
    const wallet = { version: '1.0.0', name: 'Fake', icon: ICON, chains: ['solana:mainnet'], features, accounts: [account] } as unknown as Wallet;
    const registry: Registry = { get: () => [wallet], on: () => () => {} };
    const ctl = createWalletController({ registry, legacy: () => null, userAgent: () => 'x', href: () => 'https://pikko.art/play/' });
    return { ctl, sent };
  }
  it('hands the transaction to the connected wallet and returns the base58 signature', async () => {
    const { ctl, sent } = setup(true);
    await ctl.connect();
    const tx = buildTransfer(WALLET, PAY_TO, PRICE_LAMPORTS, HASH);
    expect(await ctl.signAndSend(tx)).toBe(SIG);
    expect(sent).toEqual([{ transaction: tx, chain: 'solana:mainnet', account: WALLET }]);
  });
  it('refuses without a connection, without the feature, or with a malformed answer', async () => {
    const tx = new Uint8Array(215);
    const a = setup(true);
    await expect(a.ctl.signAndSend(tx)).rejects.toThrow('wallet_no_send');
    const b = setup(false);
    await b.ctl.connect();
    await expect(b.ctl.signAndSend(tx)).rejects.toThrow('wallet_no_send');
    const c = setup(true, 10);
    await c.ctl.connect();
    await expect(c.ctl.signAndSend(tx)).rejects.toThrow('wallet_no_send');
  });
});
