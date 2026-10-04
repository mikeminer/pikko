// Renders public/pikko-logo.svg (the PIKKO wordmark, Pikko is the I) to PNGs.
// Usage: node tools/render_brand_logo.mjs <outDir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require(path.resolve('..', 'node_modules', 'puppeteer-core'));
const out = process.argv[2] ?? 'brand';
fs.mkdirSync(out, { recursive: true });
const svg = fs.readFileSync(path.resolve('public', 'pikko-logo.svg'), 'utf8');

const variants = [
  { name: 'PIKKO_logo_2000_transparent.png', w: 2000, bg: 'transparent', pad: 0 },
  { name: 'PIKKO_logo_1000_transparent.png', w: 1000, bg: 'transparent', pad: 0 },
  { name: 'PIKKO_logo_2000_cream.png', w: 2000, bg: '#f3e7d6', pad: 120 },
  { name: 'PIKKO_logo_2000_dark.png', w: 2000, bg: '#2b1a10', pad: 120 },
];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  for (const v of variants) {
    const h = Math.round((v.w * 380) / 1080);
    await page.setViewport({ width: v.w + v.pad * 2, height: h + v.pad * 2, deviceScaleFactor: 1 });
    await page.setContent(`<html><body style="margin:0;background:${v.bg}"><div style="padding:${v.pad}px;line-height:0">${svg.replace('<svg ', `<svg width="${v.w}" height="${h}" `)}</div></body></html>`);
    await page.screenshot({ path: path.join(out, v.name), omitBackground: v.bg === 'transparent' });
    console.log('wrote', v.name);
  }
} finally {
  await browser.close();
}
