// Launcher icons and splash for the Android app, made from the game's own icon (../pikko-game/public/icon-512.png).
// Writes app/src/main/res/mipmap-*/ic_launcher*.png and drawable-nodpi/splash.png. The PNGs are committed, so
// building the APK does not need this script. Usage: node make-icons.mjs   (needs `sharp`, e.g. from the repo root)
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const SRC = join(HERE, '..', 'pikko-game', 'public', 'icon-512.png');
const RES = join(HERE, 'app', 'src', 'main', 'res');
const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

for (const [density, px] of Object.entries(sizes)) {
  const dir = join(RES, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });
  const square = await sharp(SRC).resize(px, px).png().toBuffer();
  await sharp(square).toFile(join(dir, 'ic_launcher.png'));
  const circle = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}" fill="#fff"/></svg>`);
  await sharp(square).composite([{ input: circle, blend: 'dest-in' }]).png().toFile(join(dir, 'ic_launcher_round.png'));
}
mkdirSync(join(RES, 'drawable-nodpi'), { recursive: true });
await sharp(SRC).resize(320, 320).png().toFile(join(RES, 'drawable-nodpi', 'splash.png'));
console.log('icons and splash written');
