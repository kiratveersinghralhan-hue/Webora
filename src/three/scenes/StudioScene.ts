import * as THREE from "three/src/Three.js";
import { CoreScene } from "./CoreScene";
import { ImpressionScene } from "./ImpressionScene";
import { InstallationScene } from "./InstallationScene";
import { GalleryScene } from "./GalleryScene";
import type { FrameState, SceneContext, SceneModule } from "../runtime/types";
import type { QualityTier } from "../runtime/QualityPolicy";

export type StudioChapter = "hero" | "gallery" | "services" | "process";
/** One camera and renderer; scene modules are prepared when their HTML chapter enters. */
export class StudioScene implements SceneModule {
  readonly core: CoreScene | ImpressionScene;
  private heroRoot = new THREE.Group();
  private context?: SceneContext;
  private scenes = new Map<StudioChapter, InstallationScene | GalleryScene>();
  onGallerySettled?: (index: number) => void;
  galleryAction(
    action: "start" | "drag" | "end" | "select",
    a = 0,
    b = 0,
    c = 0,
  ) {
    const gallery = this.scenes.get("gallery");
    if (!(gallery instanceof GalleryScene)) return;
    if (action === "start") gallery.start();
    if (action === "drag") gallery.drag(a, b, c);
    if (action === "end") gallery.end(!!a);
    if (action === "select") gallery.select(a);
  }
  private selected: StudioChapter = "hero";
  private selectedIndex = 0;
  private width = 1;
  private height = 1;
  constructor(
    private includeHero = true,
    impression = false,
  ) {
    this.core = impression ? new ImpressionScene() : new CoreScene(true);
  }
  mount(context: SceneContext) {
    this.context = context;
    context.root.add(this.heroRoot);
    if (this.includeHero) this.core.mount({ ...context, root: this.heroRoot });
    this.select(this.selected, this.selectedIndex);
  }
  select(chapter: StudioChapter, index = 0, turn = false) {
    this.selected = chapter;
    this.selectedIndex = index;
    this.heroRoot.visible = chapter === "hero";
    if (!this.context) return;
    if (chapter !== "hero" && !this.scenes.has(chapter)) {
      const module =
        chapter === "gallery"
          ? new GalleryScene()
          : new InstallationScene(chapter);
      module.mount(this.context);
      if (module instanceof GalleryScene)
        module.onSettled = (value) => this.onGallerySettled?.(value);
      this.scenes.set(chapter, module);
    }
    for (const [key, module] of this.scenes)
      module.group.visible = key === chapter;
    if (chapter === "hero") this.core.resize(this.width, this.height);
    else {
      const module = this.scenes.get(chapter)!;
      module.resize(this.width, this.height);
      module.select(index);
      if (turn && module instanceof InstallationScene) module.turn();
    }
    this.context.invalidate();
  }
  async prepare(signal: AbortSignal) {
    if (this.includeHero) await this.core.prepare(signal);
  }
  update(frame: FrameState) {
    return this.selected === "hero"
      ? this.core.update(frame)
      : this.scenes.get(this.selected)!.update(frame);
  }
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (this.selected === "hero") this.core.resize(width, height);
    else this.scenes.get(this.selected)?.resize(width, height);
  }
  quality(tier: QualityTier) {
    if (this.includeHero) this.core.quality(tier);
  }
  suspend() {
    if (this.includeHero) this.core.suspend();
    for (const scene of this.scenes.values()) scene.suspend();
  }
  resume() {
    if (this.includeHero) this.core.resume();
    for (const scene of this.scenes.values()) scene.resume();
  }
  recoverMaterials() {
    return this.includeHero && this.core.recoverMaterials();
  }
  inspect() {
    return this.selected === "hero"
      ? { ...this.core.inspect(), chapter: "hero" }
      : this.scenes.get(this.selected)!.inspect();
  }
  dispose() {
    if (this.includeHero) this.core.dispose();
    for (const scene of this.scenes.values()) scene.dispose();
    this.scenes.clear();
    this.onGallerySettled = undefined;
    this.heroRoot.removeFromParent();
    this.context = undefined;
  }
}
