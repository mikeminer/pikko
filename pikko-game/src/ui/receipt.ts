// "Pikko's receipt" share card (GDD §14.2 #2): a thermal supermarket receipt drawn on a canvas.
import { FOOD_BY_ID, isHealthy, isJunk } from '../data/foods';
import { foodName, num, t } from '../i18n';
import type { RunState } from '../sim/rules';

export function drawReceipt(run: RunState, opts: { modeLabel: string; dailyTag?: string }): HTMLCanvasElement {
  const counts = new Map<string, number>();
  for (const b of run.log) counts.set(b.id, (counts.get(b.id) ?? 0) + 1);
  const items = [...counts.entries()];
  const W = 540;
  const lineH = 30;
  const H = 360 + items.length * lineH + 260;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  // paper with zig-zag edges
  g.fillStyle = '#fffdf8';
  g.beginPath();
  g.moveTo(0, 12);
  for (let x = 0; x <= W; x += 18) g.lineTo(x, x % 36 === 0 ? 0 : 12);
  g.lineTo(W, H - 12);
  for (let x = W; x >= 0; x -= 18) g.lineTo(x, x % 36 === 0 ? H : H - 12);
  g.closePath();
  g.fill();
  const mono = '"Courier New", ui-monospace, monospace';
  let y = 60;
  g.textAlign = 'center';
  g.fillStyle = '#ff6b35';
  g.font = `900 52px system-ui, sans-serif`;
  g.fillText('PIKKO MART', W / 2, y);
  y += 36;
  g.fillStyle = '#2a1d14';
  g.font = `700 20px ${mono}`;
  g.fillText(t('subtitle'), W / 2, y);
  y += 30;
  g.font = `16px ${mono}`;
  g.fillText(`${opts.modeLabel}${opts.dailyTag ? ' · ' + opts.dailyTag : ''}`, W / 2, y);
  y += 24;
  g.fillText(new Date().toLocaleString(), W / 2, y);
  y += 20;
  const dash = () => { g.fillText('-'.repeat(40), W / 2, y); y += 26; };
  dash();
  g.textAlign = 'left';
  g.font = `18px ${mono}`;
  for (const [id, n] of items) {
    const f = FOOD_BY_ID.get(id);
    if (!f) continue;
    const mark = isHealthy(f.grade) ? '+' : isJunk(f.grade) ? '!' : ' ';
    let name = `${mark} ${n > 1 ? n + 'x ' : ''}${foodName(f)}`;
    if (name.length > 30) name = name.slice(0, 29) + '…';
    g.fillStyle = isHealthy(f.grade) ? '#2f7d1e' : isJunk(f.grade) ? '#8c5a2b' : '#2a1d14';
    g.fillText(name, 30, y);
    g.textAlign = 'right';
    g.fillText(`${num(f.kcal * n)} kcal`, W - 30, y);
    g.textAlign = 'left';
    y += lineH;
  }
  g.fillStyle = '#2a1d14';
  g.textAlign = 'center';
  dash();
  g.textAlign = 'left';
  g.font = `700 22px ${mono}`;
  g.fillText(t('receipt_total'), 30, y);
  g.textAlign = 'right';
  g.fillText(`${num(run.kcal)} kcal`, W - 30, y);
  y += 32;
  g.textAlign = 'left';
  g.fillText(t('receipt_points'), 30, y);
  g.textAlign = 'right';
  g.fillText(num(run.score), W - 30, y);
  y += 32;
  g.textAlign = 'center';
  g.font = `900 26px system-ui, sans-serif`;
  g.fillStyle = run.outcome === 'victory' ? '#2f7d1e' : '#8c5a2b';
  g.fillText(run.outcome === 'victory' ? t('victory') : t('defeat'), W / 2, y + 6);
  y += 40;
  // barcode
  g.fillStyle = '#2a1d14';
  let x = 90;
  let s = run.score + run.kcal;
  while (x < W - 90) { s = (s * 1103515245 + 12345) >>> 0; const w = 1 + (s % 4); g.fillRect(x, y, w, 50); x += w + 2 + ((s >> 3) % 3); }
  y += 76;
  g.font = `16px ${mono}`;
  g.fillText(t('receipt_cashier'), W / 2, y);
  y += 24;
  g.fillText(t('receipt_thanks'), W / 2, y);
  return c;
}

/** Wordle-style spoiler-free line: 🟢 healthy, 🟤 junk, 🟡 neutral. */
export function emojiLine(run: RunState, tag: string): string {
  const cells = run.log.map((b) => (isHealthy(b.grade) ? '🟢' : isJunk(b.grade) ? '🟤' : '🟡')).join('');
  return `PIKKO ${tag} ${run.outcome === 'victory' ? '🌱' : '🤢'} ${num(run.score)}\n${cells}`;
}
