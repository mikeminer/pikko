// Procedural food models (labelled placeholders until HD scans exist, GDD §13.9).
// 1 unit = 10 cm. Every model sits on y = 0, centred on x/z, and is normalised to the plate size.
import * as THREE from 'three';
import type { Food } from '../data/foods';
import { type Shape, visualFor } from '../data/visuals';
import { noiseTexture } from './textures';

let noise: THREE.Texture | null = null;
const matCache = new Map<string, THREE.Material>();

function mat(color: string, rough = 0.6, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}): THREE.Material {
  const key = `${color}|${rough}|${JSON.stringify(opts)}`;
  let m = matCache.get(key);
  if (!m) {
    noise ??= noiseTexture();
    m = new THREE.MeshPhysicalMaterial({ color, roughness: rough, bumpMap: noise, bumpScale: 0.6, ...opts });
    matCache.set(key, m);
  }
  return m;
}
const glossy = (c: string) => mat(c, 0.25, { clearcoat: 0.6, clearcoatRoughness: 0.3 });
const ceramic = () => mat('#f7f4ee', 0.18, { clearcoat: 1, clearcoatRoughness: 0.08 });
const glass = () => mat('#ffffff', 0.04, { transparent: true, opacity: 0.28, clearcoat: 1, depthWrite: false });
const metal = (c: string) => mat(c, 0.3, { metalness: 0.85 });

function m(geo: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function seeded(id: string) {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const SPRINKLES = ['#ff4d6d', '#ffd60a', '#3a86ff', '#80ed99', '#ffffff', '#c77dff'];

function bowlGeo(r = 0.36, h = 0.2): THREE.BufferGeometry {
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(r * 0.55, 0), new THREE.Vector2(r * 0.6, 0.02),
    new THREE.Vector2(r * 0.85, h * 0.4), new THREE.Vector2(r, h), new THREE.Vector2(r * 0.94, h), new THREE.Vector2(r * 0.8, h * 0.45),
    new THREE.Vector2(r * 0.5, h * 0.12), new THREE.Vector2(0, h * 0.1)];
  return new THREE.LatheGeometry(pts, 40);
}

type Builder = (g: THREE.Group, c: string[], rnd: () => number, f: Food) => void;

const B: Record<Shape, Builder> = {
  fruit(g, c, _r, f) {
    const kiwi = f.id === 'kiwi';
    const body = m(new THREE.SphereGeometry(0.3, 40, 28), kiwi ? mat(c[0], 0.95) : glossy(c[0]), 0, 0.27, 0, 0, 0, 0, 1, 0.9, 1);
    g.add(body);
    if (f.id.includes('apple') || f.id === 'pear' || f.id === 'peach') {
      g.add(m(new THREE.CylinderGeometry(0.012, 0.018, 0.12, 8), mat('#5c4426', 0.8), 0.01, 0.56, 0, 0, 0, 0.2));
      g.add(m(new THREE.SphereGeometry(0.06, 16, 8), mat('#3a7d2c', 0.5), 0.07, 0.58, 0, 0, 0, -0.6, 1.4, 0.25, 0.7));
    } else if (/orange|mandarin|clementine|tomato|pepper|persimmon/.test(f.id)) {
      g.add(m(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6), mat(c[1] ?? '#3a7d2c', 0.6), 0, 0.53, 0));
    }
    if (f.id === 'pear') body.scale.set(0.85, 1.15, 0.85);
    if (/mango|papaya|guava|melon(?!_)/.test(f.id)) body.scale.set(1.2, 0.85, 0.9);
  },
  berries(g, c, r) {
    g.add(m(bowlGeo(0.36, 0.16), ceramic()));
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.22;
      const s = 0.07 + r() * 0.03;
      g.add(m(new THREE.SphereGeometry(s, 16, 12), glossy(i % 5 === 4 && c[1] ? c[1] : c[0]), Math.cos(a) * d, 0.14 + r() * 0.1, Math.sin(a) * d, 0, 0, 0, 1, 1.15, 1));
    }
  },
  banana(g, c) {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.32, 0.18, 0), new THREE.Vector3(-0.15, 0.08, 0), new THREE.Vector3(0.12, 0.08, 0), new THREE.Vector3(0.32, 0.2, 0)]);
    g.add(m(new THREE.TubeGeometry(curve, 32, 0.075, 8, false), mat(c[0], 0.5)));
    g.add(m(new THREE.SphereGeometry(0.075, 12, 8), mat(c[0], 0.5), -0.32, 0.18, 0));
    g.add(m(new THREE.CylinderGeometry(0.02, 0.03, 0.06, 6), mat(c[1], 0.8), 0.34, 0.22, 0, 0, 0, -0.9));
  },
  carrot(g, c) {
    g.add(m(new THREE.ConeGeometry(0.1, 0.62, 20), mat(c[0], 0.65), 0, 0.1, 0, 0, 0, Math.PI / 2));
    for (let i = -1; i <= 1; i++) g.add(m(new THREE.ConeGeometry(0.02, 0.22, 6), mat(c[1], 0.6), -0.4, 0.12 + i * 0.03, i * 0.03, 0, 0, Math.PI / 2 + i * 0.3));
  },
  tree(g, c, r) {
    g.add(m(new THREE.CylinderGeometry(0.06, 0.09, 0.3, 12), mat(c[1], 0.7), 0, 0.15, 0));
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.17;
      g.add(m(new THREE.SphereGeometry(0.09 + r() * 0.04, 12, 10), mat(c[0], 0.9), Math.cos(a) * d, 0.34 + r() * 0.1, Math.sin(a) * d));
    }
  },
  sticks(g, c, r) {
    g.add(m(new THREE.CylinderGeometry(0.16, 0.14, 0.3, 24, 1, true), glass(), 0, 0.15, 0));
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      g.add(m(new THREE.CylinderGeometry(0.025, 0.03, 0.55, 8), mat(i % 3 === 2 && c[1] ? c[1] : c[0], 0.6), Math.cos(a) * 0.07, 0.3, Math.sin(a) * 0.07, Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2 + (r() - 0.5) * 0.2));
    }
  },
  bowl(g, c, r) {
    g.add(m(bowlGeo(), ceramic()));
    g.add(m(new THREE.CylinderGeometry(0.32, 0.25, 0.04, 32), mat(c[0], 0.75), 0, 0.17, 0));
    for (let i = 0; i < 7; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.22;
      g.add(m(new THREE.SphereGeometry(0.035 + r() * 0.025, 10, 8), mat(c[1], 0.5), Math.cos(a) * d, 0.2, Math.sin(a) * d, 0, 0, 0, 1, 0.7, 1));
    }
  },
  soup(g, c, r) {
    g.add(m(bowlGeo(0.38, 0.2), ceramic()));
    g.add(m(new THREE.CylinderGeometry(0.34, 0.26, 0.03, 40), mat(c[0], 0.12, { clearcoat: 1 }), 0, 0.17, 0));
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.2;
      g.add(m(new THREE.SphereGeometry(0.03, 8, 6), mat(c[1], 0.6), Math.cos(a) * d, 0.19, Math.sin(a) * d, 0, 0, 0, 1, 0.4, 1));
    }
  },
  glass(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.17, 0.14, 0.6, 32, 1, true), glass(), 0, 0.3, 0));
    g.add(m(new THREE.CylinderGeometry(0.155, 0.13, 0.48, 32), mat(c[0], 0.2, { transparent: true, opacity: 0.88 }), 0, 0.25, 0));
    g.add(m(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 8), mat('#ff4d6d', 0.4), 0.06, 0.48, 0, 0, 0, -0.25));
  },
  cup(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.18, 0.13, 0.55, 32), mat(c[0], 0.5), 0, 0.275, 0));
    g.add(m(new THREE.CylinderGeometry(0.185, 0.185, 0.12, 32, 1, true), mat('#ffffff', 0.6), 0, 0.35, 0));
    g.add(m(new THREE.SphereGeometry(0.17, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(c[1] ?? '#fff6e8', 0.7), 0, 0.55, 0));
    g.add(m(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), mat('#3a86ff', 0.4), 0.05, 0.75, 0, 0, 0, -0.15));
  },
  can(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.15, 0.15, 0.46, 40), metal(c[0]), 0, 0.23, 0));
    g.add(m(new THREE.CylinderGeometry(0.152, 0.152, 0.14, 40, 1, true), mat(c[1], 0.4), 0, 0.24, 0));
    g.add(m(new THREE.CylinderGeometry(0.13, 0.15, 0.03, 40), metal('#cfd3d6'), 0, 0.475, 0));
    g.add(m(new THREE.TorusGeometry(0.03, 0.008, 6, 16), metal('#cfd3d6'), 0.04, 0.495, 0, Math.PI / 2));
  },
  bottle(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 32), mat(c[0], 0.15, { transparent: true, opacity: 0.85, clearcoat: 1 }), 0, 0.25, 0));
    g.add(m(new THREE.CylinderGeometry(0.06, 0.15, 0.16, 32), mat(c[0], 0.15, { transparent: true, opacity: 0.85 }), 0, 0.58, 0));
    g.add(m(new THREE.CylinderGeometry(0.155, 0.155, 0.16, 32, 1, true), mat(c[1], 0.5), 0, 0.28, 0));
    g.add(m(new THREE.CylinderGeometry(0.065, 0.065, 0.07, 16), mat('#f8f8f8', 0.5), 0, 0.69, 0));
  },
  mug(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.2, 0.18, 0.36, 32, 1, true), mat(c[1], 0.25, { clearcoat: 1, side: THREE.DoubleSide }), 0, 0.18, 0));
    g.add(m(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 32), mat(c[1], 0.3), 0, 0.01, 0));
    g.add(m(new THREE.CylinderGeometry(0.19, 0.19, 0.01, 32), mat(c[0], 0.1, { clearcoat: 1 }), 0, 0.3, 0));
    g.add(m(new THREE.TorusGeometry(0.09, 0.025, 10, 20, Math.PI), mat(c[1], 0.3), 0.2, 0.18, 0, 0, 0, -Math.PI / 2));
  },
  donut(g, c, r, f) {
    g.add(m(new THREE.TorusGeometry(0.2, 0.11, 20, 36), mat(c[0], 0.75), 0, 0.11, 0, Math.PI / 2, 0, 0, 1, 1, 0.9));
    if (f.id !== 'jumbo_pretzel') {
      g.add(m(new THREE.TorusGeometry(0.2, 0.112, 16, 36, Math.PI * 2), glossy(c[1]), 0, 0.14, 0, Math.PI / 2, 0, 0, 1, 1, 0.55));
      for (let i = 0; i < 18; i++) {
        const a = r() * Math.PI * 2, d = 0.13 + r() * 0.14;
        g.add(m(new THREE.CapsuleGeometry(0.008, 0.03, 2, 4), mat(SPRINKLES[i % SPRINKLES.length], 0.4), Math.cos(a) * d, 0.22, Math.sin(a) * d, Math.PI / 2, 0, r() * 3));
      }
    }
  },
  ball(g, c) {
    const pos = [[-0.12, 0.13, 0.05], [0.13, 0.13, 0.04], [0, 0.13, -0.13], [0, 0.31, -0.02]];
    for (const [x, y, z] of pos) {
      g.add(m(new THREE.SphereGeometry(0.14, 24, 16), mat(c[0], 0.7), x, y, z));
      g.add(m(new THREE.SphereGeometry(0.142, 24, 12, 0, Math.PI * 2, 0, 1.1), glossy(c[1]), x, y + 0.005, z));
    }
  },
  burger(g, c, r, f) {
    const sandwich = !/burger/.test(f.id);
    if (sandwich) {
      g.add(m(new THREE.BoxGeometry(0.6, 0.08, 0.42), mat(c[0], 0.85), 0, 0.04, 0));
      g.add(m(new THREE.BoxGeometry(0.62, 0.05, 0.44), mat(c[1], 0.6), 0, 0.105, 0));
      g.add(m(new THREE.BoxGeometry(0.63, 0.025, 0.45), mat('#6a994e', 0.6), 0, 0.14, 0));
      g.add(m(new THREE.BoxGeometry(0.6, 0.08, 0.42), mat(c[0], 0.85), 0, 0.19, 0));
      return;
    }
    g.add(m(new THREE.CylinderGeometry(0.28, 0.26, 0.09, 32), mat(c[0], 0.8), 0, 0.045, 0));
    g.add(m(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 32), mat('#5a3420', 0.9), 0, 0.13, 0));
    g.add(m(new THREE.BoxGeometry(0.46, 0.015, 0.46), mat('#ffbe0b', 0.5), 0, 0.18, 0, 0, 0.6, 0));
    g.add(m(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 24), mat('#6a994e', 0.6), 0, 0.2, 0));
    g.add(m(new THREE.SphereGeometry(0.29, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(c[0], 0.6, { clearcoat: 0.4 }), 0, 0.21, 0, 0, 0, 0, 1, 0.7, 1));
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.2;
      g.add(m(new THREE.SphereGeometry(0.012, 6, 4), mat('#fff3d6', 0.5), Math.cos(a) * d, 0.21 + Math.sqrt(Math.max(0, 0.29 * 0.29 - d * d)) * 0.7, Math.sin(a) * d, 0, 0, 0, 1.6, 0.6, 1));
    }
  },
  wrap(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.13, 0.13, 0.55, 28), mat(c[0], 0.85), 0, 0.13, 0, 0, 0, Math.PI / 2));
    g.add(m(new THREE.CircleGeometry(0.12, 24), mat(c[1], 0.6), 0.276, 0.13, 0, 0, Math.PI / 2, 0));
    g.add(m(new THREE.CylinderGeometry(0.135, 0.135, 0.2, 28, 1, true), mat('#f1ead6', 0.9, { side: THREE.DoubleSide }), -0.15, 0.13, 0, 0, 0, Math.PI / 2));
  },
  hotdog(g, c) {
    g.add(m(new THREE.CapsuleGeometry(0.11, 0.42, 6, 16), mat(c[0], 0.8), 0, 0.1, 0, 0, 0, Math.PI / 2, 1, 1, 1.25));
    g.add(m(new THREE.CapsuleGeometry(0.06, 0.52, 6, 16), glossy(c[1]), 0, 0.18, 0, 0, 0, Math.PI / 2));
    const pts = Array.from({ length: 12 }, (_, i) => new THREE.Vector3(-0.25 + i * 0.045, 0.245, Math.sin(i * 1.4) * 0.04));
    g.add(m(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.012, 6), mat('#ffd60a', 0.4)));
  },
  pizza(g, c, r) {
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24, 1, false, -0.4, 0.8);
    g.add(m(geo, mat(c[0], 0.85), -0.25, 0.025, 0, 0, Math.PI / 2, 0));
    g.add(m(new THREE.CylinderGeometry(0.46, 0.46, 0.02, 24, 1, false, -0.38, 0.76), mat('#f4d58d', 0.6), -0.25, 0.06, 0, 0, Math.PI / 2, 0));
    g.add(m(new THREE.TorusGeometry(0.48, 0.035, 8, 12, 0.8), mat(c[0], 0.8), -0.25, 0.05, 0, Math.PI / 2, 0, Math.PI / 2 - 0.4));
    for (let i = 0; i < 4; i++) g.add(m(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 16), mat(c[1], 0.5), -0.1 + r() * 0.3, 0.075, (r() - 0.5) * 0.15));
  },
  fries(g, c, r) {
    const box = m(new THREE.CylinderGeometry(0.2, 0.14, 0.32, 4, 1, true), mat(c[1], 0.5, { side: THREE.DoubleSide }), 0, 0.16, 0, 0, Math.PI / 4, 0);
    g.add(box);
    for (let i = 0; i < 16; i++) g.add(m(new THREE.BoxGeometry(0.035, 0.36, 0.035), mat(c[0], 0.6), (r() - 0.5) * 0.18, 0.3 + r() * 0.08, (r() - 0.5) * 0.18, (r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4));
  },
  chipsbag(g, c, r) {
    // pillow-shaped foil bag with crimped seals, a window and a few chips spilling out
    const foil = mat(c[1], 0.28, { metalness: 0.45, clearcoat: 0.9 });
    g.add(m(new THREE.BoxGeometry(0.5, 0.56, 0.16, 6, 6, 2), foil, 0, 0.36, 0));
    g.add(m(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 20, 1), foil, 0, 0.36, 0, 0, 0, Math.PI / 2, 1, 1, 0.9));
    for (const y of [0.09, 0.63]) g.add(m(new THREE.BoxGeometry(0.52, 0.05, 0.05), foil, 0, y, 0));
    g.add(m(new THREE.CircleGeometry(0.11, 24), mat(c[0], 0.45), 0, 0.38, 0.165));
    for (let i = 0; i < 4; i++) g.add(m(new THREE.CircleGeometry(0.06, 7), mat(c[0], 0.6, { side: THREE.DoubleSide }), 0.3 + r() * 0.15, 0.02, 0.15 + r() * 0.1, -Math.PI / 2 + r() * 0.4, 0, r() * 3));
  },
  bar(g, c) {
    g.add(m(new THREE.BoxGeometry(0.56, 0.06, 0.2), mat(c[1], 0.3, { metalness: 0.2 }), -0.08, 0.03, 0));
    for (let i = 0; i < 4; i++) g.add(m(new THREE.BoxGeometry(0.1, 0.07, 0.18), mat(c[0], 0.45), 0.08 + i * 0.105, 0.04, 0));
  },
  discs(g, c) {
    for (let i = 0; i < 4; i++) {
      g.add(m(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 32), mat(c[0], 0.8), 0, 0.025 + i * 0.07, 0, 0, i * 0.3, 0));
      if (i < 3) g.add(m(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32), mat(c[1], 0.5), 0, 0.06 + i * 0.07, 0));
    }
  },
  cake(g, c) {
    const th = 0.9;
    for (let i = 0; i < 3; i++) {
      g.add(m(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 20, 1, false, 0, th), mat(i % 2 ? c[1] : c[0], i % 2 ? 0.5 : 0.85), -0.2, 0.04 + i * 0.085, 0, 0, -th / 2 + Math.PI / 2, 0));
    }
    g.add(m(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 20, 1, false, 0, th), mat('#fff8ee', 0.5), -0.2, 0.27, 0, 0, -th / 2 + Math.PI / 2, 0));
    g.add(m(new THREE.SphereGeometry(0.05, 12, 8), glossy('#c1121f'), 0.1, 0.32, 0));
  },
  muffin(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.2, 0.15, 0.2, 18), mat('#f1e3c8', 0.9), 0, 0.1, 0));
    g.add(m(new THREE.SphereGeometry(0.23, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(c[0], 0.8), 0, 0.19, 0, 0, 0, 0, 1, 0.75, 1));
    g.add(m(new THREE.SphereGeometry(0.17, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), glossy(c[1]), 0, 0.3, 0, 0, 0, 0, 1, 0.5, 1));
  },
  cone(g, c) {
    g.add(m(new THREE.ConeGeometry(0.14, 0.45, 20), mat(c[1], 0.8), 0, 0.26, 0, Math.PI, 0, 0));
    g.add(m(new THREE.SphereGeometry(0.17, 24, 16), mat(c[0], 0.6), 0, 0.55, 0));
    g.add(m(new THREE.SphereGeometry(0.14, 24, 16), mat('#ffffff', 0.55), 0.02, 0.72, 0));
  },
  popsicle(g, c) {
    g.add(m(new THREE.CapsuleGeometry(0.12, 0.3, 6, 16), glossy(c[0]), 0, 0.36, 0, 0, 0, 0, 1, 1, 0.55));
    g.add(m(new THREE.BoxGeometry(0.05, 0.25, 0.015), mat(c[1], 0.8), 0, 0.1, 0));
  },
  candy(g, _c, r) {
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.2;
      const col = SPRINKLES[i % SPRINKLES.length];
      const x = Math.cos(a) * d, z = Math.sin(a) * d, y = 0.06 + (i > 5 ? 0.09 : 0);
      g.add(m(new THREE.SphereGeometry(0.06, 14, 10), glossy(col), x, y, z, 0, r() * 3, 0, 1.4, 1, 1));
      g.add(m(new THREE.ConeGeometry(0.04, 0.06, 8), glossy(col), x + 0.1, y, z, 0, 0, Math.PI / 2));
      g.add(m(new THREE.ConeGeometry(0.04, 0.06, 8), glossy(col), x - 0.1, y, z, 0, 0, -Math.PI / 2));
    }
  },
  nuts(g, c, r) {
    g.add(m(bowlGeo(0.3, 0.14), ceramic()));
    for (let i = 0; i < 22; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.19;
      g.add(m(new THREE.SphereGeometry(0.045, 10, 8), mat(i % 3 ? c[0] : c[1], 0.7), Math.cos(a) * d, 0.12 + r() * 0.07, Math.sin(a) * d, r(), r(), r(), 1.5, 0.9, 1));
    }
  },
  egg(g, c, _r, f) {
    if (f.id === 'deviled_eggs') {
      for (const x of [-0.14, 0.14]) {
        g.add(m(new THREE.SphereGeometry(0.13, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(c[0], 0.4), x, 0.13, 0, 0, 0, 0, 1.3, 1, 1));
        g.add(m(new THREE.SphereGeometry(0.07, 14, 10), mat(c[1], 0.7), x, 0.13, 0, 0, 0, 0, 1, 0.5, 1));
      }
      return;
    }
    g.add(m(new THREE.SphereGeometry(0.17, 28, 20), glossy(c[0]), 0, 0.22, 0, 0, 0, 0, 1, 1.3, 1));
    if (f.id === 'pisanka_egg') g.add(m(new THREE.TorusGeometry(0.168, 0.02, 8, 32), glossy(c[1]), 0, 0.22, 0, Math.PI / 2));
  },
  fillet(g, c) {
    g.add(m(new THREE.SphereGeometry(0.3, 28, 16), mat(c[0], 0.55, { clearcoat: 0.3 }), 0, 0.07, 0, 0, 0, 0, 1.3, 0.25, 0.7));
    for (let i = -2; i <= 2; i++) g.add(m(new THREE.BoxGeometry(0.02, 0.01, 0.3), mat(c[1], 0.6), i * 0.1, 0.14, 0, 0, 0.3, 0));
    g.add(m(new THREE.SphereGeometry(0.035, 10, 8), mat('#3a7d2c', 0.6), 0.25, 0.14, 0.08, 0, 0, 0, 1.6, 0.3, 1));
  },
  skewer(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.01, 0.01, 0.75, 6), mat('#c9a66b', 0.8), 0, 0.12, 0, 0, 0, Math.PI / 2));
    for (let i = 0; i < 5; i++) g.add(m(new THREE.BoxGeometry(0.1, 0.1, 0.1), mat(i % 2 ? c[1] : c[0], 0.75), -0.24 + i * 0.12, 0.12, 0, 0.3 * i, 0.5, 0.2 * i));
  },
  fried(g, c, r) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2, d = i === 6 ? 0 : 0.16;
      g.add(m(new THREE.DodecahedronGeometry(0.1, 1), mat(c[0], 0.9), Math.cos(a) * d, 0.08 + (i === 6 ? 0.08 : 0), Math.sin(a) * d, r(), r(), r(), 1.3, 0.8, 1));
    }
    g.add(m(new THREE.CylinderGeometry(0.08, 0.07, 0.07, 16), ceramic(), 0.3, 0.035, 0.2));
    g.add(m(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 16), glossy('#c1121f'), 0.3, 0.07, 0.2));
  },
  bread(g, c, r, f) {
    g.add(m(new THREE.BoxGeometry(0.42, 0.06, 0.36), mat(c[1] ?? '#f3e2c0', 0.95), 0, 0.03, 0));
    g.add(m(new THREE.BoxGeometry(0.44, 0.065, 0.02), mat(c[0], 0.9), 0, 0.03, 0.19));
    g.add(m(new THREE.BoxGeometry(0.44, 0.065, 0.02), mat(c[0], 0.9), 0, 0.03, -0.19));
    if (f.id === 'bruschetta') for (let i = 0; i < 8; i++) g.add(m(new THREE.BoxGeometry(0.06, 0.04, 0.06), glossy('#d62828'), (r() - 0.5) * 0.3, 0.08, (r() - 0.5) * 0.25));
  },
  sushi(g, c) {
    for (const x of [-0.14, 0.14]) {
      g.add(m(new THREE.CapsuleGeometry(0.08, 0.14, 4, 12), mat(c[0], 0.9), x, 0.08, 0, 0, 0, Math.PI / 2, 1, 1, 1.1));
      g.add(m(new THREE.BoxGeometry(0.28, 0.035, 0.17), glossy(c[1]), x, 0.17, 0));
    }
  },
  avocado(g, c) {
    g.add(m(new THREE.SphereGeometry(0.25, 28, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(c[0], 0.6), 0, 0.2, 0, 0, 0, 0, 0.85, 0.8, 1.15));
    g.add(m(new THREE.CircleGeometry(0.24, 28), mat(c[1], 0.5), 0, 0.201, 0, -Math.PI / 2, 0, 0, 0.85, 1.15, 1));
    g.add(m(new THREE.SphereGeometry(0.09, 20, 14), glossy('#6b3e26'), 0, 0.2, 0.03));
  },
  tuber(g, c) {
    g.add(m(new THREE.SphereGeometry(0.2, 28, 18), mat(c[0], 0.55), 0, 0.16, 0, 0, 0, 0.2, 1.6, 0.8, 0.85));
    g.add(m(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 8), mat(c[1], 0.7), 0.33, 0.2, 0, 0, 0, -1.2));
  },
  pineapple(g, c) {
    g.add(m(new THREE.SphereGeometry(0.2, 24, 18), mat(c[0], 0.9), 0, 0.28, 0, 0, 0, 0, 1, 1.4, 1));
    for (let i = 0; i < 8; i++) g.add(m(new THREE.ConeGeometry(0.03, 0.28, 6), mat(c[1], 0.6), Math.cos(i) * 0.04, 0.66, Math.sin(i) * 0.04, Math.sin(i) * 0.4, 0, Math.cos(i) * 0.4));
  },
  melonslice(g, c) {
    g.add(m(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 32, 1, false, 0, Math.PI), mat(c[0], 0.5), 0, 0.2, 0, Math.PI / 2, 0, 0));
    g.add(m(new THREE.TorusGeometry(0.4, 0.04, 8, 32, Math.PI), mat(c[1], 0.5), 0, 0.2, 0, 0, 0, Math.PI));
    for (let i = 0; i < 6; i++) g.add(m(new THREE.SphereGeometry(0.02, 8, 6), mat('#111', 0.3), -0.2 + i * 0.08, 0.32 + Math.sin(i) * 0.03, 0.062, 0, 0, 0, 1, 1.6, 0.6));
  },
  shells(g, c, r) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      g.add(m(new THREE.SphereGeometry(0.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), glossy(c[0]), Math.cos(a) * 0.17, 0.06 + r() * 0.04, Math.sin(a) * 0.17, Math.PI, a, 0, 1.4, 0.5, 0.9));
      g.add(m(new THREE.SphereGeometry(0.06, 10, 8), mat(c[1], 0.5), Math.cos(a) * 0.17, 0.07, Math.sin(a) * 0.17, 0, 0, 0, 1.3, 0.5, 0.8));
    }
  },
  mound(g, c, r) {
    g.add(m(new THREE.SphereGeometry(0.3, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat(c[0], 0.8), 0, 0, 0, 0, 0, 0, 1, 0.55, 1));
    for (let i = 0; i < 6; i++) g.add(m(new THREE.SphereGeometry(0.03, 8, 6), mat(c[1], 0.6), (r() - 0.5) * 0.35, 0.12 + r() * 0.04, (r() - 0.5) * 0.35));
  },
  leaves(g, c, r) {
    g.add(m(bowlGeo(0.38, 0.18), ceramic()));
    for (let i = 0; i < 12; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.2;
      g.add(m(new THREE.SphereGeometry(0.1, 12, 8), mat(i % 4 === 3 ? c[1] : c[0], 0.6), Math.cos(a) * d, 0.18 + r() * 0.08, Math.sin(a) * d, r() * 2, r() * 2, r() * 2, 1.3, 0.2, 0.8));
    }
  },
};

const TARGET_W = 0.78;
const TARGET_H = 0.95;

export function buildFood(f: Food): THREE.Group {
  const v = visualFor(f);
  const g = new THREE.Group();
  (B[v.shape] ?? B.mound)(g, v.colors, seeded(f.id), f);
  // normalise to plate size, base at y = 0
  const box = new THREE.Box3().setFromObject(g);
  const size = box.getSize(new THREE.Vector3());
  const s = Math.min(TARGET_W / Math.max(size.x, size.z, 0.01), TARGET_H / Math.max(size.y, 0.01), 1.6);
  const pivot = new THREE.Group();
  const center = box.getCenter(new THREE.Vector3());
  g.position.set(-center.x, -box.min.y, -center.z);
  pivot.add(g);
  pivot.scale.setScalar(s);
  pivot.userData.foodId = f.id;
  pivot.userData.crumbColor = v.colors[0];
  pivot.userData.height = size.y * s;
  return pivot;
}

export function disposeFood(obj: THREE.Object3D): void {
  obj.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose(); });
}
