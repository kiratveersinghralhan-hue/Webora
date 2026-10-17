import * as THREE from "three/src/Three.js";
import { createImpressionGeometry } from "../geometry/impressionGeometry";
import type { IntroDirector } from "../runtime/IntroDirector";
import { DiyaLights } from "./DiyaLights";
import type { QualityTier } from "../runtime/QualityPolicy";
import type { FrameState, SceneContext, SceneModule } from "../runtime/types";

/** Shared-world scene: one finite revolution, free yaw, no RAF or renderer. */
export class ImpressionScene implements SceneModule {
  readonly group = new THREE.Group();
  yaw = 0;
  private pitch = 0;
  private velocity = 0;
  private dragging = false;
  private target: number | undefined;
  private suspended = false;
  private context?: SceneContext;
  private director?: IntroDirector;
  private sculpture?: THREE.Mesh;
  private diyas?: DiyaLights;
  private kindled = false;
  private releases: (() => void)[] = [];
  private serial = 0;
  private width = 1;
  private height = 1;
  private distance = 10;
  private progress = 1;
  private finePointer = false;
  private introTurn = 0;

  mount(context: SceneContext) {
    this.context = context;
    this.finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    context.root.add(this.group);
    this.build(context.tier);
  }
  async prepare(signal: AbortSignal) {
    if (signal.aborted) throw new Error("Impression preparation canceled");
  }
  private own<T extends { dispose(): void }>(resource: T): T {
    try {
      const lease = this.context!.assets.acquire(
        `impression/${++this.serial}`,
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
    // Diwali Edition: burnished gold faces with a thin lacquer; mirror-polished
    // bevels catch the softboxes as crisp lines. Low tier drops the clearcoat.
    const satin = this.own(
      tier === "low"
        ? new THREE.MeshStandardMaterial({
            color: 0xe3c58c,
            metalness: 1,
            roughness: 0.26,
            envMapIntensity: 1.25,
          })
        : new THREE.MeshPhysicalMaterial({
            color: 0xe3c58c,
            metalness: 1,
            roughness: 0.28,
            clearcoat: 0.45,
            clearcoatRoughness: 0.08,
            envMapIntensity: 1.25,
          }),
    );
    const polished = this.own(
      new THREE.MeshStandardMaterial({
        color: 0xd6a85a,
        metalness: 1,
        roughness: 0.1,
        envMapIntensity: 1.45,
      }),
    );
    this.sculpture = new THREE.Mesh(
      this.own(
        createImpressionGeometry(
          tier === "high" ? 6 : tier === "balanced" ? 3 : 2,
        ),
      ),
      [satin, polished],
    );
    this.sculpture.name = "Webora / Impression / folded metallic W";
    this.group.add(this.sculpture);
    // Baked contact shading avoids real-time shadow maps on mobile.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const paint = canvas.getContext("2d");
    if (paint) {
      const gradient = paint.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(20,19,15,.24)");
      gradient.addColorStop(0.4, "rgba(20,19,15,.12)");
      gradient.addColorStop(1, "rgba(20,19,15,0)");
      paint.fillStyle = gradient;
      paint.fillRect(0, 0, 64, 64);
      const texture = this.own(new THREE.CanvasTexture(canvas));
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = this.own(
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        }),
      );
      const shadow = new THREE.Mesh(
        this.own(new THREE.PlaneGeometry(6.4, 3.2)),
        material,
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -1.95;
      this.group.add(shadow);
    }
    this.diyas = new DiyaLights((resource) => this.own(resource), tier);
    this.group.add(this.diyas.group);
    this.resize(this.width, this.height);
  }
  setDirector(director: IntroDirector) {
    this.director = director;
  }
  setIntro(opening: boolean) {
    if (opening) this.context?.invalidate();
  }
  startDrag() {
    this.director?.finish("drag");
    this.dragging = true;
    this.velocity = 0;
    this.target = undefined;
  }
  drag(dx: number, dy: number, milliseconds: number) {
    const change = (dx * Math.PI * 2) / Math.max(300, this.width);
    this.yaw += change;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.002, -0.2, 0.2);
    this.velocity = THREE.MathUtils.clamp(
      change / Math.max(0.008, milliseconds / 1000),
      -3,
      3,
    );
    this.context?.invalidate();
  }
  endDrag(cancelled: boolean) {
    this.dragging = false;
    if (cancelled) this.velocity = 0;
    this.context?.invalidate();
  }
  turn(amount: number) {
    this.director?.finish("control");
    this.dragging = false;
    this.velocity = 0;
    this.target =
      amount === 0
        ? Math.round(this.yaw / (Math.PI * 2)) * Math.PI * 2
        : (this.target ?? this.yaw) + amount;
    if (amount === 0) this.pitch = 0;
    this.context?.invalidate();
  }
  update(frame: FrameState) {
    if (this.suspended || !this.context || !this.sculpture || !this.diyas)
      return false;
    const { delta, pointer } = frame;
    this.progress = this.director?.sample(frame.now ?? frame.time * 1000) ?? 1;
    if (this.target !== undefined) {
      this.yaw += (this.target - this.yaw) * (1 - Math.exp(-delta / 0.13));
      if (Math.abs(this.target - this.yaw) < 0.0001) {
        this.yaw = this.target;
        this.target = undefined;
      }
    } else if (!this.dragging && this.velocity) {
      const decay = Math.exp(-delta / 0.16);
      this.yaw += this.velocity * 0.16 * (1 - decay);
      this.velocity *= decay;
      if (Math.abs(this.velocity) < 0.005) this.velocity = 0;
    }
    // A fixed camera and an actual mesh turn expose both edges and the back.
    // The first tenth gives the type time to arrive; the final portion holds
    // the exact hero pose while the type exits. No counter-rotating camera.
    const revolution = THREE.MathUtils.smoothstep(this.progress, 0.1, 0.88);
    this.introTurn = Math.PI * 2 * revolution;
    const opening =
      this.director !== undefined && this.director.phase !== "settled";
    const px = !opening && this.finePointer && pointer.active ? pointer.nx : 0;
    const py = !opening && this.finePointer && pointer.active ? pointer.ny : 0;
    this.sculpture.rotation.set(
      -0.1 + this.pitch - py * 0.025,
      -0.26 + this.yaw + px * 0.055 + this.introTurn,
      -0.08,
    );
    // Reserve breathing room for the wordmark while the tall side profiles
    // pass. Only after the revolution do we ease into the approved hero frame.
    const settle = THREE.MathUtils.smoothstep(this.progress, 0.88, 1);
    this.sculpture.position.set(0, -0.13 - (1 - settle) * 0.15, 0);
    this.context.camera.position.set(
      0,
      0.6,
      this.distance * (1 + (1 - settle) * 0.22),
    );
    // Narrow stages reserve a separate upper band for the intro wordmark.
    // Move the whole composition, including its contact shadow, together.
    this.context.camera.lookAt(
      0,
      -0.12 + (this.width < 500 ? (1 - settle) * 0.6 : 0),
      0,
    );
    // The lamps catch one after another during the revolution, then rest lit.
    // A first frame with a director (the hero) also earns a short flicker.
    const flickering = this.diyas.update(
      frame.now ?? frame.time * 1000,
      opening ? THREE.MathUtils.smoothstep(this.progress, 0, 0.9) : 1,
      opening || (!this.kindled && this.director !== undefined),
      this.finePointer ? pointer : undefined,
    );
    this.kindled = true;
    return (
      flickering ||
      this.dragging ||
      this.velocity !== 0 ||
      this.target !== undefined ||
      (this.director !== undefined && this.director.phase !== "settled")
    );
  }
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (!this.context) return;
    const halfFov = Math.atan(
      Math.tan(THREE.MathUtils.degToRad(this.context.camera.fov / 2)) *
        Math.min(1, width / Math.max(1, height)),
    );
    this.distance = Math.max(7.8, 2.65 / Math.sin(halfFov));
    this.context.camera.position.set(0, 0.6, this.distance);
    this.context.camera.lookAt(0, -0.12, 0);
  }
  quality(tier: QualityTier) {
    this.build(tier);
  }
  suspend() {
    this.suspended = true;
    this.dragging = false;
    this.velocity = 0;
    this.target = undefined;
    this.director?.finish("suspended");
  }
  resume() {
    this.suspended = false;
  }
  recoverMaterials() {
    return false;
  } // Ordinary materials already; runtime retains the DOM fallback on failure.
  inspect() {
    return {
      yaw: this.yaw,
      pitch: this.pitch,
      progress: this.progress,
      introTurn: this.introTurn,
      rotationY: this.sculpture?.rotation.y ?? 0,
      sculptureId: this.sculpture?.uuid ?? "",
      geometryId: this.sculpture?.geometry.uuid ?? "",
      material: "Impression / standard metal, Diwali gold",
      diyas: this.diyas?.group.children.length ?? 0,
      introPhase: this.director?.phase ?? "settled",
      introDuration: this.director?.duration ?? 0,
      introStartedAt: this.director?.startedAt ?? 0,
      introReason: this.director?.reason ?? "session",
    };
  }
  dispose() {
    this.suspend();
    try {
      this.clear();
    } finally {
      this.group.removeFromParent();
      this.context = undefined;
    }
  }
}
