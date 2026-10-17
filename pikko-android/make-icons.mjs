// Launcher icons and splash for the Android app: Pikko himself (the "I" of the wordmark, ../PIKKO_LOGO/PIKKO_logo.svg,
// cut out of it by dropping the letters) on a warm peach-to-orange background.
// Writes app/src/main/res/mipmap-*/ic_launcher*.png and drawable-nodpi/splash.png. The PNGs are committed, so
// building the APK does not need this script. Usage: node make-icons.mjs   (needs `sharp`, e.g. from the repo root)
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const RES = join(HERE, 'app', 'src', 'main', 'res');
const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

// the wordmark minus its letters = Pikko alone; the viewBox frames the character (body, arms, sprout)
const svg = readFileSync(join(HERE, '..', 'PIKKO_LOGO', 'PIKKO_logo.svg'), 'utf8')
  .replace(/<use href="#letters"[^>]*\/>/g, '')
  .replace(/viewBox="[^"]*"/, 'viewBox="196 -4 270 356"')
  .replace(/<svg /, '<svg width="540" height="712" ');
const pikko = await sharp(Buffer.from(svg), { density: 144 }).resize({ height: 640 }).png().toBuffer();

/** square art of `px`: warm radial background, Pikko centred at `fill` of the height, optional circular crop */
async function art(px, fill) {
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><defs><radialGradient id="g" cx="0.5" cy="0.38" r="0.75"><stop offset="0" stop-color="#fff1e0"/><stop offset="0.55" stop-color="#ffcf9f"/><stop offset="1" stop-color="#ff9a5c"/></radialGradient></defs><rect width="${px}" height="${px}" fill="url(#g)"/></svg>`);
  const p = await sharp(pikko).resize({ height: Math.round(px * fill) }).png().toBuffer();
  return sharp(bg).composite([{ input: p, gravity: 'center' }]).png().toBuffer();
}

for (const [density, px] of Object.entries(sizes)) {
  const dir = join(RES, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });
  const square = await art(px, 0.84);
  await sharp(square).toFile(join(dir, 'ic_launcher.png'));
  const circle = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}" fill="#fff"/></svg>`);
  await sharp(square).composite([{ input: circle, blend: 'dest-in' }]).png().toFile(join(dir, 'ic_launcher_round.png'));
}
mkdirSync(join(RES, 'drawable-nodpi'), { recursive: true });
// splash: Pikko alone on a transparent background (the flat splash colour comes from the manifest)
await sharp(pikko).resize({ height: 300 }).toFile(join(RES, 'drawable-nodpi', 'splash.png'));
await sharp(await art(512, 0.84)).toFile(join(HERE, 'icon-512.png')); // reference copy (store listing / preview)
console.log('icons and splash written');
