// Kitchen table scene (GDD §10): oiled oak table, open fridge glowing behind Pikko, ceramic plates,
// PBR lighting from a room environment, one shadow-casting key light + blob contact shadows.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { blobShadowTexture, linenTexture, woodTextures } from './textures';

export type Quality = 'high' | 'medium' | 'low';

export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  readonly plates: THREE.Group[] = [];
  readonly plateAnchors: THREE.Vector3[] = [new THREE.Vector3(), new THREE.Vector3()];
  readonly waterAnchor = new THREE.Vector3(0, 0, 2.15);
  private readonly key: THREE.DirectionalLight;
  private readonly fridgeLight: THREE.PointLight;
  private readonly blobTex = blobShadowTexture();
  portrait = false;
  view: 'title' | 'game' = 'title';
  quality: Quality = 'high';
  private camBase = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private shakeT = 0;

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.localClippingEnabled = true;
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = 'game-canvas';

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;
    pmrem.dispose();
    this.scene.background = new THREE.Color('#f3e7d6');
    this.scene.fog = new THREE.Fog('#f3e7d6', 9, 22);

    // lights: soft window key, warm fridge rim, gentle fill
    this.key = new THREE.DirectionalLight('#fff4e6', 2.2);
    this.key.position.set(3.5, 6.5, 4.5);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.camera.left = -4;
    this.key.shadow.camera.right = 4;
    this.key.shadow.camera.top = 4;
    this.key.shadow.camera.bottom = -3;
    this.key.shadow.camera.near = 1;
    this.key.shadow.camera.far = 20;
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.02;
    this.key.shadow.radius = 4;
    this.scene.add(this.key);
    this.scene.add(new THREE.HemisphereLight('#fff6ea', '#7a5a3a', 0.45));
    this.fridgeLight = new THREE.PointLight('#ffe2b0', 6, 7, 1.6);
    this.fridgeLight.position.set(0, 2.6, -1.8);
    this.scene.add(this.fridgeLight);

    this.buildTable();
    this.buildFridge();
    this.buildPlates();
    this.resize();
    new ResizeObserver(() => this.resize()).observe(host);
  }

  private buildTable(): void {
    const { map, bump } = woodTextures();
    map.repeat.set(2, 1.4);
    bump.repeat.copy(map.repeat);
    const table = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 7), new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 1.2, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.45 }));
    table.position.set(0, -0.15, 0.6);
    table.receiveShadow = true;
    this.scene.add(table);
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.6), new THREE.MeshStandardMaterial({ map: linenTexture(), roughness: 0.95 }));
    mat.rotation.x = -Math.PI / 2;
    mat.position.set(0, 0.002, 1.65);
    mat.receiveShadow = true;
    this.scene.add(mat);
    // back wall + counter
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), new THREE.MeshStandardMaterial({ color: '#efe2cf', roughness: 0.95 }));
    wall.position.set(0, 4, -4.2);
    this.scene.add(wall);
    // wall tiles band
    const tiles = new THREE.Mesh(new THREE.PlaneGeometry(30, 1.6), new THREE.MeshStandardMaterial({ color: '#d9e6e2', roughness: 0.4 }));
    tiles.position.set(0, 0.8, -4.19);
    this.scene.add(tiles);
  }

  private buildFridge(): void {
    const g = new THREE.Group();
    g.position.set(-0.2, 0, -2.6);
    const white = new THREE.MeshPhysicalMaterial({ color: '#f4f1ea', roughness: 0.35, clearcoat: 0.6 });
    const inner = new THREE.MeshStandardMaterial({ color: '#fdf6e8', roughness: 0.6, emissive: new THREE.Color('#ffe8c2'), emissiveIntensity: 0.35 });
    const W = 2.6, H = 4.2, D = 1.1;
    const shell = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
      const mm = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mm.position.set(x, y, z);
      g.add(mm);
      return mm;
    };
    shell(W, 0.12, D, 0, H, 0, white); // top
    shell(0.12, H, D, -W / 2, H / 2, 0, white); // sides
    shell(0.12, H, D, W / 2, H / 2, 0, white);
    shell(W, H, 0.1, 0, H / 2, -D / 2, inner); // back panel glowing
    for (const y of [1.2, 2.2, 3.2]) {
      const shelf = shell(W - 0.24, 0.04, D - 0.15, 0, y, 0, new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.35 }));
      shelf.castShadow = false;
    }
    // a few blurred jars & bottles on the shelves
    const cols = ['#e63946', '#ffb703', '#80b918', '#f1faee', '#ff8c1a', '#3a86ff'];
    let i = 0;
    for (const y of [1.22, 2.22, 3.22]) {
      for (let x = -0.9; x <= 0.9; x += 0.45) {
        const c = cols[i++ % cols.length];
        const h = 0.25 + ((i * 37) % 10) / 30;
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, h, 16), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }));
        jar.position.set(x, y + h / 2, -0.15);
        g.add(jar);
      }
    }
    // open door on the right
    const door = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.12), white);
    // hinged on the right edge, swung open towards the viewer
    door.geometry.translate(W / 2, 0, 0);
    door.position.set(W / 2, H / 2, D / 2);
    door.rotation.y = -1.25;
    g.add(door);
    this.scene.add(g);
  }

  private buildPlates(): void {
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0.55, 0.02), new THREE.Vector2(0.62, 0.04),
      new THREE.Vector2(0.78, 0.08), new THREE.Vector2(0.8, 0.09), new THREE.Vector2(0.76, 0.095), new THREE.Vector2(0.6, 0.06), new THREE.Vector2(0, 0.055)];
    const geo = new THREE.LatheGeometry(pts, 64);
    const mat = new THREE.MeshPhysicalMaterial({ color: '#fbf9f4', roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 });
    for (let i = 0; i < 2; i++) {
      const p = new THREE.Group();
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      p.add(m);
      const blob = this.blobMesh(1.9);
      blob.position.y = 0.003;
      p.add(blob);
      this.plates.push(p);
      this.scene.add(p);
    }
  }

  private blobMesh(size: number): THREE.Mesh {
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: this.blobTex, transparent: true, depthWrite: false, opacity: 0.6 }));
    blob.rotation.x = -Math.PI / 2;
    blob.renderOrder = 1;
    return blob;
  }

  addBlob(pos: THREE.Vector3, size: number): THREE.Mesh {
    const b = this.blobMesh(size);
    b.position.copy(pos);
    this.scene.add(b);
    return b;
  }

  /** Layout for landscape / portrait (GDD §12). */
  resize(): void {
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    const dprCap = this.quality === 'high' ? 2 : this.quality === 'medium' ? 1.5 : 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.portrait = w / h < 0.9;
    if (this.portrait) {
      this.camera.fov = 52;
      this.camBase.set(0, 3.4, 7.4);
      this.camLook.set(0, 0.95, 0.9);
      this.plateAnchors[0].set(-0.88, 0, 2.05);
      this.plateAnchors[1].set(0.88, 0, 2.05);
      this.waterAnchor.set(0, 0, 3.0);
    } else {
      const wide = w / h > 1.9;
      this.camera.fov = wide ? 46 : 40;
      this.camBase.set(0, 3.2, 6.3);
      this.camLook.set(0, 0.75, 0.95);
      this.plateAnchors[0].set(-1.55, 0, 1.55);
      this.plateAnchors[1].set(1.55, 0, 1.55);
      this.waterAnchor.set(0, 0, 2.25);
    }
    if (this.view === 'title') {
      // Pikko framed above the menu (portrait) or left of it (landscape)
      if (this.portrait) { this.camBase.set(0, 1.9, 7.6); this.camLook.set(0, 0.2, 0); }
      else { this.camBase.set(1.1, 1.6, 4.6); this.camLook.set(0.9, 1.0, 0); }
    }
    this.camera.updateProjectionMatrix();
    this.plates.forEach((p, i) => { p.position.copy(this.plateAnchors[i]); p.visible = this.view === 'game'; });
  }

  setView(v: 'title' | 'game'): void {
    this.view = v;
    this.resize();
  }

  setQuality(q: Quality): void {
    this.quality = q;
    this.renderer.shadowMap.enabled = q !== 'low';
    this.key.castShadow = q !== 'low';
    const size = q === 'high' ? 2048 : 1024;
    if (this.key.shadow.mapSize.x !== size) {
      this.key.shadow.mapSize.set(size, size);
      this.key.shadow.map?.dispose();
      this.key.shadow.map = null as unknown as THREE.WebGLRenderTarget;
    }
    this.scene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m) m.needsUpdate = true; });
    this.resize();
  }

  shake(amount = 1): void { this.shakeT = Math.max(this.shakeT, 0.35 * amount); }

  render(dt: number, reducedMotion: boolean): void {
    this.shakeT = Math.max(0, this.shakeT - dt);
    const s = reducedMotion ? 0 : this.shakeT * 0.06;
    this.camera.position.set(this.camBase.x + (Math.random() - 0.5) * s, this.camBase.y + (Math.random() - 0.5) * s, this.camBase.z);
    this.camera.lookAt(this.camLook);
    this.renderer.render(this.scene, this.camera);
  }
}
