// Visual smoke test: captures title + gameplay at several viewports with real Chrome (WebGL via ANGLE).
// Usage: node tools/shots.mjs <outDir> [baseUrl]
// Needs a running dev server and puppeteer-core (borrowed from the parent project's node_modules).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require(path.resolve('..', 'node_modules', 'puppeteer-core'));
const out = process.argv[2] ?? 'shots';
const base = process.argv[3] ?? 'http://127.0.0.1:5180/';
fs.mkdirSync(out, { recursive: true });

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const views = [
  { name: 'desktop', width: 1280, height: 720, mobile: false },
  { name: 'phone-landscape', width: 844, height: 390, mobile: true },
  { name: 'phone-portrait', width: 390, height: 844, mobile: true },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
try {
  for (const v of views) {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errors.push(`${v.name}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${v.name}: ${m.text()}`); });
    await page.setViewport({ width: v.width, height: v.height, deviceScaleFactor: 1, isMobile: v.mobile, hasTouch: v.mobile, isLandscape: v.width > v.height });
    await page.goto(base, { waitUntil: 'networkidle0' });
    await page.click('#boot button');
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(out, `${v.name}-1-title.png`) });
    await page.evaluate(() => { const P = window.__pikko; P.ui.close(); P.ui.showHud(); P.game.start({ mode: 'classic', bagId: 'japan', trial: true }); });
    await page.waitForFunction(() => { const G = window.__pikko.game; return G.round >= 1 && G.slots.every((s) => s.state === 'idle'); }, { timeout: 60000 });
    await page.screenshot({ path: path.join(out, `${v.name}-2-game.png`) });
    const info = await page.evaluate(() => { const G = window.__pikko.game; return { round: G.round, foods: G.slots.map((s) => s.food.id), labels: G.labelData().map((l) => [Math.round(l.x), Math.round(l.y)]) }; });
    console.log(v.name, JSON.stringify(info));
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
