// Minimal Solana helpers (no SDK): base58, and an unsigned legacy System Program transfer in the wire format
// wallets accept for `solana:signAndSendTransaction` (one empty signature slot, then the message).
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function b58decode(s: string): Uint8Array {
  let n = 0n;
  for (const ch of s) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) throw new Error('invalid base58');
    n = n * 58n + BigInt(i);
  }
  let zeros = 0;
  for (const ch of s) { if (ch === '1') zeros++; else break; }
  const hex = n === 0n ? '' : n.toString(16);
  const body = hex.length % 2 ? `0${hex}` : hex;
  const out = new Uint8Array(zeros + body.length / 2);
  for (let i = 0; i < body.length; i += 2) out[zeros + i / 2] = parseInt(body.slice(i, i + 2), 16);
  return out;
}

export function b58encode(bytes: Uint8Array): string {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let out = '';
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  let zeros = 0;
  for (const b of bytes) { if (b === 0) zeros++; else break; }
  return '1'.repeat(zeros) + out;
}

/** A base58 string that decodes to exactly 32 bytes (a public key or a blockhash). */
export function key32(s: string): Uint8Array {
  const b = b58decode(s);
  if (b.length !== 32) throw new Error('expected 32 bytes');
  return b;
}

const SYSTEM_PROGRAM = new Uint8Array(32); // 11111111111111111111111111111111

/**
 * Unsigned transfer of `lamports` from `from` to `to`: [1 signature slot (zeros)] + legacy message
 * (header 1/0/1, accounts from · to · System Program, blockhash, one transfer instruction).
 */
export function buildTransfer(from: string, to: string, lamports: bigint, blockhash: string): Uint8Array {
  if (from === to) throw new Error('same account');
  if (lamports <= 0n || lamports >= 1n << 64n) throw new Error('bad amount');
  const data = new Uint8Array(12);
  const dv = new DataView(data.buffer);
  dv.setUint32(0, 2, true); // SystemInstruction::Transfer
  dv.setBigUint64(4, lamports, true);
  const parts: Uint8Array[] = [
    Uint8Array.of(1), new Uint8Array(64), // signatures: compact-u16 count 1, one empty slot for the wallet
    Uint8Array.of(1, 0, 1), // header: 1 required signature, 0 readonly signed, 1 readonly unsigned (the program)
    Uint8Array.of(3), key32(from), key32(to), SYSTEM_PROGRAM,
    key32(blockhash),
    Uint8Array.of(1), // one instruction
    Uint8Array.of(2), // program id index (System Program)
    Uint8Array.of(2, 0, 1), // two accounts: from, to
    Uint8Array.of(12), data,
  ];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
