import * as THREE from "three/src/Three.js";
import { assetUrl } from "../../lib/site";
import { projects } from "../../data/studio";
import {
  slab,
  foldedBracket,
  processBillet,
} from "../geometry/installationGeometry";
import type { FrameState, SceneContext, SceneModule } from "../runtime/types";

type Kind = "services" | "process";
type Pose = [number, number, number, number, number, number];
const servicePoses: Pose[][] = [
  [
    [-0.65, 0.4, 0, 0, -0.16, 0],
    [2, -0.25, 1.1, 0, -0.32, -0.08],
    [-2, -1.45, 0.8, -0.08, 0.15, 0],
  ],
  [
    [0, 0.55, 0.4, 0, 0, 0],
    [2.1, -0.85, -1, 0, -0.5, 0.08],
    [-2, -0.95, -0.8, -0.12, 0.3, -0.1],
  ],
  [
    [-0.9, 0.35, -0.3, 0, -0.2, 0],
    [1.8, 0.1, 1.2, 0, -0.25, 0.04],
    [-0.45, -1.2, 1.6, -0.08, 0.1, 0],
  ],
  [
    [0.35, 0.8, -0.2, 0, 0.18, 0.04],
    [-2, 0.1, 1, 0, 0.3, -0.06],
    [1.65, -1.25, 1.2, -0.12, -0.2, 0],
  ],
  [
    [-0.75, 0.3, 0.2, 0, -0.35, -0.04],
    [2, -0.55, 0.5, 0, -0.15, 0.08],
    [-1.8, -1.3, -0.2, -0.06, 0.25, -0.1],
  ],
  [
    [-0.35, 0.7, -0.5, -0.1, -0.3, -0.08],
    [2, 0.2, 1, 0, -0.45, 0.1],
    [-1.8, -1.2, 1.5, -0.15, 0.2, 0.1],
  ],
];

/** Renderer-independent installation. Shared leases, no ticker, observer or business state. */
export class InstallationScene implements SceneModule {
  readonly group = new THREE.Group();
  private context!: SceneContext;
  private releases: (() => void)[] = [];
  private serial = 0;
  private alive = false;
  private active = 0;
  private parts: THREE.Group[] = [];
  private trims: THREE.MeshStandardMaterial[] = [];
  private faces: THREE.MeshStandardMaterial[] = [];
  private angle = -0.3;
  private angleTarget = -0.3;
  private width = 1;
  private height = 1;
  private cameraX = 0;
  private textureCount = 0;
  private textureFailures = 0;
  constructor(readonly kind: Kind) {}
  private own<T extends { dispose(): void }>(value: T): T {
    const lease = this.context.assets.acquire(
      `${this.kind}/${++this.serial}`,
      () => value,
    );
    this.releases.push(lease.release);
    return lease.value;
  }
  private material(color: number, metalness = 0.8, roughness = 0.3) {
    return this.own(
      new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness,
        envMapIntensity: 1.35,
      }),
    );
  }
  private mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D,
    position: number[] = [0, 0, 0],
  ) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    parent.add(mesh);
    return mesh;
  }
  mount(context: SceneContext) {
    this.context = context;
    this.alive = true;
    context.root.add(this.group);
    this.group.name = `Webora / ${this.kind === "services" ? "responsive construction" : "six forged stages"}`;
    if (this.kind === "services") this.buildServices();
    else this.buildProcess();
  }
  private screenshot(index: number, portrait = false) {
    const project = projects.find(
      (p) => p.name === (index ? "Gloss Boss" : "Harvester Parts"),
    )!;
    const texture = this.own(
      new THREE.TextureLoader().load(
        assetUrl(project.image!),
        () => {
          if (!this.alive) return;
          this.textureCount++;
          this.context.invalidate();
        },
        undefined,
        () => {
          if (this.alive) {
            this.textureFailures++;
            this.context.invalidate();
          }
        },
      ),
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    if (portrait) {
      texture.repeat.set(0.3, 1);
      texture.offset.set(0.35, 0);
    }
    // A portrait device uses a truthful crop of the same existing capture.
    return this.own(
      new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
        color: 0xffffff,
      }),
    );
  }
  private buildServices() {
    const titanium = this.material(0xa4b0c5, 0.92, 0.26);
    const graphite = this.material(0x192338, 0.82, 0.3);
    const accent = this.material(0x344779, 0.85, 0.28);
    const dark = this.material(0x080d17, 0.2, 0.45);
    const image = this.screenshot(0),
      secondImage = this.screenshot(1);
    const body = this.own(slab(4.2, 2.75, 0.22, 0.12));
    const screen = this.own(new THREE.PlaneGeometry(3.94, 2.46));
    const desktop = new THREE.Group();
    this.group.add(desktop);
    this.parts.push(desktop);
    this.mesh(body, titanium, desktop);
    this.mesh(this.own(slab(4.03, 2.58, 0.06)), dark, desktop, [0, 0, 0.145]);
    this.mesh(screen, image, desktop, [0, 0, 0.225]);
    this.mesh(
      this.own(foldedBracket(0.62)),
      graphite,
      desktop,
      [0.1, -1.75, -0.65],
    );
    const foot = this.mesh(
      this.own(slab(2.15, 0.18, 1.1)),
      titanium,
      desktop,
      [0.05, -3.12, -0.2],
    );
    foot.rotation.x = 0.06;
    // Rear chassis: vents and a raised folded spine remain visible when inspected.
    const vent = this.own(slab(2.4, 0.035, 0.025, 0.008));
    for (let i = 0; i < 5; i++)
      this.mesh(vent, graphite, desktop, [0, -0.42 + i * 0.13, -0.14]);
    const spine = this.mesh(
      this.own(foldedBracket(0.24)),
      accent,
      desktop,
      [0, 0.05, -0.5],
    );
    spine.scale.y = 0.45;
    const phone = new THREE.Group();
    this.group.add(phone);
    this.parts.push(phone);
    this.mesh(this.own(slab(1.16, 2.35, 0.19, 0.18)), graphite, phone);
    this.mesh(
      this.own(slab(1.08, 2.25, 0.025, 0.15)),
      accent,
      phone,
      [0, 0, 0.11],
    );
    const mobileFace = this.screenshot(1, true);
    this.mesh(
      this.own(new THREE.PlaneGeometry(0.99, 2.08)),
      mobileFace,
      phone,
      [0, 0, 0.18],
    );
    this.mesh(
      this.own(slab(0.32, 0.065, 0.025, 0.03)),
      dark,
      phone,
      [0, 0.96, 0.2],
    );
    this.mesh(
      this.own(slab(0.32, 0.48, 0.06, 0.09)),
      titanium,
      phone,
      [-0.29, 0.78, -0.14],
    );
    const lens = this.own(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16));
    for (const y of [0.68, 0.88]) {
      const m = this.mesh(lens, dark, phone, [-0.29, y, -0.21]);
      m.rotation.x = Math.PI / 2;
    }
    const laptop = new THREE.Group();
    this.group.add(laptop);
    this.parts.push(laptop);
    this.mesh(this.own(slab(2.8, 1.82, 0.16)), graphite, laptop);
    this.mesh(
      this.own(new THREE.PlaneGeometry(2.6, 1.62)),
      secondImage,
      laptop,
      [0, 0, 0.14],
    );
    const deck = this.mesh(
      this.own(slab(2.85, 1.8, 0.11)),
      titanium,
      laptop,
      [0, -0.93, 1],
    );
    deck.rotation.x = -Math.PI / 2;
    const keyboard = this.mesh(
      this.own(slab(2.4, 0.85, 0.035)),
      dark,
      laptop,
      [0, -0.85, 1],
    );
    keyboard.rotation.x = -Math.PI / 2;
    const keyGeometry = this.own(slab(0.16, 0.12, 0.025, 0.015));
    const keys = new THREE.InstancedMesh(keyGeometry, graphite, 40);
    const keyTransform = new THREE.Object3D();
    for (let row = 0; row < 4; row++)
      for (let column = 0; column < 10; column++) {
        keyTransform.position.set(
          (column - 4.5) * 0.21,
          -0.78,
          0.72 + row * 0.17,
        );
        keyTransform.rotation.x = -Math.PI / 2;
        keyTransform.updateMatrix();
        keys.setMatrixAt(row * 10 + column, keyTransform.matrix);
      }
    laptop.add(keys);
    this.own(keys);
    const hinge = this.mesh(
      this.own(new THREE.CylinderGeometry(0.075, 0.075, 2.55, 16)),
      titanium,
      laptop,
      [0, -0.9, 0.1],
    );
    hinge.rotation.z = Math.PI / 2;
    this.mesh(
      this.own(slab(0.7, 0.025, 0.4)),
      graphite,
      laptop,
      [0, -0.86, 1.62],
    );
    // One machined exhibition foundation, with a recessed blue edge.
    this.mesh(
      this.own(slab(6.9, 0.16, 3.65)),
      graphite,
      this.group,
      [0, -2.9, 0.05],
    );
    this.mesh(
      this.own(slab(6.65, 0.035, 3.4)),
      accent,
      this.group,
      [0, -2.79, 0.05],
    );
    this.group.position.y = 0.45;
  }
  private buildProcess() {
    const graphite = this.material(0x1c2941, 0.85, 0.32);
    const silver = this.material(0x9cabc3, 0.92, 0.24);
    const black = this.material(0x080f1d, 0.65, 0.35);
    // Two continuous sloping rails give all six articulated pieces a shared foundation.
    const rail = this.own(slab(6.8, 0.2, 0.38));
    for (const z of [-0.65, 0.65]) {
      const r = this.mesh(rail, silver, this.group, [0, -1.62, z]);
      r.rotation.z = 0.08;
    }
    const plinth = this.mesh(
      this.own(slab(7.2, 0.25, 3.25, 0.18)),
      black,
      this.group,
      [0, -2.02, 0.15],
    );
    plinth.rotation.y = -0.035;
    const support = this.own(foldedBracket(0.45));
    for (const x of [-2.4, 2.4]) {
      const m = this.mesh(support, graphite, this.group, [x, -1.35, -0.28]);
      m.scale.y = 0.4;
    }
    for (let i = 0; i < 6; i++) {
      const part = new THREE.Group();
      this.parts.push(part);
      this.group.add(part);
      const trim = this.material(0x7188c4, 0.78, 0.24);
      this.trims.push(trim);
      const face = this.material(i % 2 ? 0x9cabc3 : 0x1c2941, 0.88, 0.28);
      this.faces.push(face);
      this.mesh(this.own(processBillet(i)), face, part);
      // A thick rear fin and recessed inner face expose assembly depth and seams.
      const back = this.mesh(
        this.own(processBillet(i)),
        black,
        part,
        [0, 0, -0.26],
      );
      back.scale.set(0.86, 0.94, 1);
      const fin = this.mesh(
        this.own(slab(0.12, 1.85, 0.9, 0.025)),
        trim,
        part,
        [-0.25, 0, -0.3],
      );
      fin.rotation.z = i % 2 ? -0.12 : 0.12;
      const seam = this.mesh(
        this.own(slab(0.52, 0.055, 0.56, 0.02)),
        trim,
        part,
        [0, -1.1, 0.04],
      );
      seam.rotation.z = 0.1;
      this.mesh(
        this.own(slab(0.29, 0.29, 0.035, 0.04)),
        trim,
        part,
        [0, 0.65, 0.34],
      );
      // Machined seam marks, not connected dots or an SVG line.
      const tick = this.own(slab(0.035, 0.12, 0.04, 0.005));
      for (let j = 0; j <= i; j++)
        this.mesh(tick, silver, part, [-0.13 + j * 0.052, 0.65, 0.37]);
    }
    this.group.rotation.x = -0.12;
  }
  select(index: number) {
    this.active = Math.max(0, Math.min(5, index));
    this.context.invalidate();
  }
  turn() {
    this.angleTarget += Math.PI / 3;
    this.context.invalidate();
  }
  async prepare(signal: AbortSignal) {
    if (signal.aborted) throw Error("Installation preparation canceled");
  }
  update(frame: FrameState) {
    let moving = false;
    const damping = 1 - Math.exp(-frame.delta * 8);
    const approach = (current: number, target: number) => {
      if (Math.abs(current - target) < 0.001) return target;
      moving = true;
      return current + (target - current) * damping;
    };
    this.angle = approach(this.angle, this.angleTarget);
    this.group.rotation.y = this.angle;
    for (const [i, part] of this.parts.entries()) {
      let target: Pose;
      if (this.kind === "services") target = servicePoses[this.active][i];
      else
        target = [
          (i - 2.5) * 0.96,
          Math.sin(i * 0.65) * 0.17 + (i === this.active ? 0.56 : 0),
          Math.cos(i * 0.67) * 0.38,
          i === this.active ? -0.18 : 0,
          i % 2 ? -0.36 : 0.36,
          i % 2 ? -0.28 : 0.28,
        ];
      for (let j = 0; j < 3; j++) {
        const key = (["x", "y", "z"] as const)[j];
        part.position[key] = approach(part.position[key], target[j]);
        part.rotation[key] = approach(part.rotation[key], target[j + 3]);
      }
      if (this.kind === "process") {
        this.trims[i].emissive.setHex(0x6b58da);
        this.trims[i].emissiveIntensity =
          i === this.active ? 0.85 : Math.abs(i - this.active) === 1 ? 0.12 : 0;
        this.faces[i].color.setHex(
          i === this.active ? 0x657ae0 : i % 2 ? 0x9cabc3 : 0x1c2941,
        );
      }
    }
    const targetX = this.kind === "process" ? (this.active - 2.5) * 0.12 : 0.25;
    this.cameraX = approach(this.cameraX, targetX);
    const aspect = this.width / this.height;
    const distance = Math.max(
      this.kind === "services" ? 13.2 : 10.5,
      (this.kind === "services" ? 4.7 : 4.3) /
        Math.tan(THREE.MathUtils.degToRad(17.5)) /
        aspect,
    );
    this.context.camera.position.set(this.cameraX, distance * 0.17, distance);
    this.context.camera.lookAt(0, -0.4, 0);
    return moving;
  }
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  quality() {
    /* Closed profiles keep a bounded shared topology at every tier. */
  }
  suspend() {
    /* No autonomous motion or clock to stop. */
  }
  resume() {
    this.context.invalidate();
  }
  inspect() {
    return {
      chapter: this.kind,
      selected: this.active,
      parts: this.parts.length,
      viewAngle: this.angle,
      loadedScreenshots: this.textureCount,
      textureFailures: this.textureFailures,
      geometryId: this.parts[0]?.children[0]?.uuid ?? "",
    };
  }
  dispose() {
    if (!this.alive) return;
    this.alive = false;
    this.group.removeFromParent();
    this.group.clear();
    this.parts = [];
    for (const release of this.releases.splice(0).reverse()) release();
  }
}
