// Minimal Phantom (Solana) connection. Connecting returns a public key only: it is not an authenticated session,
// it never signs, locks or approves anything. Account changes clear access immediately.
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  on(ev: 'accountChanged' | 'disconnect', cb: (pk?: { toString(): string } | null) => void): void;
}

declare global { interface Window { phantom?: { solana?: PhantomProvider } } }

export function provider(): PhantomProvider | null {
  const p = window.phantom?.solana;
  return p && p.isPhantom ? p : null;
}

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** User-clicked "Open in Phantom" link for mobile browsers without injection. */
export function openInPhantomUrl(): string {
  const target = new URL(window.location.href);
  return `https://phantom.app/ul/browse/${encodeURIComponent(target.href)}?ref=${encodeURIComponent(target.origin)}`;
}

type Listener = (wallet: string | null) => void;
const listeners = new Set<Listener>();
let current: string | null = null;
let wired = false;

function set(w: string | null) {
  current = w;
  listeners.forEach((l) => l(w));
}

export function onWalletChange(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function wallet(): string | null { return current; }

export async function connect(): Promise<string> {
  const p = provider();
  if (!p) throw new Error('phantom_missing');
  if (!wired) {
    wired = true;
    p.on('accountChanged', (pk) => set(pk ? pk.toString() : null));
    p.on('disconnect', () => set(null));
  }
  const res = await p.connect(); // user may reject: caller shows a message, no retry loop
  set(res.publicKey.toString());
  return current!;
}

export async function disconnect(): Promise<void> {
  try { await provider()?.disconnect(); } finally { set(null); }
}
