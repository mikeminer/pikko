// Renders public/logos/*.svg to PNG (1024 and 512) for Pump.fun + a round-crop contact sheet for review.
// Usage: node tools/render_logos.mjs <pngOutDir> <sheetPng>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require(path.resolve('..', 'node_modules', 'puppeteer-core'));
const outDir = process.argv[2];
const sheet = process.argv[3];
fs.mkdirSync(outDir, { recursive: true });
const bags = JSON.parse(fs.readFileSync('src/data/bags.json', 'utf8')).bags;
const items = [{ id: 'base', country: 'PIKKO' }, ...bags.map((b) => ({ id: b.id, country: b.country }))];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  for (const size of [1024, 512]) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    for (const it of items) {
      const svg = fs.readFileSync(`public/logos/${it.id}.svg`, 'utf8');
      await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg.replace('width="1024" height="1024"', `width="${size}" height="${size}"`)}</body></html>`);
      const file = path.join(outDir, `PIKKO_${it.country}_${it.id}_${size}.png`);
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width: size, height: size } });
    }
  }
  // contact sheet: round crops, as wallets/explorers show token logos
  const cells = items.map((it) => `<figure><img src="data:image/png;base64,${fs.readFileSync(path.join(outDir, `PIKKO_${it.country}_${it.id}_512.png`)).toString('base64')}"><figcaption>${it.country} · ${it.id}</figcaption></figure>`).join('');
  await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 1 });
  await page.goto('about:blank');
  await page.setContent(`<!doctype html><html><body style="margin:0;padding:16px;background:#1f1a16;font:600 14px system-ui;color:#eee;display:grid;grid-template-columns:repeat(7,1fr);gap:14px">
<style>figure{margin:0;text-align:center} img{width:170px;height:170px;border-radius:50%;display:block;margin:0 auto 6px}</style>${cells}</body></html>`, { waitUntil: 'load' });
  await page.screenshot({ path: sheet, fullPage: true });
} finally {
  await browser.close();
}
console.log('rendered', items.length, 'logos x2 sizes ->', outDir);
