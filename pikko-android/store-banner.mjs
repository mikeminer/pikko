// Feature graphic 1200x600 for the dApp Store listing: the wordmark (Pikko is the "I") on the logo's cream. Usage: node store-banner.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const logo = await sharp(join(HERE, '..', 'PIKKO_LOGO', 'PIKKO_logo_2000_transparent.png')).resize({ width: 980 }).png().toBuffer();
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="#f3e7d3"/>
<text x="600" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="46" fill="#4a1d0c">Yum or Bleah! Feed Pikko, eat smart.</text></svg>`);
await sharp(bg).composite([{ input: logo, left: 110, top: 70 }]).png().toFile(join(HERE, 'store', 'banner-1200x600.png'));
console.log('banner written');
