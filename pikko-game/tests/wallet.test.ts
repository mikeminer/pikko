// Wallet connection: Wallet Standard discovery (desktop extensions + Mobile Wallet Adapter on Seeker/Android Chrome) and the legacy Phantom provider.
// All wallets here are fakes: nothing is signed and no network is used.
import { describe, expect, it } from 'vitest';
import type { Wallet } from '@wallet-standard/base';
import { createWalletController, type Registry } from '../src/access/wallet';

const A = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
const B = '9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6';
const ICON = 'data:image/svg+xml;base64,PHN2Zy8+';
const SEEKER_UA = 'Mozilla/5.0 (Linux; Android 15; Seeker) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0.0.0 Safari/537.36';

type Change = (props: { accounts?: readonly unknown[] }) => void;
function fakeWallet(name: string, o: { chains?: string[]; accounts?: string[]; reject?: boolean; connectFeature?: boolean; icon?: string } = {}) {
  const accounts = (o.accounts ?? [A]).map((address) => ({ address, publicKey: new Uint8Array(32), chains: o.chains ?? ['solana:mainnet'], features: [] }));
  const changeListeners = new Set<Change>();
  const calls = { connect: 0, disconnect: 0 };
  const features: Record<string, unknown> = {
    'standard:events': { version: '1.0.0', on: (_e: string, cb: Change) => { changeListeners.add(cb); return () => changeListeners.delete(cb); } },
    'standard:disconnect': { version: '1.0.0', disconnect: async () => { calls.disconnect++; } },
  };
  if (o.connectFeature !== false) {
    features['standard:connect'] = { version: '1.0.0', connect: async () => { calls.connect++; if (o.reject) throw new Error('User rejected the request'); return { accounts }; } };
  }
  const wallet = { version: '1.0.0', name, icon: o.icon ?? ICON, chains: o.chains ?? ['solana:mainnet'], features, accounts } as unknown as Wallet;
  return { wallet, calls, emit: (props: { accounts?: readonly unknown[] }) => changeListeners.forEach((l) => l(props)), listeners: changeListeners };
}

function fakeRegistry(initial: Wallet[] = []) {
  const wallets = [...initial];
  const on = { register: new Set<() => void>(), unregister: new Set<() => void>() };
  const registry: Registry = { get: () => wallets, on: (ev, cb) => { on[ev].add(cb); return () => on[ev].delete(cb); } };
  return { registry, add: (w: Wallet) => { wallets.push(w); on.register.forEach((cb) => cb()); }, on };
}

function setup(o: { wallets?: Wallet[]; legacy?: unknown; ua?: string; ready?: () => Promise<void> } = {}) {
  const reg = fakeRegistry(o.wallets);
  const legacy = o.legacy ?? null;
  const ctl = createWalletController({ registry: reg.registry, legacy: () => legacy as never, userAgent: () => o.ua ?? DESKTOP_UA, href: () => 'https://mikeminer.github.io/pikko/', ready: o.ready });
  return { ctl, reg };
}

describe('wallet discovery', () => {
  it('no wallet: connect says wallet_missing, and phones are offered the Phantom link (user-clicked, https://phantom.app/ul/browse/…)', async () => {
    const { ctl } = setup({ ua: SEEKER_UA });
    expect(ctl.options()).toEqual([]);
    await expect(ctl.connect()).rejects.toThrow('wallet_missing');
    expect(ctl.isMobile()).toBe(true);
    expect(ctl.isAndroid()).toBe(true);
    expect(ctl.openInPhantomUrl()).toBe(`https://phantom.app/ul/browse/${encodeURIComponent('https://mikeminer.github.io/pikko/')}?ref=${encodeURIComponent('https://mikeminer.github.io')}`);
    expect(setup().ctl.isMobile()).toBe(false);
  });

  it('Seeker: Mobile Wallet Adapter is the only wallet, so Connect goes straight to it (no chooser)', async () => {
    const mwa = fakeWallet('Mobile Wallet Adapter');
    const { ctl } = setup({ wallets: [mwa.wallet], ua: SEEKER_UA });
    expect(ctl.options().map((o) => o.name)).toEqual(['Mobile Wallet Adapter']);
    expect(await ctl.connect()).toBe(A);
    expect(ctl.wallet()).toBe(A);
    expect(mwa.calls.connect).toBe(1);
  });

  it('several wallets (desktop extensions): the caller must choose; a chosen wallet connects', async () => {
    const phantom = fakeWallet('Phantom', { accounts: [A] });
    const solflare = fakeWallet('Solflare', { accounts: [B] });
    const { ctl } = setup({ wallets: [phantom.wallet, solflare.wallet] });
    expect(ctl.options().map((o) => o.id)).toEqual(['std:Phantom', 'std:Solflare']);
    await expect(ctl.connect()).rejects.toThrow('wallet_choice');
    expect(await ctl.connect('std:Solflare')).toBe(B);
    expect(phantom.calls.connect).toBe(0);
  });

  it('ignores non-Solana wallets and wallets that cannot connect; the same wallet registered twice is listed once', () => {
    const { ctl } = setup({ wallets: [fakeWallet('EvmWallet', { chains: ['eip155:1'] }).wallet, fakeWallet('NoConnect', { connectFeature: false }).wallet, fakeWallet('Backpack').wallet, fakeWallet('Backpack').wallet] });
    expect(ctl.options().map((o) => o.name)).toEqual(['Backpack']);
  });

  it('icons: only data:image URIs are used', () => {
    const { ctl } = setup({ wallets: [fakeWallet('Good').wallet, fakeWallet('Bad', { icon: 'https://evil.example/x.png' }).wallet] });
    expect(ctl.options().map((o) => o.icon)).toEqual([ICON, null]);
  });

  it('Phantom injected as window.phantom.solana is listed once, and not twice when it is also a Wallet Standard wallet', async () => {
    const legacy = { isPhantom: true, connect: async () => ({ publicKey: { toString: () => A } }), disconnect: async () => {}, on: () => {} };
    expect(setup({ legacy }).ctl.options().map((o) => o.id)).toEqual(['phantom']);
    expect(setup({ legacy, wallets: [fakeWallet('Phantom').wallet] }).ctl.options().map((o) => o.id)).toEqual(['std:Phantom']);
    const { ctl } = setup({ legacy });
    expect(await ctl.connect()).toBe(A);
    expect(setup({ legacy: { ...legacy, isPhantom: false } }).ctl.options()).toEqual([]); // not Phantom: ignored
  });

  it('late registration: listeners are told, and connect waits for the lazy Mobile Wallet Adapter registration', async () => {
    let release!: () => void;
    const ready = new Promise<void>((r) => { release = r; });
    const reg = fakeRegistry();
    const ctl = createWalletController({ registry: reg.registry, legacy: () => null, userAgent: () => SEEKER_UA, href: () => 'https://x.test/', ready: () => ready });
    let notified = 0;
    ctl.onOptionsChange(() => notified++);
    const pending = ctl.connect(); // user taps before the adapter is registered
    reg.add(fakeWallet('Mobile Wallet Adapter').wallet);
    release();
    expect(await pending).toBe(A);
    expect(notified).toBe(1);
  });
});

describe('wallet connection state', () => {
  it('a rejected request leaves no connected wallet and rethrows for the UI message', async () => {
    const w = fakeWallet('Mobile Wallet Adapter', { reject: true });
    const { ctl } = setup({ wallets: [w.wallet], ua: SEEKER_UA });
    await expect(ctl.connect()).rejects.toThrow(/rejected/);
    expect(ctl.wallet()).toBeNull();
    expect(w.listeners.size).toBe(0);
  });

  it('account switched or removed inside the wallet updates access immediately', async () => {
    const w = fakeWallet('Mobile Wallet Adapter');
    const { ctl } = setup({ wallets: [w.wallet] });
    const seen: (string | null)[] = [];
    ctl.onWalletChange((x) => seen.push(x));
    await ctl.connect();
    w.emit({ accounts: [{ address: B, chains: ['solana:mainnet'] }] });
    expect(ctl.wallet()).toBe(B);
    w.emit({ accounts: [] });
    expect(ctl.wallet()).toBeNull();
    w.emit({}); // unrelated change (e.g. chains): ignored
    expect(seen).toEqual([A, B, null]);
  });

  it('an account that is not a base58 public key is refused', async () => {
    const { ctl } = setup({ wallets: [fakeWallet('Odd', { accounts: ['not a key; DROP'] }).wallet] });
    await expect(ctl.connect()).rejects.toThrow('wallet_no_account');
    expect(ctl.wallet()).toBeNull();
  });

  it('disconnect calls the wallet, clears the key and stops listening to that wallet', async () => {
    const w = fakeWallet('Phantom');
    const { ctl } = setup({ wallets: [w.wallet] });
    await ctl.connect();
    await ctl.disconnect();
    expect(w.calls.disconnect).toBe(1);
    expect(ctl.wallet()).toBeNull();
    expect(w.listeners.size).toBe(0);
    w.emit({ accounts: [{ address: B, chains: ['solana:mainnet'] }] });
    expect(ctl.wallet()).toBeNull();
  });

  it('legacy Phantom: accountChanged / disconnect from the extension clear or switch the key', async () => {
    const handlers: Record<string, (pk?: { toString(): string } | null) => void> = {};
    const legacy = { isPhantom: true, connect: async () => ({ publicKey: { toString: () => A } }), disconnect: async () => {}, on: (e: string, cb: never) => { handlers[e] = cb; } };
    const { ctl } = setup({ legacy });
    await ctl.connect();
    handlers.accountChanged({ toString: () => B });
    expect(ctl.wallet()).toBe(B);
    handlers.accountChanged(null);
    expect(ctl.wallet()).toBeNull();
  });
});
