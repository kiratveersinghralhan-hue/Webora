import * as THREE from "three/src/Three.js";
import { featuredProjects } from "../../data/studio";
import { assetUrl } from "../../lib/site";
import { GalleryController } from "../../lib/galleryController";
import { curvedScreen } from "../geometry/curvedScreen";
import type { FrameState, SceneContext, SceneModule } from "../runtime/types";

export class GalleryScene implements SceneModule {
  readonly group = new THREE.Group();
  readonly controller = new GalleryController(featuredProjects.length);
  private context!: SceneContext;
  private cards: THREE.Group[] = [];
  private releases: (() => void)[] = [];
  private serial = 0;
  private alive = true;
  private loaded = 0;
  private failures = 0;
  private last = -1;
  private narrow = false;
  onSettled?: (index: number) => void;
  private own<T extends { dispose(): void }>(value: T) {
    const lease = this.context.assets.acquire(
      `gallery/${++this.serial}`,
      () => value,
    );
    this.releases.push(lease.release);
    return lease.value;
  }
  mount(context: SceneContext) {
    this.context = context;
    context.root.add(this.group);
    const frame = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x596582,
        metalness: 0.92,
        roughness: 0.24,
      }),
    );
    const back = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x161d30,
        metalness: 0.85,
        roughness: 0.3,
      }),
    );
    const trim = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x8eabed,
        metalness: 0.8,
        roughness: 0.22,
      }),
    );
    const shell = this.own(curvedScreen(6.3, 4.04, 0.22, true));
    const rear = this.own(curvedScreen(6.08, 3.8, 0.1, true));
    const face = this.own(curvedScreen(6.02, 3.55, 0));
    const edge = this.own(new THREE.BoxGeometry(0.035, 2.9, 0.045));
    for (const project of featuredProjects) {
      const card = new THREE.Group();
      card.name = project.name;
      card.add(new THREE.Mesh(shell, frame));
      const backing = new THREE.Mesh(rear, back);
      backing.position.z = -0.18;
      card.add(backing);
      if (project.image) {
        const texture = this.own(
          new THREE.TextureLoader().load(
            assetUrl(project.image),
            (loaded) => {
              if (!this.alive) return;
              // Top crop tall captures; artwork retains its original aspect ratio too.
              const image = loaded.image as { width: number; height: number };
              const screenAspect = 6.02 / 3.55,
                imageAspect = image.width / image.height;
              if (imageAspect < screenAspect) {
                loaded.repeat.y = imageAspect / screenAspect;
                loaded.offset.y = 1 - loaded.repeat.y;
              } else {
                loaded.repeat.x = screenAspect / imageAspect;
                loaded.offset.x = (1 - loaded.repeat.x) / 2;
              }
              loaded.needsUpdate = true;
              this.loaded++;
              context.invalidate();
            },
            undefined,
            () => {
              if (this.alive) {
                this.failures++;
                context.invalidate();
              }
            },
          ),
        );
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = this.own(
          new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
        );
        const screen = new THREE.Mesh(face, material);
        screen.position.set(0, -0.07, 0.14);
        card.add(screen);
      } else {
        // An explicit project label, never a fabricated delivered website.
        const label = document.createElement("canvas");
        label.width = 1200;
        label.height = 708;
        const ctx = label.getContext("2d")!;
        ctx.fillStyle = "#d6dbe7";
        ctx.fillRect(0, 0, 1200, 708);
        ctx.fillStyle = "#24334e";
        ctx.font = "20px sans-serif";
        ctx.fillText("ARTICLE PROJECT / IN PROGRESS", 72, 85);
        ctx.font = "italic 100px Georgia";
        ctx.fillText("The next chapter.", 72, 355);
        ctx.font = "20px sans-serif";
        ctx.fillText("PROJECT PREVIEW TO FOLLOW", 72, 625);
        const texture = this.own(new THREE.CanvasTexture(label));
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = this.own(
          new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
        );
        const screen = new THREE.Mesh(face, material);
        screen.position.set(0, -0.07, 0.14);
        card.add(screen);
      }
      // Machined spine and four rear rails finish the surfaces seen during transitions.
      for (let i = 0; i < 4; i++) {
        const rib = new THREE.Mesh(edge, trim);
        rib.position.set((i - 1.5) * 0.65, 0, -0.28);
        card.add(rib);
      }
      const bar = new THREE.Mesh(
        this.own(new THREE.BoxGeometry(1.1, 0.018, 0.02)),
        trim,
      );
      bar.position.set(0, 1.86, 0.15);
      card.add(bar);
      this.cards.push(card);
      this.group.add(card);
    }
  }
  async prepare(signal: AbortSignal) {
    if (signal.aborted) throw new Error("Gallery cancelled");
  }
  select(index: number) {
    this.controller.select(index);
    this.context?.invalidate();
  }
  start() {
    this.controller.start();
    this.context.invalidate();
  }
  drag(dx: number, milliseconds: number, width: number) {
    this.controller.drag(-dx / Math.max(220, width * 0.48), milliseconds);
    this.context.invalidate();
  }
  end(cancelled: boolean) {
    this.controller.end(cancelled);
    this.context.invalidate();
  }
  update(frame: FrameState) {
    const moving = this.controller.update(frame.delta),
      q = this.controller.position;
    this.cards.forEach((card, i) => {
      const d = i - q,
        angle = d * (this.narrow ? 0.58 : 0.65),
        radius = this.narrow ? 8.8 : 10.8;
      card.visible = Math.abs(d) < 1.75;
      card.position.set(
        Math.sin(angle) * radius,
        -Math.abs(d) * 0.16,
        (Math.cos(angle) - 1) * radius - Math.abs(d) * 0.5,
      );
      card.rotation.set(-0.025, -angle * 0.82, d * -0.025);
      card.scale.setScalar(1 - Math.min(0.18, Math.abs(d) * 0.1));
    });
    if (!moving && this.last !== q) {
      this.last = q;
      this.onSettled?.(Math.round(q));
    }
    return moving;
  }
  resize(width: number, height: number) {
    this.narrow = width < 600;
    const camera = this.context.camera;
    const distance = Math.max(
      9.8,
      3.65 /
        ((Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * width) / height),
    );
    camera.position.set(0, 0.8, distance);
    camera.lookAt(0, 0, 0);
  }
  quality() {}
  suspend() {
    this.controller.end(true);
  }
  resume() {}
  inspect() {
    return {
      chapter: "gallery",
      position: this.controller.position,
      selected: this.controller.target,
      loadedScreenshots: this.loaded,
      textureFailures: this.failures,
      geometryId:
        (this.cards[0]?.children[0] as THREE.Mesh)?.geometry.uuid ?? "",
    };
  }
  dispose() {
    this.alive = false;
    this.onSettled = undefined;
    this.group.removeFromParent();
    this.group.clear();
    this.cards = [];
    for (const release of this.releases.splice(0).reverse()) release();
  }
}
