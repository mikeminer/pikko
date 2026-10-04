// Procedural Pikko (GDD §2): soft-touch vinyl bean, sprout mood indicator, transparent belly that fills with kcal,
// gingham bib that gets stained, big glossy eyes. All motion is driven by smoothed expression parameters.
import * as THREE from 'three';
import { bagById } from '../data/foods';
import { ginghamTexture, stripesTexture } from './textures';

export const PIKKO_ORANGE = '#ff6b35';

export interface Expr {
  mouthOpen: number; // 0..1
  smile: number; // -1 frown .. 1 smile
  lids: number; // 0 open .. 1 closed
  squint: number; // lower lids 0..1
  tongue: number; // 0..1
  puff: number; // cheeks puffed 0..1
  tint: number; // green tint 0..1
  droop: number; // sprout droop -0.3..1
  bloom: number; // flower 0..1
  armL: number; // radians
  armR: number;
  lean: number; // forward(+)/back(-)
  squash: number; // vertical squash 0.8..1.2
  shake: number; // jitter amplitude
  cross: number; // eyes crossed 0..1
  turn: number; // body yaw
  brow: number; // -1 disgust/angry .. +1 worried/sad
}

const NEUTRAL: Expr = { mouthOpen: 0, smile: 0.6, lids: 0, squint: 0, tongue: 0, puff: 0, tint: 0, droop: 0, bloom: 0, armL: 0.35, armR: -0.35, lean: 0, squash: 1, shake: 0, cross: 0, turn: 0, brow: 0.2 };

export type AccessoryKind = 'none' | 'straw_hat' | 'cap' | 'fisher_hat' | 'santa' | 'band' | 'headset' | 'ears' | 'glasses3d' | 'sunglasses' | 'lei' | 'scarf' | 'pumpkin' | 'acorn' | 'mug' | 'backpack'
  | 'chef' | 'beret' | 'wreath' | 'cone_hat' | 'beanie' | 'ushanka' | 'salakot' | 'vinok';

/** Accessory per bag: kind from the catalogue, colours from the country palette (or a fixed natural colour). */
const ACCESSORY_COLORS: Record<string, string[]> = {
  italy: ['#ffffff', '#f1ece2'],
  france: ['#22223b', '#22223b'],
  greece: ['#6b8e3a', '#3b2a4a'],
  india: ['#ff9f1c', '#ffbf69'],
  thailand: ['#ffffff', '#f7d84a'],
  korea: ['#222222', '#ff4d6d'],
  uk: ['#ffd60a', '#f4a261'],
  vietnam: ['#e9c46a', '#a0703c'],
  peru: ['#d91023', '#ffffff', '#f7d84a', '#2a9d8f'],
  usa: ['#ffffff', '#b22234'],
  indonesia: ['#7b3f00', '#e0a526'],
  russia: ['#5c4632', '#8a6d52'],
  ukraine: ['#d62828', '#ffd23f', '#f8f4e9', '#4361ee', '#ff8fa3'],
  philippines: ['#d9b26f', '#8b5a2b'],
};
// bags whose "accessory" is a patterned bib instead of a hat
const BIB_PATTERNS: Record<string, string[]> = {
  mexico: ['#ff006e', '#ffbe0b', '#3a86ff', '#80ed99', '#8338ec'],
  turkey: ['#ffffff', '#e30a17', '#ffffff', '#e30a17'],
};

function phys(color: string, rough = 0.5, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: rough, ...o });
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, shadow = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  return m;
}

// body profile (x = radius, y = height); height ~1.82 units = 18 cm
const PROFILE: [number, number][] = [[0, 0], [0.5, 0.01], [0.64, 0.08], [0.72, 0.26], [0.74, 0.5], [0.71, 0.78], [0.66, 1.02], [0.6, 1.26], [0.52, 1.48], [0.4, 1.66], [0.23, 1.78], [0, 1.82]];
export function bodyRadiusAt(y: number): number {
  for (let i = 1; i < PROFILE.length; i++) {
    const [r0, y0] = PROFILE[i - 1];
    const [r1, y1] = PROFILE[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0 || 1);
  }
  return 0;
}

export class Pikko {
  readonly root = new THREE.Group(); // moves on the table (dodges)
  private readonly body = new THREE.Group(); // squash / lean / shake
  private readonly bodyMat: THREE.MeshPhysicalMaterial;
  private readonly lidMats: THREE.MeshPhysicalMaterial[] = [];
  private readonly mouth = new THREE.Group();
  private readonly mouthInner: THREE.Mesh;
  private readonly tongue: THREE.Mesh;
  private readonly teeth: THREE.Mesh;
  private readonly smileLine: THREE.Mesh;
  private readonly lidsTop: THREE.Object3D[] = [];
  private readonly lidsBottom: THREE.Object3D[] = [];
  private readonly pupils: THREE.Object3D[] = [];
  private readonly brows: THREE.Mesh[] = [];
  private readonly cheeks: THREE.Mesh[] = [];
  private readonly sprout = new THREE.Group();
  private readonly sproutTip = new THREE.Group();
  private readonly leafMat: THREE.MeshPhysicalMaterial;
  private readonly flower = new THREE.Group();
  private readonly arms: THREE.Group[] = [];
  private readonly liquidMat: THREE.MeshPhysicalMaterial;
  private readonly liquidPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  private readonly accessory = new THREE.Group();
  private readonly bibMesh: THREE.Mesh;
  private gingham = ginghamTexture();
  private readonly bibMat: THREE.MeshPhysicalMaterial;

  expr: Expr = { ...NEUTRAL };
  target: Expr = { ...NEUTRAL };
  private level = 0; // belly fill 0..1 (smoothed)
  levelTarget = 0;
  private liquidColor = new THREE.Color('#b9d86a');
  liquidTarget = new THREE.Color('#b9d86a');
  private wobble = 0;
  private wobbleV = 0;
  private sproutV = 0;
  private sproutA = 0;
  private time = 0;
  private blinkAt = 2;
  private blinkT = -1;
  private hop = 0;
  private hopV = 0;
  reducedMotion = false;

  static readonly HEIGHT = 1.82;
  static readonly MOUTH_Y = 1.07;
  static readonly BELLY_Y = 0.46;
  static readonly BELLY_R = 0.25;

  constructor(transmission: boolean) {
    this.root.add(this.body);
    this.bodyMat = phys(PIKKO_ORANGE, 0.48, { clearcoat: 0.22, clearcoatRoughness: 0.5, sheen: 0.35, sheenColor: new THREE.Color('#ffd0b0'), sheenRoughness: 0.6 });
    // smooth the profile with a Catmull-Rom spline so the silhouette has no facets
    const spline = new THREE.CatmullRomCurve3(PROFILE.map(([r, y]) => new THREE.Vector3(r, y, 0)), false, 'centripetal');
    const smooth = spline.getPoints(80).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
    smooth[0].set(0, 0);
    smooth[smooth.length - 1].set(0, PROFILE[PROFILE.length - 1][1]);
    const lathe = new THREE.LatheGeometry(smooth, 96);
    const bodyMesh = mesh(lathe, this.bodyMat);
    this.body.add(bodyMesh);

    // feet
    for (const s of [-1, 1]) {
      const foot = mesh(new THREE.CapsuleGeometry(0.11, 0.16, 6, 16), this.bodyMat);
      foot.rotation.x = Math.PI / 2;
      foot.position.set(s * 0.27, 0.07, 0.2);
      const sole = mesh(new THREE.CapsuleGeometry(0.112, 0.16, 6, 16), phys('#f1ece2', 0.9));
      sole.rotation.x = Math.PI / 2;
      sole.scale.set(1, 1, 0.35);
      sole.position.set(s * 0.27, 0.02, 0.2);
      this.body.add(foot, sole);
    }

    // belly window: dark cavity, clipped liquid, glass dome, rim
    const bz = bodyRadiusAt(Pikko.BELLY_Y);
    const cavity = mesh(new THREE.CircleGeometry(Pikko.BELLY_R, 48), phys('#3b1d10', 0.9), false);
    cavity.position.set(0, Pikko.BELLY_Y, bz + 0.012);
    this.liquidMat = phys('#b9d86a', 0.15, { clearcoat: 1, emissive: new THREE.Color('#2a3a10'), emissiveIntensity: 0.25, clippingPlanes: [this.liquidPlane] });
    const liquid = mesh(new THREE.CircleGeometry(Pikko.BELLY_R * 0.98, 48), this.liquidMat, false);
    liquid.position.set(0, Pikko.BELLY_Y, bz + 0.018);
    const domeMat = transmission
      ? phys('#ffffff', 0.05, { transmission: 1, thickness: 0.15, ior: 1.45, clearcoat: 1, transparent: true })
      : phys('#ffffff', 0.04, { transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false });
    const dome = mesh(new THREE.SphereGeometry(Pikko.BELLY_R + 0.01, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, false);
    dome.rotation.x = Math.PI / 2;
    dome.scale.set(1, 0.3, 1);
    dome.position.set(0, Pikko.BELLY_Y, bz + 0.012);
    const rim = mesh(new THREE.TorusGeometry(Pikko.BELLY_R + 0.02, 0.03, 12, 48), phys('#c94a1e', 0.45, { clearcoat: 0.3 }));
    rim.position.set(0, Pikko.BELLY_Y, bz + 0.004);
    this.body.add(cavity, liquid, dome, rim);

    // bib (curved gingham collar between mouth and belly)
    this.bibMat = phys('#ffffff', 0.85, { map: this.gingham.tex, side: THREE.DoubleSide });
    this.bibMesh = mesh(new THREE.CylinderGeometry(0.705, 0.735, 0.22, 32, 1, true, -0.75, 1.5), this.bibMat);
    this.bibMesh.position.y = 0.86;
    this.bibMesh.scale.set(1.012, 1, 1.012);
    this.body.add(this.bibMesh);

    // eyes
    const eyeY = 1.3;
    for (const s of [-1, 1]) {
      const ex = s * 0.24;
      const ez = Math.sqrt(Math.max(0, bodyRadiusAt(eyeY) ** 2 - ex * ex)) - 0.03;
      const eye = new THREE.Group();
      eye.position.set(ex, eyeY, ez);
      eye.rotation.y = s * 0.33;
      const ball = mesh(new THREE.SphereGeometry(0.105, 32, 24), phys('#0b0b0d', 0.08, { clearcoat: 1, clearcoatRoughness: 0.03 }), false);
      ball.scale.set(1, 1.12, 0.62);
      const pupil = new THREE.Group();
      pupil.add(ball);
      // painted sparkles (two highlights, iconic for vinyl toys)
      const hl = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const h1 = mesh(new THREE.SphereGeometry(0.026, 12, 8), hl, false);
      h1.position.set(-0.03, 0.04, 0.06);
      h1.scale.set(1, 1, 0.4);
      const h2 = mesh(new THREE.SphereGeometry(0.012, 10, 6), hl, false);
      h2.position.set(0.035, -0.035, 0.062);
      h2.scale.set(1, 1, 0.4);
      pupil.add(h1, h2);
      eye.add(pupil);
      this.pupils.push(pupil);
      const lidMat = this.bodyMat.clone();
      this.lidMats.push(lidMat);
      const top = mesh(new THREE.SphereGeometry(0.118, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), lidMat, false);
      top.scale.set(1, 1.1, 0.7);
      const topPivot = new THREE.Group();
      topPivot.add(top);
      const bottom = mesh(new THREE.SphereGeometry(0.118, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lidMat, false);
      bottom.scale.set(1, 1.1, 0.7);
      const botPivot = new THREE.Group();
      botPivot.add(bottom);
      eye.add(topPivot, botPivot);
      this.lidsTop.push(topPivot);
      this.lidsBottom.push(botPivot);
      this.body.add(eye);
      // cheeks
      const cheek = mesh(new THREE.CircleGeometry(0.075, 24), new THREE.MeshBasicMaterial({ color: '#ff8fa3', transparent: true, opacity: 0.55, depthWrite: false }), false);
      const cy = 1.1, cx = s * 0.4;
      const cz = Math.sqrt(Math.max(0, bodyRadiusAt(cy) ** 2 - cx * cx)) + 0.004;
      cheek.position.set(cx, cy, cz);
      cheek.rotation.y = Math.atan2(cx, cz);
      this.cheeks.push(cheek);
      this.body.add(cheek);
      const brow = mesh(new THREE.CapsuleGeometry(0.02, 0.11, 4, 10), phys('#4a0d16', 0.5), false);
      brow.rotation.z = Math.PI / 2;
      const by = 1.47, bx = s * 0.24;
      brow.position.set(bx, by, Math.sqrt(Math.max(0, bodyRadiusAt(by) ** 2 - bx * bx)) + 0.005);
      brow.userData.side = s;
      brow.userData.y = by;
      this.brows.push(brow);
      this.body.add(brow);
    }

    // mouth
    const mz = bodyRadiusAt(Pikko.MOUTH_Y) - 0.01;
    this.mouth.position.set(0, Pikko.MOUTH_Y, mz);
    this.mouthInner = mesh(new THREE.SphereGeometry(0.2, 32, 16), phys('#5c0f1a', 0.7), false);
    this.mouthInner.scale.set(1, 0.05, 0.35);
    this.mouthInner.position.z = 0.02;
    this.tongue = mesh(new THREE.SphereGeometry(0.1, 24, 12), phys('#f28c9a', 0.45, { clearcoat: 0.5 }), false);
    this.tongue.scale.set(1, 0.4, 0.8);
    this.teeth = mesh(new THREE.BoxGeometry(0.11, 0.045, 0.03), phys('#ffffff', 0.2, { clearcoat: 1 }), false);
    this.smileLine = mesh(new THREE.TorusGeometry(0.13, 0.022, 10, 28, Math.PI), phys('#4a0d16', 0.55), false);
    this.smileLine.rotation.z = Math.PI;
    this.smileLine.position.z = 0.035;
    this.mouth.add(this.mouthInner, this.tongue, this.teeth, this.smileLine);
    this.body.add(this.mouth);

    // sprout (2-bone spring)
    this.leafMat = phys('#5bbf3a', 0.45, { side: THREE.DoubleSide, sheen: 0.3 });
    const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, 0.12, 0), new THREE.Vector3(0.05, 0.26, 0)]);
    const stem = mesh(new THREE.TubeGeometry(stemCurve, 16, 0.022, 8), this.leafMat);
    this.sprout.add(stem);
    this.sprout.position.set(0, 1.8, 0);
    this.sproutTip.position.set(0.05, 0.26, 0);
    for (const s of [-1, 1]) {
      const leaf = mesh(new THREE.SphereGeometry(0.1, 20, 10), this.leafMat);
      leaf.scale.set(1.2, 0.18, 0.7);
      leaf.position.set(s * 0.1, 0.03, 0);
      leaf.rotation.z = s * 0.45;
      this.sproutTip.add(leaf);
    }
    for (let i = 0; i < 5; i++) {
      const p = mesh(new THREE.SphereGeometry(0.035, 12, 8), phys('#fff3f8', 0.5), false);
      const a = (i / 5) * Math.PI * 2;
      p.position.set(Math.cos(a) * 0.04, 0.1, Math.sin(a) * 0.04);
      p.scale.set(1, 0.5, 1);
      this.flower.add(p);
    }
    const center = mesh(new THREE.SphereGeometry(0.025, 10, 8), phys('#ffd60a', 0.4), false);
    center.position.y = 0.11;
    this.flower.add(center);
    this.flower.scale.setScalar(0.001);
    this.sproutTip.add(this.flower);
    this.sprout.add(this.sproutTip);
    this.body.add(this.sprout);

    // arms (mitten capsules)
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.68, 0.82, 0.05);
      const arm = mesh(new THREE.CapsuleGeometry(0.075, 0.2, 6, 14), this.bodyMat);
      arm.position.y = -0.15;
      pivot.add(arm);
      this.arms.push(pivot);
      this.body.add(pivot);
    }

    this.body.add(this.accessory);
  }

  /** World position of the mouth centre (for feeding). */
  mouthWorld(out = new THREE.Vector3()): THREE.Vector3 {
    return this.mouth.getWorldPosition(out);
  }

  stain(color: string): void { this.gingham.stain(color); }
  cleanBib(): void { this.gingham.clean(); }

  setAccessory(bagId: string): void {
    this.accessory.clear();
    let bag;
    try { bag = bagById(bagId); } catch { bag = bagById('base'); }
    const a: { kind: AccessoryKind; colors: string[]; bib?: string[] } = {
      kind: (bag.accessoryKind || 'none') as AccessoryKind,
      colors: ACCESSORY_COLORS[bag.id] ?? bag.palette,
      bib: BIB_PATTERNS[bag.id],
    };
    // bib pattern
    if (a.bib) {
      this.bibMat.map = stripesTexture(a.bib);
    } else {
      this.gingham = ginghamTexture();
      this.bibMat.map = this.gingham.tex;
    }
    this.bibMat.needsUpdate = true;
    const [c0, c1] = a.colors;
    // the sprout always stays visible: it grows through tall hats
    this.sprout.position.y = 1.8 + (a.kind === 'chef' ? 0.42 : a.kind === 'cone_hat' ? 0.12 : a.kind === 'salakot' ? 0.1 : a.kind === 'ushanka' ? 0.14 : 0);
    const add = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, rough = 0.6) => {
      const mm = mesh(geo, phys(color, rough));
      mm.position.set(x, y, z);
      mm.rotation.set(rx, ry, rz);
      mm.scale.set(sx, sy, sz);
      this.accessory.add(mm);
      return mm;
    };
    switch (a.kind) {
      case 'straw_hat':
      case 'fisher_hat':
        add(new THREE.CylinderGeometry(0.62, 0.62, 0.02, 40), c0, 0, 1.72, 0, 0.05, 0, 0, 1, 1, 1, 0.9);
        add(new THREE.CylinderGeometry(0.3, 0.36, 0.22, 32), c0, 0, 1.83, 0, 0.05, 0, 0, 1, 1, 1, 0.9);
        add(new THREE.CylinderGeometry(0.365, 0.365, 0.05, 32, 1, true), c1, 0, 1.75, 0);
        break;
      case 'cap':
        add(new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), c0, 0, 1.6, 0, 0, 0, 0, 1, 0.7, 1);
        add(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24, 1, false, -1, 2), c1, 0, 1.62, 0.25, 0.15);
        break;
      case 'santa':
        add(new THREE.ConeGeometry(0.36, 0.6, 32), c0, 0.05, 1.98, 0, 0, 0, -0.25);
        add(new THREE.TorusGeometry(0.34, 0.07, 12, 32), c1, 0, 1.68, 0, Math.PI / 2);
        add(new THREE.SphereGeometry(0.08, 16, 12), c1, 0.24, 2.2, 0);
        break;
      case 'band':
        add(new THREE.TorusGeometry(0.53, 0.05, 10, 48), c0, 0, 1.5, 0, Math.PI / 2, 0, 0, 1, 1, 1.6);
        add(new THREE.SphereGeometry(0.06, 12, 8), c1, 0, 1.5, 0.55);
        break;
      case 'headset':
        add(new THREE.TorusGeometry(0.5, 0.03, 8, 40, Math.PI), c0, 0, 1.48, 0);
        for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24), c0, s * 0.52, 1.42, 0, 0, 0, Math.PI / 2);
        add(new THREE.CylinderGeometry(0.1, 0.1, 0.09, 24), c1, 0.56, 1.42, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0.3);
        break;
      case 'ears':
        for (const s of [-1, 1]) {
          add(new THREE.CapsuleGeometry(0.08, 0.35, 6, 12), c0, s * 0.18, 1.98, 0, 0, 0, -s * 0.2);
          add(new THREE.CapsuleGeometry(0.045, 0.28, 6, 12), c1, s * 0.18, 1.98, 0.05, 0, 0, -s * 0.2);
        }
        break;
      case 'glasses3d':
      case 'sunglasses':
        for (const s of [-1, 1]) {
          const lens = add(new THREE.CircleGeometry(0.12, 24), a.kind === 'glasses3d' ? (s < 0 ? c0 : c1) : c0, s * 0.24, 1.31, bodyRadiusAt(1.31) + 0.06, 0, s * 0.3, 0, 1, 0.85, 1, 0.1);
          (lens.material as THREE.MeshPhysicalMaterial).transparent = true;
          (lens.material as THREE.MeshPhysicalMaterial).opacity = a.kind === 'glasses3d' ? 0.65 : 0.92;
        }
        add(new THREE.BoxGeometry(0.62, 0.035, 0.02), a.kind === 'glasses3d' ? '#ffffff' : c1, 0, 1.39, bodyRadiusAt(1.39) + 0.06);
        break;
      case 'lei':
        for (let i = 0; i < 18; i++) {
          const ang = (i / 18) * Math.PI * 2;
          add(new THREE.SphereGeometry(0.065, 12, 8), i % 2 ? c0 : c1, Math.cos(ang) * 0.69, 0.78 + Math.sin(ang * 2) * 0.01, Math.sin(ang) * 0.69);
        }
        break;
      case 'scarf':
        for (let i = 0; i < a.colors.length; i++) add(new THREE.TorusGeometry(0.7, 0.045, 10, 48), a.colors[i], 0, 0.98 - i * 0.05, 0, Math.PI / 2);
        break;
      case 'pumpkin':
        add(new THREE.SphereGeometry(0.46, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), c0, 0, 1.52, 0, 0, 0, 0, 1, 0.85, 1);
        add(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8), c1, 0, 1.92, 0);
        break;
      case 'acorn':
        add(new THREE.SphereGeometry(0.34, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), c0, 0, 1.64, 0, 0, 0, 0, 1, 0.7, 1, 0.95);
        add(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 8), c1, 0, 1.92, 0);
        break;
      case 'mug':
        add(new THREE.CylinderGeometry(0.2, 0.18, 0.26, 28), c0, 0.05, 1.86, 0, 0, 0, -0.15, 1, 1, 1, 0.2);
        add(new THREE.CylinderGeometry(0.18, 0.18, 0.01, 28), c1, 0.07, 1.99, 0, 0, 0, -0.15);
        add(new THREE.TorusGeometry(0.07, 0.02, 8, 16, Math.PI), c0, 0.28, 1.86, 0, 0, 0, -Math.PI / 2 - 0.15);
        break;
      case 'chef':
        add(new THREE.CylinderGeometry(0.3, 0.27, 0.32, 32), c0, 0, 1.86, 0, 0, 0, 0, 1, 1, 1, 0.9);
        for (let i = 0; i < 6; i++) { const ang = (i / 6) * Math.PI * 2; add(new THREE.SphereGeometry(0.17, 16, 12), c0, Math.cos(ang) * 0.17, 2.06, Math.sin(ang) * 0.17, 0, 0, 0, 1, 0.8, 1, 0.9); }
        add(new THREE.SphereGeometry(0.2, 16, 12), c0, 0, 2.1, 0, 0, 0, 0, 1, 0.8, 1, 0.9);
        break;
      case 'beret':
        add(new THREE.SphereGeometry(0.42, 32, 16), c0, 0.06, 1.74, 0, 0, 0, -0.18, 1, 0.32, 1, 0.95);
        add(new THREE.CylinderGeometry(0.015, 0.02, 0.07, 8), c0, 0.06, 1.88, 0);
        break;
      case 'wreath':
        add(new THREE.TorusGeometry(0.47, 0.018, 6, 48), '#7a5a32', 0, 1.58, 0, Math.PI / 2);
        for (let i = 0; i < 22; i++) {
          const ang = (i / 22) * Math.PI * 2;
          add(new THREE.SphereGeometry(0.1, 12, 8), c0, Math.cos(ang) * 0.48, 1.6 + (i % 2) * 0.03, Math.sin(ang) * 0.48, 0, -ang, i % 2 ? 0.6 : -0.6, 1.7, 0.3, 0.75, 0.6);
        }
        for (const ang of [0.9, 1.4, 1.9]) add(new THREE.SphereGeometry(0.05, 10, 8), c1 ?? '#3b2a4a', Math.cos(ang) * 0.5, 1.6, Math.sin(ang) * 0.5, 0, 0, 0, 1, 1.25, 1, 0.3);
        break;
      case 'cone_hat':
        add(new THREE.ConeGeometry(0.72, 0.36, 40, 1, true), c0, 0, 1.86, 0, 0, 0, 0, 1, 1, 1, 0.85);
        add(new THREE.TorusGeometry(0.715, 0.012, 6, 48), c1 ?? '#a0703c', 0, 1.69, 0, Math.PI / 2);
        break;
      case 'beanie':
        add(new THREE.SphereGeometry(0.46, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), c0, 0, 1.56, 0, 0, 0, 0, 1, 0.75, 1, 0.95);
        a.colors.slice(1).forEach((col, i) => add(new THREE.TorusGeometry(0.455 - i * 0.04, 0.025, 8, 40), col, 0, 1.6 + i * 0.07, 0, Math.PI / 2));
        for (const s2 of [-1, 1]) add(new THREE.CapsuleGeometry(0.06, 0.18, 4, 10), c0, s2 * 0.47, 1.45, 0.02, 0, 0, s2 * 0.2);
        add(new THREE.SphereGeometry(0.08, 12, 10), a.colors[2] ?? c0, 0, 1.92, 0);
        break;
      case 'ushanka':
        // fur dome, thick turned-up front, ear flaps
        add(new THREE.SphereGeometry(0.47, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), c0, 0, 1.56, 0, 0, 0, 0, 1, 0.8, 1, 1);
        add(new THREE.TorusGeometry(0.47, 0.09, 12, 48), c1, 0, 1.58, 0, Math.PI / 2, 0, 0, 1, 1, 1, 1);
        add(new THREE.BoxGeometry(0.5, 0.2, 0.1), c1, 0, 1.7, 0.43, -0.35, 0, 0, 1, 1, 1, 1);
        for (const s2 of [-1, 1]) add(new THREE.CapsuleGeometry(0.1, 0.24, 6, 12), c1, s2 * 0.58, 1.42, 0.04, 0, 0, s2 * 0.18, 1, 1, 0.8, 1);
        break;
      case 'salakot':
        // wide domed hat with a little finial
        add(new THREE.SphereGeometry(0.66, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), c0, 0, 1.7, 0, 0, 0, 0, 1, 0.42, 1, 0.9);
        add(new THREE.TorusGeometry(0.655, 0.02, 6, 48), c1, 0, 1.7, 0, Math.PI / 2);
        add(new THREE.ConeGeometry(0.06, 0.12, 12), c1, 0, 2.03, 0);
        break;
      case 'vinok':
        // flower crown: a ring of flowers in the palette colours + two ribbons at the back
        add(new THREE.TorusGeometry(0.47, 0.03, 6, 48), '#3a7d2c', 0, 1.58, 0, Math.PI / 2);
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * Math.PI * 2;
          add(new THREE.SphereGeometry(0.1, 14, 10), a.colors[i % a.colors.length], Math.cos(ang) * 0.48, 1.62, Math.sin(ang) * 0.48, 0, 0, 0, 1, 0.75, 1, 0.7);
        }
        for (const s2 of [-1, 1]) add(new THREE.BoxGeometry(0.06, 0.55, 0.012), s2 < 0 ? '#0057b7' : '#ffd700', s2 * 0.08, 1.3, -0.5, 0.25, 0, s2 * 0.12);
        break;
      case 'backpack':
        add(new THREE.BoxGeometry(0.6, 0.6, 0.25), c0, 0, 0.75, -0.72, 0, 0, 0, 1, 1, 1, 0.8);
        add(new THREE.BoxGeometry(0.4, 0.2, 0.08), c1, 0, 0.62, -0.87);
        break;
      default:
        break;
    }
  }

  /** Trigger a little hop (on spawn / happy). */
  doHop(power = 1): void { this.hopV = 3.2 * power; }

  update(dt: number, camera: THREE.Camera): void {
    this.time += dt;
    const k = (rate: number) => 1 - Math.exp(-rate * dt);
    const e = this.expr, tg = this.target;
    for (const key of Object.keys(e) as (keyof Expr)[]) e[key] += (tg[key] - e[key]) * k(key === 'armL' || key === 'armR' ? 10 : 12);

    // blink
    if (this.time > this.blinkAt && this.blinkT < 0) this.blinkT = 0;
    let blink = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      blink = Math.sin(Math.min(1, this.blinkT / 0.16) * Math.PI);
      if (this.blinkT > 0.16) { this.blinkT = -1; this.blinkAt = this.time + 2.5 + Math.random() * 3; }
    }

    // hop physics
    this.hopV -= 14 * dt;
    this.hop = Math.max(0, this.hop + this.hopV * dt);
    if (this.hop === 0 && this.hopV < 0) this.hopV = 0;

    const motion = this.reducedMotion ? 0.3 : 1;
    const breathe = 1 + Math.sin(this.time * 2.2) * 0.012 * motion;
    const shake = e.shake * motion;
    this.body.position.set((Math.random() - 0.5) * shake * 0.05, this.hop * 0.25, 0);
    this.body.scale.set(1 / Math.sqrt(e.squash) * (2 - breathe), e.squash * breathe, 1 / Math.sqrt(e.squash) * (2 - breathe));
    this.body.rotation.set(e.lean * 0.35, e.turn, (Math.random() - 0.5) * shake * 0.04);

    // lids
    const lid = Math.min(1, e.lids + blink);
    for (let i = 0; i < 2; i++) {
      this.lidsTop[i].rotation.x = -1.45 + lid * 1.45;
      this.lidsBottom[i].rotation.x = 1.45 - e.squint * 0.9;
      this.pupils[i].position.x = (i === 0 ? 1 : -1) * e.cross * 0.04;
      const br = this.brows[i];
      const side = br.userData.side as number;
      // disgust (-1): inner ends down; worried (+1): inner ends up
      br.rotation.set(0, 0, Math.PI / 2 - side * e.brow * 0.45);
      br.position.y = (br.userData.y as number) + e.brow * 0.02 - lid * 0.03;
      this.lidMats[i].color.copy(this.bodyMat.color);
    }
    // mouth
    const open = Math.max(0, Math.min(1, e.mouthOpen));
    this.mouthInner.scale.set(1 + e.puff * 0.1, 0.05 + open * 0.75, 0.35);
    this.mouthInner.visible = open > 0.04;
    this.teeth.visible = open > 0.15;
    this.teeth.position.set(0, 0.04 + open * 0.1, 0.06);
    this.tongue.visible = open > 0.1 || e.tongue > 0.05;
    this.tongue.position.set(0, -0.03 - open * 0.06 - e.tongue * 0.08, 0.02 + e.tongue * 0.12);
    this.tongue.scale.set(1, 0.4 + e.tongue * 0.3, 0.8 + e.tongue * 0.6);
    this.smileLine.visible = open < 0.12;
    this.smileLine.rotation.z = e.smile >= 0 ? Math.PI : 0;
    this.smileLine.scale.set(1 + e.puff * 0.2, Math.max(0.15, Math.abs(e.smile)), 1);
    this.smileLine.position.set(0, e.smile >= 0 ? 0.03 : -0.06, 0.035);
    for (const c of this.cheeks) c.scale.setScalar(1 + e.puff * 0.7);

    // tint (green when disgusted)
    this.bodyMat.color.set(PIKKO_ORANGE).lerp(new THREE.Color('#a5c25a'), e.tint * 0.38);

    // arms
    this.arms[0].rotation.z = -e.armL;
    this.arms[1].rotation.z = -e.armR;

    // sprout spring: target droop + sway + reaction to body motion
    const swayTarget = e.droop * 1.1 + Math.sin(this.time * 1.7) * 0.05 * motion;
    this.sproutV += ((swayTarget - this.sproutA) * 60 - this.sproutV * 6) * dt;
    this.sproutV += -this.hopV * dt * 0.8;
    this.sproutA += this.sproutV * dt;
    this.sprout.rotation.z = -this.sproutA * 0.6;
    this.sproutTip.rotation.z = -this.sproutA * 0.9;
    this.leafMat.color.set('#5bbf3a').lerp(new THREE.Color('#b0a24a'), Math.max(0, Math.min(1, e.droop)));
    this.flower.scale.setScalar(Math.max(0.001, e.bloom));

    // belly liquid: level + wobble (damped spring), clipping plane in world space
    this.level += (this.levelTarget - this.level) * k(3);
    this.wobbleV += (-this.wobble * 40 - this.wobbleV * 3) * dt;
    this.wobble += this.wobbleV * dt;
    this.liquidColor.lerp(this.liquidTarget, k(2));
    this.liquidMat.color.copy(this.liquidColor);
    const world = new THREE.Vector3(0, Pikko.BELLY_Y - Pikko.BELLY_R + this.level * Pikko.BELLY_R * 2, 0);
    this.body.localToWorld(world);
    const n = new THREE.Vector3(Math.sin(this.wobble) * 0.6, -1, 0).normalize();
    this.liquidPlane.setFromNormalAndCoplanarPoint(n, world);
    void camera;
  }

  splash(power = 1): void { this.wobbleV += 2.5 * power; }

  reset(): void {
    this.expr = { ...NEUTRAL };
    this.target = { ...NEUTRAL };
    this.levelTarget = 0;
    this.level = 0;
    this.liquidTarget.set('#b9d86a');
    this.liquidColor.set('#b9d86a');
    this.root.position.set(0, 0, 0);
    this.cleanBib();
  }

  setTarget(p: Partial<Expr>): void { Object.assign(this.target, p); }
  neutral(): void { this.target = { ...NEUTRAL }; }
}
