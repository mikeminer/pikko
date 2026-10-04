// End-to-end bot: plays a whole day in real Chrome and checks the flow (habit flips, end of day, results).
// Usage: node tools/playthrough.mjs <outDir> [baseUrl] [mode] [lang] [bagId]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require(path.resolve('..', 'node_modules', 'puppeteer-core'));
const out = process.argv[2] ?? 'shots';
const base = process.argv[3] ?? 'http://127.0.0.1:5180/';
const mode = process.argv[4] ?? 'classic';
const lang = process.argv[5] ?? 'en';
const bagId = process.argv[6] ?? 'poland';
fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.evaluateOnNewDocument((l) => Object.defineProperty(navigator, 'languages', { get: () => [l] }), lang);
  await page.setViewport({ width: 1000, height: 640 });
  await page.goto(base, { waitUntil: 'networkidle0' });
  await page.click('#boot button');
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate((mode, bagId) => { const P = window.__pikko; P.ui.close(); P.ui.showHud(); P.game.start({ mode, bagId, trial: false, seed: 12345 }); }, mode, bagId);
  await page.waitForFunction(() => window.__pikko.game.slots.length > 0, { timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(out, `playthrough-${mode}-${lang}-round.png`) });
  // plan: 3 junk (habit -> junk), 3 healthy (palate reset), then alternate 2 healthy / 1 junk
  const plan = ['J', 'J', 'J', 'H', 'H', 'H'];
  const events = [];
  for (let i = 0; i < 60; i++) {
    const st = await page.waitForFunction(() => {
      const P = window.__pikko; const G = P.game;
      if (P.ui.current === 'results') return { done: true };
      if (!G.active || G.busy || G.paused) return false;
      if (!G.slots.length || !G.slots.every((s) => s.state === 'idle')) return false;
      return { done: false, round: G.round };
    }, { timeout: 120000, polling: 100 }).then((h) => h.jsonValue());
    if (st.done) break;
    const want = plan[i] ?? (i % 3 === 2 ? 'J' : 'H');
    const r = await page.evaluate((want) => {
      const G = window.__pikko.game;
      const isH = (g) => g === 'A' || g === 'B';
      let slot = G.slots.find((s) => (want === 'H' ? isH(s.food.grade) : !isH(s.food.grade))) ?? G.slots[0];
      const before = G.run.habit;
      G.feed(slot, false);
      return { round: G.round, food: slot.food.id, grade: slot.food.grade, habitBefore: before };
    }, want);
    events.push(r);
    if (i === 4) {
      // pause / resume mid-game
      await page.evaluate(() => window.__pikko.ui.pause());
      await new Promise((res) => setTimeout(res, 300));
      await page.evaluate(() => { window.__pikko.ui.close(); window.__pikko.ui.host.setPaused(false); });
    }
  }
  await page.waitForFunction(() => window.__pikko.ui.current === 'results', { timeout: 120000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(out, `playthrough-${mode}-${lang}-results.png`) });
  const run = await page.evaluate(() => { const G = window.__pikko.game; const r = G.run; return { outcome: r.outcome, score: r.score, kcal: r.kcal, healthyShare: Math.round((r.kcalHealthy / r.kcal) * 100), bites: r.bites, resets: r.resets, habit: r.habit, bestCombo: r.bestCombo, rounds: G.round, log: r.log.map((b) => `${b.id}:${b.reaction}:${b.points}`) }; });
  console.log('first events', JSON.stringify(events.slice(0, 8)));
  console.log('run', JSON.stringify({ ...run, log: run.log.slice(0, 10) }));
} finally {
  await browser.close();
}
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
