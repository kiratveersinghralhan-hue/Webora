import * as THREE from "three/src/Three.js";
import {
  createIdentityGeometry,
  assembleIdentity,
} from "../geometry/identityGeometry";
import { StudioAlloy } from "../materials/studioAlloy";
import {
  createStudioDais,
  createStudioFold,
} from "../geometry/studioArchitecture";
import { qualitySettings, type QualityTier } from "../runtime/QualityPolicy";
import type { IntroDirector } from "../runtime/IntroDirector";
import type { FrameState, SceneContext, SceneModule } from "../runtime/types";

/** One persistent W, one camera, and the V2.1A interaction controller. No renderer or clock ownership. */
export class CoreScene implements SceneModule {
  readonly group = new THREE.Group();
  yaw = 0;
  private pitch = 0;
  private velocity = 0;
  private dragging = false;
  private turnTarget: number | undefined;
  private context!: SceneContext;
  private releases: (() => void)[] = [];
  private serial = 0;
  private director?: IntroDirector;
  private legacyIntro = false;
  private legacyStart?: number;
  private sculpture!: THREE.Mesh<THREE.BufferGeometry>;
  private rear!: THREE.Mesh<THREE.BufferGeometry>;
  private alloy!: StudioAlloy;
  private rim!: THREE.MeshStandardMaterial;
  private width = 1;
  private height = 1;
  private distance = 10;
  private lastAssembly = -1;
  private progress = 1;
  private suspended = false;
  private filteredVelocity = 0;
  private alloyFailed = false;
  private architecture = new THREE.Group();
  constructor(private studio = false) {}
  mount(context: SceneContext) {
    this.context = context;
    context.root.add(this.group);
    if (this.studio) context.root.add(this.architecture);
    this.build(context.tier);
  }
  async prepare(signal: AbortSignal) {
    if (signal.aborted) throw new Error("Scene preparation canceled");
  }
  private own<T extends { dispose(): void }>(resource: T): T {
    try {
      const lease = this.context.assets.acquire(
        `core/${++this.serial}`,
        () => resource,
      );
      this.releases.push(lease.release);
      return lease.value;
    } catch (error) {
      resource.dispose();
      throw error;
    }
  }
  private clear() {
    this.group.clear();
    this.architecture.clear();
    const errors: unknown[] = [];
    for (const release of this.releases.splice(0).reverse()) {
      try {
        release();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) throw errors[0];
  }
  private build(tier: QualityTier) {
    this.clear();
    this.alloy = new StudioAlloy(tier);
    if (this.alloyFailed) this.alloy.fallback();
    const front = this.own(this.alloy.material);
    const side = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x485367,
        metalness: 0.9,
        roughness: 0.3,
        envMapIntensity: 1.8,
      }),
    );
    this.rim = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x566c8a,
        metalness: 0.92,
        roughness: 0.22,
        envMapIntensity: 1.7,
      }),
    );
    this.sculpture = new THREE.Mesh(
      this.own(createIdentityGeometry(qualitySettings[tier].bevel)),
      [front, side],
    );
    this.sculpture.name = "Webora / continuous forged W";
    this.rear = new THREE.Mesh(
      this.own(createIdentityGeometry(qualitySettings[tier].bevel, true)),
      this.rim,
    );
    this.rear.name = "Webora / recessed rear panels";
    this.group.add(this.sculpture, this.rear);
    this.rear.scale.set(0.95, 0.95, 1);
    if (this.studio) this.buildArchitecture(tier);
    this.lastAssembly = -1;
    this.resize(this.width, this.height);
  }
  private buildArchitecture(tier: QualityTier) {
    const wall = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x546278,
        metalness: 0.96,
        roughness: 0.24,
        envMapIntensity: 1.6,
      }),
    );
    const graphite = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x131b31,
        metalness: 0.82,
        roughness: 0.32,
        envMapIntensity: 1.4,
      }),
    );
    const fold = this.own(createStudioFold(qualitySettings[tier].bevel));
    const frontPortal = new THREE.Mesh(fold, wall);
    frontPortal.position.set(0.05, 0, -1.5);
    frontPortal.rotation.y = -0.16;
    const rearPortal = new THREE.Mesh(fold, graphite);
    rearPortal.position.set(0.2, 0.05, -3);
    rearPortal.rotation.y = -0.16;
    rearPortal.scale.setScalar(0.93);
    const dais = new THREE.Mesh(this.own(createStudioDais()), graphite);
    dais.position.set(0, -2.3, 0);
    dais.rotation.y = -0.18;
    this.architecture.add(frontPortal, rearPortal, dais);
    this.architecture.name = "Webora / folded studio architecture";
  }
  setDirector(director: IntroDirector) {
    this.director = director;
  }
  setIntro(opening: boolean) {
    if (this.director || opening === this.legacyIntro) return;
    this.legacyIntro = opening;
    this.legacyStart = undefined;
    this.context?.invalidate();
  }
  startDrag() {
    this.director?.finish("drag");
    this.dragging = true;
    this.velocity = this.filteredVelocity = 0;
    this.turnTarget = undefined;
  }
  drag(dx: number, dy: number, milliseconds: number) {
    const sensitivity = (Math.PI * 2) / Math.max(300, this.width * 0.85);
    this.yaw += dx * sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.003, -0.44, 0.44);
    const sample = THREE.MathUtils.clamp(
      (dx * sensitivity) / (milliseconds / 1000),
      -12,
      12,
    );
    this.filteredVelocity +=
      (sample - this.filteredVelocity) * (1 - Math.exp(-milliseconds / 45));
    this.velocity = this.filteredVelocity;
    this.context.invalidate();
  }
  endDrag(cancelled: boolean) {
    this.dragging = false;
    if (cancelled) this.velocity = this.filteredVelocity = 0;
    this.context.invalidate();
  }
  turn(amount: number) {
    this.director?.finish("control");
    this.velocity = 0;
    this.dragging = false;
    this.turnTarget = amount === 0 ? 0 : this.yaw + amount;
    if (amount === 0) this.pitch = 0;
    this.context.invalidate();
  }
  update(frame: FrameState) {
    if (this.suspended) return false;
    const { time, delta, pointer } = frame,
      now = frame.now ?? time * 1000;
    if (this.legacyIntro && this.legacyStart === undefined)
      this.legacyStart = time;
    const progress = this.director
      ? this.director.sample(now)
      : this.legacyIntro
        ? THREE.MathUtils.clamp((time - (this.legacyStart ?? time)) / 2.2, 0, 1)
        : 1;
    this.progress = progress;
    if (this.turnTarget !== undefined) {
      this.yaw += (this.turnTarget - this.yaw) * (1 - Math.exp(-delta / 0.15));
      if (Math.abs(this.turnTarget - this.yaw) < 0.0001) {
        this.yaw = this.turnTarget;
        this.turnTarget = undefined;
      }
    } else if (!this.dragging && this.velocity !== 0) {
      const decay = Math.exp(-delta / 0.22);
      this.yaw += this.velocity * 0.22 * (1 - decay);
      this.velocity *= decay;
      if (Math.abs(this.velocity) < 0.01) this.velocity = 0;
    }
    const arc = 1 - THREE.MathUtils.smoothstep(progress, 0.45, 1);
    this.group.rotation.set(
      -0.12 - pointer.ny * 0.09 + this.pitch,
      -0.35 + pointer.nx * 0.18 + this.yaw,
      -0.08 + pointer.nx * 0.025,
    );
    this.group.position.set(0, 0, 0);
    this.group.scale.setScalar(this.width < 500 ? 0.9 : 1.08);
    const angle = arc * (this.width < 500 ? 0.32 : 0.52),
      radius = this.distance + arc * 2.4;
    this.context.camera.position.set(
      -Math.sin(angle) * radius,
      arc * 0.85,
      Math.cos(angle) * radius,
    );
    this.context.camera.lookAt(0, 0, 0);
    // The setting stays grounded while the visitor turns the identity. It uses
    // the same camera, lighting, draw gate and leases, with no independent loop.
    if (this.studio) {
      this.architecture.rotation.y = pointer.nx * 0.035 - arc * 0.2;
      this.architecture.position.y = -0.1 - arc * 0.5;
      this.architecture.position.z = -arc * 1.8;
    }
    if (progress !== this.lastAssembly) {
      assembleIdentity(this.sculpture.geometry, progress);
      assembleIdentity(this.rear.geometry, progress);
      this.lastAssembly = progress;
    }
    const sweep = Math.sin(
      THREE.MathUtils.smoothstep(progress, 0.42, 0.94) * Math.PI,
    );
    const reveal =
      0.35 + 0.65 * THREE.MathUtils.smoothstep(progress, 0.02, 0.48);
    this.alloy.material.color.setHex(0x8b95ab).multiplyScalar(reveal);
    this.rim.emissive.setHex(0x385cb0);
    this.rim.emissiveIntensity = sweep * 0.13;
    const interacting =
      this.dragging || this.velocity !== 0 || this.turnTarget !== undefined;
    const flowing = this.alloy.update(
      now,
      delta,
      pointer.nx,
      pointer.ny,
      interacting || (progress > 0 && progress < 1),
    );
    return flowing || interacting || (progress > 0 && progress < 1);
  }
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (!this.context) return;
    const camera = this.context.camera;
    const scale = width < 500 ? 0.9 : 1.08;
    const limitingHalfFov = Math.atan(
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
        Math.min(1, width / height),
    );
    this.distance = Math.max(
      8.7,
      ((this.studio ? 3.45 : 2.7) * scale) / Math.sin(limitingHalfFov) + 0.75,
    );
    camera.position.set(0, 0, this.distance);
    camera.lookAt(0, 0, 0);
  }
  recoverMaterials() {
    const recovered = this.alloy.fallback();
    this.alloyFailed ||= recovered;
    return recovered;
  }
  inspect() {
    return {
      yaw: this.yaw,
      pitch: this.pitch,
      progress: this.progress,
      sculptureId: this.sculpture.uuid,
      geometryId: this.sculpture.geometry.uuid,
      material: this.alloy.material.name,
      materials: this.studio ? 5 : 3,
      studio: this.studio ? 1 : 0,
      introPhase: this.director?.phase ?? "settled",
      introDuration: this.director?.duration ?? 0,
      introStartedAt: this.director?.startedAt ?? 0,
    };
  }
  quality(tier: QualityTier) {
    this.build(tier);
  }
  suspend() {
    this.suspended = true;
    this.dragging = false;
    this.velocity = 0;
    this.director?.finish("suspended");
  }
  resume() {
    this.suspended = false;
  }
  dispose() {
    this.suspend();
    try {
      this.clear();
    } finally {
      this.group.removeFromParent();
      this.architecture.removeFromParent();
    }
  }
}
