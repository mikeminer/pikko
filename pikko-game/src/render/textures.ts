import * as THREE from 'three';

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function rand(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/** Oiled oak table top: colour map + matching bump map (grain runs along X). */
export function woodTextures(): { map: THREE.Texture; bump: THREE.Texture } {
  const W = 1024, H = 512;
  const [c, g] = canvas(W, H);
  const [cb, gb] = canvas(W, H);
  const r = rand(7);
  g.fillStyle = '#b07a48';
  g.fillRect(0, 0, W, H);
  gb.fillStyle = '#808080';
  gb.fillRect(0, 0, W, H);
  // planks
  const planks = 5;
  for (let p = 0; p < planks; p++) {
    const y0 = (p * H) / planks;
    const tone = 0.85 + r() * 0.3;
    g.fillStyle = `rgba(${Math.round(150 * tone)},${Math.round(100 * tone)},${Math.round(58 * tone)},0.55)`;
    g.fillRect(0, y0, W, H / planks);
    // grain lines
    for (let i = 0; i < 70; i++) {
      const y = y0 + r() * (H / planks);
      const amp = 2 + r() * 6;
      const freq = 0.004 + r() * 0.01;
      const phase = r() * 10;
      const dark = r() < 0.5;
      g.strokeStyle = dark ? `rgba(70,40,18,${0.08 + r() * 0.18})` : `rgba(235,190,140,${0.05 + r() * 0.1})`;
      gb.strokeStyle = dark ? `rgba(40,40,40,${0.2 + r() * 0.3})` : `rgba(200,200,200,${0.1 + r() * 0.2})`;
      g.lineWidth = gb.lineWidth = 0.6 + r() * 1.8;
      g.beginPath(); gb.beginPath();
      for (let x = 0; x <= W; x += 8) {
        const yy = y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1 + phase) * amp * 0.3;
        if (x === 0) { g.moveTo(x, yy); gb.moveTo(x, yy); } else { g.lineTo(x, yy); gb.lineTo(x, yy); }
      }
      g.stroke(); gb.stroke();
    }
    // knots
    if (r() < 0.6) {
      const kx = r() * W, ky = y0 + (0.3 + r() * 0.4) * (H / planks);
      for (let k = 0; k < 6; k++) {
        g.strokeStyle = `rgba(60,32,14,${0.25 - k * 0.03})`;
        g.beginPath(); g.ellipse(kx, ky, 6 + k * 5, 3 + k * 2.2, 0, 0, Math.PI * 2); g.stroke();
      }
    }
    // plank seam
    g.fillStyle = 'rgba(40,22,10,0.55)';
    g.fillRect(0, y0, W, 2);
    gb.fillStyle = '#202020';
    gb.fillRect(0, y0, W, 2);
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(cb);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  return { map, bump };
}

/** Red/white gingham bib. Returns the texture and a function that adds a food stain. */
export function ginghamTexture(colors: [string, string] = ['#f6f1e7', '#d7263d']): { tex: THREE.CanvasTexture; stain: (color: string) => void; clean: () => void } {
  const S = 256;
  const [c, g] = canvas(S, S);
  const paint = () => {
    g.fillStyle = colors[0];
    g.fillRect(0, 0, S, S);
    const n = 8, cell = S / n;
    g.globalAlpha = 0.55;
    g.fillStyle = colors[1];
    for (let i = 0; i < n; i += 2) { g.fillRect(i * cell, 0, cell, S); g.fillRect(0, i * cell, S, cell); }
    g.globalAlpha = 1;
    // woven texture
    g.fillStyle = 'rgba(0,0,0,0.05)';
    for (let y = 0; y < S; y += 2) g.fillRect(0, y, S, 1);
    // hem
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(0, 0, S, 4); g.fillRect(0, S - 4, S, 4);
  };
  paint();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  const r = rand(11);
  return {
    tex,
    stain(color: string) {
      const x = 30 + r() * (S - 60), y = 40 + r() * (S - 80), rad = 8 + r() * 16;
      g.fillStyle = color;
      g.globalAlpha = 0.55;
      g.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.5) {
        const rr = rad * (0.7 + r() * 0.5);
        const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.closePath(); g.fill();
      g.globalAlpha = 1;
      tex.needsUpdate = true;
    },
    clean() { paint(); tex.needsUpdate = true; },
  };
}

/** Soft radial blob used as a cheap contact shadow under objects. */
export function blobShadowTexture(): THREE.Texture {
  const S = 128;
  const [c, g] = canvas(S, S);
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.25)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

/** Fine organic noise for bump maps on fruit skins, dough, vinyl. */
export function noiseTexture(): THREE.Texture {
  const S = 128;
  const [c, g] = canvas(S, S);
  const img = g.createImageData(S, S);
  const r = rand(3);
  for (let i = 0; i < S * S; i++) {
    const v = 110 + r() * 40;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

/** Linen placemat. */
export function linenTexture(): THREE.Texture {
  const S = 256;
  const [c, g] = canvas(S, S);
  g.fillStyle = '#e9e1d2';
  g.fillRect(0, 0, S, S);
  const r = rand(5);
  for (let i = 0; i < S; i += 2) {
    g.fillStyle = `rgba(120,100,80,${0.05 + r() * 0.08})`;
    g.fillRect(0, i, S, 1);
    g.fillStyle = `rgba(120,100,80,${0.04 + r() * 0.06})`;
    g.fillRect(i, 0, 1, S);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  return t;
}

/** Stripes for aprons / papel picado bibs. */
export function stripesTexture(colors: string[]): THREE.CanvasTexture {
  const S = 128;
  const [c, g] = canvas(S, S);
  const w = S / colors.length;
  colors.forEach((col, i) => { g.fillStyle = col; g.fillRect(i * w, 0, w + 1, S); });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  return t;
}
