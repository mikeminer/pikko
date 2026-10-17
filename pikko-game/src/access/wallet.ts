// Wallet connection (READ-ONLY): we only learn the connected public key. We never sign, lock, approve or send anything.
// Wallet sources, merged into one list:
//  1. Wallet Standard wallets registered in the page: desktop extensions (Phantom, Solflare, ...) and, on Android Chrome over HTTPS,
//     Mobile Wallet Adapter (Solana Seeker: Seed Vault Wallet, Solflare, Phantom) which registerMwa() adds as "Mobile Wallet Adapter".
//  2. The legacy injected `window.phantom.solana` (Phantom in-app browser / older builds), only when Phantom is not already in list 1.
// A connected key is not an authenticated session: account changes and disconnects clear access immediately.
import { getWallets } from '@wallet-standard/app';
import type { Wallet, WalletAccount } from '@wallet-standard/base';
import type { StandardConnectFeature, StandardDisconnectFeature, StandardEventsFeature } from '@wallet-standard/features';

interface LegacyPhantom {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  on(ev: 'accountChanged' | 'disconnect', cb: (pk?: { toString(): string } | null) => void): void;
}
declare global { interface Window { phantom?: { solana?: LegacyPhantom } } }

export interface WalletOption {
  id: string;
  /** Name as registered by the wallet. */
  name: string;
  /** Name shown to players: Mobile Wallet Adapter is the Solana Seeker / Android route (Seed Vault Wallet, Solflare, Phantom). */
  label: string;
  icon: string | null;
  kind: 'standard' | 'phantom';
}

/** Why a wallet connection failed, in terms the UI can explain (message of the thrown Error). */
export type WalletFailure = 'wallet_missing' | 'wallet_choice' | 'wallet_no_account' | 'wallet_not_found' | 'wallet_blocked';

/**
 * Mobile Wallet Adapter launches the wallet with a `solana-wallet:` link and decides "wallet not found" when the page does not lose focus
 * within 3 s. In-app browsers (WebViews: Telegram, wallet or social apps) cannot open that link, so the result is the same there.
 * Same broad test the package uses for its own "incompatible browser" message (`wv` anywhere in the user agent), plus the usual WebView markers.
 */
export function isInAppBrowser(ua: string): boolean {
  if (ua.includes('Solana Mobile Web Shell')) return false; // the Seeker's own web shell is a supported WebView
  return ua.toLowerCase().includes('wv') || /WebView|Version\/[\d.]+.*Chrome\/\d/i.test(ua);
}

/** Browsers that are not Chrome (Mobile Wallet Adapter works only in Android Chrome). */
export const isChromeLike = (ua: string): boolean => /Chrome\//.test(ua) && !/EdgA|OPR\/|SamsungBrowser|Firefox|DuckDuckGo|Vivaldi|YaBrowser|UCBrowser|MiuiBrowser/i.test(ua);

/** Maps a Mobile Wallet Adapter error to a failure the UI can explain; anything else is rethrown as is. */
export function mapWalletError(e: unknown): unknown {
  const code = (e as { name?: string; code?: string } | null)?.name === 'SolanaMobileWalletAdapterError' ? (e as { code?: string }).code : undefined;
  if (code === 'ERROR_WALLET_NOT_FOUND' || code === 'ERROR_BROWSER_NOT_SUPPORTED') return Object.assign(new Error('wallet_not_found'), { cause: e });
  if (code === 'ERROR_LOOPBACK_ACCESS_BLOCKED') return Object.assign(new Error('wallet_blocked'), { cause: e });
  return e;
}

export const MWA_NAME = 'Mobile Wallet Adapter';
export const MWA_LABEL = 'Seeker (Android)';
const labelOf = (name: string) => (name === MWA_NAME ? MWA_LABEL : name);

export interface Registry {
  get(): readonly Wallet[];
  on(event: 'register' | 'unregister', listener: () => void): () => void;
}

export interface WalletDeps {
  registry: Registry;
  legacy(): LegacyPhantom | null;
  userAgent(): string;
  href(): string;
  /** Resolves when the (lazy) Mobile Wallet Adapter registration attempt is over. */
  ready?(): Promise<void>;
}

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const isSolana = (w: Wallet) => w.chains.some((c) => c.startsWith('solana:')) && 'standard:connect' in w.features;
const safeIcon = (i: unknown): string | null => (typeof i === 'string' && /^data:image\/(svg\+xml|png|webp|jpeg|gif);/.test(i) ? i : null);

function pickAccount(accounts: readonly WalletAccount[]): string | null {
  const a = accounts.find((x) => x.chains.some((c) => c.startsWith('solana:'))) ?? accounts[0];
  return a && BASE58.test(a.address) ? a.address : null;
}

export function createWalletController(deps: WalletDeps) {
  type Listener = (wallet: string | null) => void;
  const listeners = new Set<Listener>();
  let current: string | null = null;
  let unsubscribeWallet: (() => void) | null = null;
  let active: { kind: 'standard'; wallet: Wallet } | { kind: 'phantom' } | null = null;
  let legacyWired = false;

  const set = (w: string | null) => {
    current = w;
    listeners.forEach((l) => l(w));
  };

  const standardWallets = (): Wallet[] => {
    const seen = new Set<string>();
    return deps.registry.get().filter((w) => isSolana(w) && !seen.has(w.name) && !!seen.add(w.name));
  };

  function options(): WalletOption[] {
    const out: WalletOption[] = standardWallets().map((w) => ({ id: `std:${w.name}`, name: w.name, label: labelOf(w.name), icon: safeIcon(w.icon), kind: 'standard' }));
    const legacy = deps.legacy();
    if (legacy?.isPhantom && !out.some((o) => o.name === 'Phantom')) out.push({ id: 'phantom', name: 'Phantom', label: 'Phantom', icon: null, kind: 'phantom' });
    return out;
  }

  function onOptionsChange(cb: () => void): () => void {
    const offs = [deps.registry.on('register', cb), deps.registry.on('unregister', cb)];
    return () => offs.forEach((off) => off());
  }

  async function connectStandard(w: Wallet): Promise<string> {
    const feature = w.features['standard:connect'] as StandardConnectFeature['standard:connect'];
    let res;
    try { res = await feature.connect(); } catch (e) { throw mapWalletError(e); } // the user may reject: the caller shows a message, no retry loop
    const addr = pickAccount(res.accounts.length ? res.accounts : w.accounts);
    if (!addr) throw new Error('wallet_no_account');
    unsubscribeWallet?.();
    const events = w.features['standard:events'] as StandardEventsFeature['standard:events'] | undefined;
    unsubscribeWallet = events?.on('change', (props) => {
      if (!props.accounts) return;
      set(props.accounts.length ? pickAccount(props.accounts) : null); // account switched or disconnected inside the wallet
    }) ?? null;
    active = { kind: 'standard', wallet: w };
    return addr;
  }

  async function connectLegacy(): Promise<string> {
    const p = deps.legacy();
    if (!p) throw new Error('wallet_missing');
    if (!legacyWired) {
      legacyWired = true;
      p.on('accountChanged', (pk) => { if (active?.kind === 'phantom') set(pk ? pk.toString() : null); });
      p.on('disconnect', () => { if (active?.kind === 'phantom') set(null); });
    }
    const res = await p.connect();
    const addr = res.publicKey.toString();
    if (!BASE58.test(addr)) throw new Error('wallet_no_account');
    active = { kind: 'phantom' };
    return addr;
  }

  /** Connect a wallet. Without `id` it connects the only available wallet; with several, the caller must pass an id. */
  async function connect(id?: string): Promise<string> {
    await deps.ready?.();
    const opts = options();
    const pick = id ? opts.find((o) => o.id === id) : opts.length === 1 ? opts[0] : undefined;
    if (!pick) throw new Error(opts.length ? 'wallet_choice' : 'wallet_missing');
    const addr = pick.kind === 'standard' ? await connectStandard(standardWallets().find((w) => `std:${w.name}` === pick.id)!) : await connectLegacy();
    set(addr);
    return addr;
  }

  async function disconnect(): Promise<void> {
    const a = active;
    active = null;
    unsubscribeWallet?.();
    unsubscribeWallet = null;
    try {
      if (a?.kind === 'standard') await (a.wallet.features['standard:disconnect'] as StandardDisconnectFeature['standard:disconnect'] | undefined)?.disconnect();
      else if (a?.kind === 'phantom') await deps.legacy()?.disconnect();
    } finally {
      set(null);
    }
  }

  /** Player-facing name of the wallet that is connected right now (null when none). */
  const connectedLabel = (): string | null => (current === null || !active ? null : active.kind === 'phantom' ? 'Phantom' : labelOf(active.wallet.name));

  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(deps.userAgent());
  const isAndroid = () => /Android/i.test(deps.userAgent());
  const inAppBrowser = () => isInAppBrowser(deps.userAgent());
  const usesChrome = () => isChromeLike(deps.userAgent()) && !inAppBrowser();

  /** Android intent that opens this page in Chrome (user-clicked link; falls back to the page itself). */
  function openInChromeUrl(): string {
    const u = new URL(deps.href());
    return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(':', '')};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.href)};end`;
  }
  const pageUrl = (): string => deps.href();

  /** User-clicked "Open in Phantom" link for mobile browsers without an injected wallet (e.g. iOS). */
  function openInPhantomUrl(): string {
    const target = new URL(deps.href());
    return `https://phantom.app/ul/browse/${encodeURIComponent(target.href)}?ref=${encodeURIComponent(target.origin)}`;
  }

  return {
    options, onOptionsChange, connect, disconnect, connectedLabel, isMobile, isAndroid, inAppBrowser, usesChrome, openInChromeUrl, pageUrl, openInPhantomUrl,
    wallet: (): string | null => current,
    onWalletChange(l: Listener): () => void { listeners.add(l); return () => listeners.delete(l); },
  };
}

// ---------- browser singleton ----------
let mwaReady: Promise<void> | null = null;
let controller: ReturnType<typeof createWalletController> | null = null;

/**
 * Register Mobile Wallet Adapter on Android Chrome (HTTPS). The package is loaded lazily, only where it can work: it is ~0.7 MB
 * and registerMwa() itself refuses non-Android, non-secure and WebView environments (Phantom's in-app browser injects its own wallet).
 */
export function initWallets(): Promise<void> {
  mwaReady ??= (async () => {
    if (typeof window === 'undefined' || !window.isSecureContext || !/Android/i.test(navigator.userAgent)) return;
    try {
      const mwa = await import('@solana-mobile/wallet-standard-mobile');
      const base = new URL('./', document.baseURI);
      mwa.registerMwa({
        appIdentity: { name: 'PIKKO', uri: base.href, icon: 'icon-512.png' }, // icon resolves against uri
        authorizationCache: mwa.createDefaultAuthorizationCache(),
        chains: ['solana:mainnet'], // read-only: we only need the public key, never a transaction
        chainSelector: mwa.createDefaultChainSelector(),
        // no library modal (English only): connect() fails with wallet_not_found and the UI explains it in the player's language
        onWalletNotFound: async () => {},
      });
    } catch (e) {
      console.warn('Mobile Wallet Adapter unavailable', e);
    }
  })();
  return mwaReady;
}

function ctl() {
  controller ??= createWalletController({
    registry: getWallets(),
    legacy: () => window.phantom?.solana ?? null,
    userAgent: () => navigator.userAgent,
    href: () => window.location.href,
    ready: () => mwaReady ?? Promise.resolve(),
  });
  return controller;
}

export const options = () => ctl().options();
export const onOptionsChange = (cb: () => void) => ctl().onOptionsChange(cb);
export const connect = (id?: string) => ctl().connect(id);
export const disconnect = () => ctl().disconnect();
export const wallet = () => ctl().wallet();
export const connectedLabel = () => ctl().connectedLabel();
export const onWalletChange = (l: (w: string | null) => void) => ctl().onWalletChange(l);
export const isMobile = () => ctl().isMobile();
export const isAndroid = () => ctl().isAndroid();
export const inAppBrowser = () => ctl().inAppBrowser();
export const usesChrome = () => ctl().usesChrome();
export const openInChromeUrl = () => ctl().openInChromeUrl();
export const pageUrl = () => ctl().pageUrl();
export const openInPhantomUrl = () => ctl().openInPhantomUrl();
