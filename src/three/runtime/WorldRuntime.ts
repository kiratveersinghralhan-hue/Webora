import * as THREE from "three/src/Three.js";
import { pointer, subscribePointer } from "../../lib/pointer";
import { subscribeFrame } from "../../lib/frameClock";
import { AssetRegistry } from "./AssetRegistry";
import { FrameGate } from "./FrameGate";
import { QualityPolicy, qualitySettings, resolution } from "./QualityPolicy";
import { createStudioEnvironment } from "./studioEnvironment";
import { recordRuntime, recordFrame, recordEvent } from "./diagnostics";
import type { RuntimeStatus, SceneModule } from "./types";

/** Route-owned renderer. Scene modules share resources/camera and never schedule themselves. */
export class WorldRuntime {
  readonly assets = new AssetRegistry();
  readonly camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
  readonly scene = new THREE.Scene();
  readonly root = new THREE.Group();
  private modules = new Map<string, SceneModule>();
  private renderer?: THREE.WebGLRenderer;
  private quality?: QualityPolicy;
  private gate = new FrameGate();
  private abort = new AbortController();
  private cleanup: (() => void)[] = [];
  private diagnostics = recordRuntime("v2", "hero");
  private initializing = false;
  private shaderFailed = false;
  private losses = 0;
  private lastDraw?: number;
  private revision = 0;
  private announced = false;
  private intersecting = true;
  private pointerX = NaN;
  private pointerY = NaN;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private blue = new THREE.PointLight(0x547cff, 24, 25);
  private violet = new THREE.PointLight(0xae72ff, 18, 25);
  private key = new THREE.DirectionalLight(0xe9eaff, 3);
  private ambient = new THREE.AmbientLight(0xabbaff, 1.1);
  private studioEnvironment?: THREE.CubeTexture;
  private impressionEnvironment?: THREE.CubeTexture;
  constructor(
    private host: HTMLElement,
    private status: (status: RuntimeStatus) => void,
    private impressionHero = false,
  ) {
    this.scene.add(this.root);
  }
  register(id: string, module: SceneModule) {
    if (this.initializing || this.gate.disposed || this.modules.has(id))
      throw new Error("Invalid scene registration");
    this.modules.set(id, module);
  }
  invalidate = () => this.gate.invalidate();
  ownCleanup(stop: () => void) {
    this.cleanup.push(stop);
  }
  /** Transfer the same canvas between chapter slots. Never creates another context. */
  attach(host: HTMLElement) {
    if (host === this.host || this.gate.disposed) return;
    this.resizeObserver?.unobserve(this.host);
    this.intersectionObserver?.unobserve(this.host);
    this.host = host;
    if (this.renderer) host.appendChild(this.renderer.domElement);
    this.lightingForHost();
    this.resizeObserver?.observe(host);
    this.intersectionObserver?.observe(host);
    const rect = host.getBoundingClientRect();
    this.intersecting =
      rect.bottom > 0 && rect.top < innerHeight && rect.width > 0;
    this.resize();
    this.visibility();
    this.invalidate();
  }
  /** Match only the new hero host; other chapters retain their original light rig. */
  private lightingForHost() {
    const impression =
      this.impressionHero && this.host.dataset.experienceStage === "impression";
    this.blue.visible = this.violet.visible = !impression;
    this.key.color.setHex(impression ? 0xfff2db : 0xe9eaff);
    this.key.intensity = impression ? 3.2 : 3;
    this.key.position.set(impression ? -3 : 1, 4, 6);
    this.ambient.color.setHex(impression ? 0xe5dfd1 : 0xabbaff);
    this.ambient.intensity = impression ? 0.8 : 1.1;
    if (this.renderer)
      this.renderer.toneMappingExposure = impression ? 1.05 : 1.3;
    this.scene.environment =
      (impression ? this.impressionEnvironment : this.studioEnvironment) ??
      null;
    this.invalidate();
  }
  async initialize() {
    if (this.initializing || this.gate.disposed) return;
    this.initializing = true;
    let revision = this.revision;
    try {
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      this.renderer = renderer;
      renderer.debug.onShaderError = () => {
        this.shaderFailed = true;
      };
      const gl = renderer.getContext();
      const debug = gl.getExtension("WEBGL_debug_renderer_info");
      const navigatorHints = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
      };
      this.quality = new QualityPolicy({
        coarse: matchMedia("(pointer: coarse)").matches,
        memory: navigatorHints.deviceMemory,
        cores: navigator.hardwareConcurrency,
        saveData: !!navigatorHints.connection?.saveData,
        maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        software:
          !!debug &&
          /swiftshader|llvmpipe|software/i.test(
            String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)),
          ),
      });
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      const environment = this.assets.acquire("studio/environment", () =>
        createStudioEnvironment(),
      );
      this.studioEnvironment = environment.value;
      if (this.impressionHero) {
        this.impressionEnvironment = this.assets.acquire(
          "impression/environment",
          () => createStudioEnvironment("impression"),
        ).value;
      }
      this.blue.position.set(-4, 3, 5);
      this.violet.position.set(3, -1, 4);
      this.scene.add(this.ambient, this.blue, this.violet, this.key);
      this.lightingForHost();
      this.host.appendChild(renderer.domElement);
      for (const module of this.modules.values())
        module.mount({
          root: this.root,
          camera: this.camera,
          assets: this.assets,
          tier: this.quality.tier,
          invalidate: this.invalidate,
        });
      this.installObservers();
      this.resize();
      this.cleanup.push(subscribeFrame("world", this.tick));
      revision = ++this.revision;
      await this.prepare();
      if (this.gate.disposed || this.gate.lost || revision !== this.revision)
        return;
      this.gate.ready = true;
      this.invalidate();
    } catch (error) {
      if (!this.gate.disposed && !this.gate.lost && revision === this.revision)
        this.fail(
          error instanceof Error
            ? error.message
            : "World initialization failed",
        );
    }
  }
  private async prepare() {
    const signal = this.abort.signal;
    let timer = 0;
    let cancel = () => {};
    const deadline = new Promise<never>((_, reject) => {
      timer = window.setTimeout(
        () => reject(new Error("World preparation timed out")),
        // Background shader readiness is independent of the <=3s intro budget.
        // HTML remains available while slower real drivers finish compilation.
        8000,
      );
      cancel = () => reject(new Error("World preparation canceled"));
      signal.addEventListener("abort", cancel, { once: true });
    });
    try {
      const work = async () => {
        await Promise.all(
          [...this.modules.values()].map((module) => module.prepare(signal)),
        );
        if (signal.aborted) throw new Error("World preparation canceled");
        const renderer = this.renderer!;
        const compile = async () => {
          if (
            renderer.getContext().getExtension("KHR_parallel_shader_compile")
          ) {
            await renderer.compileAsync(this.scene, this.camera);
          } else {
            // Three's async fallback blocks in compile(), then defers its ready
            // check to a timer. A slow completed compile can otherwise lose to
            // our already-expired deadline. Keep the non-parallel path synchronous;
            // readiness still requires a successful draw, not compile completion.
            renderer.compile(this.scene, this.camera);
          }
        };
        await compile();
        if (this.shaderFailed && !signal.aborted) {
          if (this.recoverMaterials()) {
            await compile();
          }
        }
        if (this.shaderFailed)
          throw new Error("World shader compilation failed");
      };
      await Promise.race([work(), deadline]);
    } finally {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
    }
  }
  private recoverMaterials() {
    let recovered = false;
    for (const module of this.modules.values())
      recovered = (module.recoverMaterials?.() ?? false) || recovered;
    if (recovered) {
      this.shaderFailed = false;
      recordEvent(this.diagnostics, "ordinary-alloy-fallback");
    }
    return recovered;
  }
  private installObservers() {
    const resize = new ResizeObserver(this.resize);
    this.resizeObserver = resize;
    resize.observe(this.host);
    this.cleanup.push(() => resize.disconnect());
    const intersection = new IntersectionObserver((entries) => {
      const entry = entries.find((item) => item.target === this.host);
      if (!entry) return;
      this.intersecting = entry.isIntersecting;
      this.gate.visible =
        this.intersecting &&
        !!this.host.clientWidth &&
        !!this.host.clientHeight;
      if (this.diagnostics) this.diagnostics.visible = entry.isIntersecting;
      this.visibility();
    });
    this.intersectionObserver = intersection;
    intersection.observe(this.host);
    this.cleanup.push(() => intersection.disconnect());
    document.addEventListener("visibilitychange", this.visibility);
    this.cleanup.push(() =>
      document.removeEventListener("visibilitychange", this.visibility),
    );
    window.addEventListener("resize", this.resize);
    this.cleanup.push(() => window.removeEventListener("resize", this.resize));
    const canvas = this.renderer!.domElement;
    canvas.addEventListener("webglcontextlost", this.contextLost);
    canvas.addEventListener("webglcontextrestored", this.contextRestored);
    this.cleanup.push(() => {
      canvas.removeEventListener("webglcontextlost", this.contextLost);
      canvas.removeEventListener("webglcontextrestored", this.contextRestored);
    });
    this.cleanup.push(
      subscribePointer((state) => {
        if (state.nx !== this.pointerX || state.ny !== this.pointerY) {
          this.pointerX = state.nx;
          this.pointerY = state.ny;
          this.invalidate();
        }
      }),
    );
    this.visibility();
  }
  private visibility = () => {
    this.gate.hidden = document.hidden;
    this.lastDraw = undefined;
    this.quality?.resetWindow();
    if (this.gate.hidden || !this.gate.visible || this.gate.lost) {
      for (const module of this.modules.values()) module.suspend();
      recordEvent(this.diagnostics, "suspended");
    } else {
      for (const module of this.modules.values()) module.resume();
      this.invalidate();
      recordEvent(this.diagnostics, "resumed");
    }
  };
  private resize = () => {
    if (this.gate.disposed || !this.renderer || !this.quality) return;
    const width = this.host.clientWidth,
      height = this.host.clientHeight;
    if (!width || !height) {
      this.gate.visible = false;
      return;
    }
    const wasVisible = this.gate.visible;
    this.gate.visible = this.intersecting;
    if (!wasVisible && this.gate.visible) this.visibility();
    this.renderer.setPixelRatio(
      resolution(this.quality.tier, width, height, devicePixelRatio),
    );
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    for (const module of this.modules.values()) module.resize(width, height);
    if (import.meta.env.DEV) {
      this.host.dataset.quality = this.quality.tier;
      this.host.dataset.dpr = String(this.renderer.getPixelRatio());
    }
    if (this.diagnostics) this.diagnostics.quality = this.quality.tier;
    this.invalidate();
  };
  private tick = (time: number) => {
    if (
      !this.renderer ||
      !this.quality ||
      !this.gate.canDraw(time, qualitySettings[this.quality.tier].fps)
    ) {
      return;
    }
    try {
      const now = performance.now() / 1000;
      const gap = this.lastDraw === undefined ? undefined : now - this.lastDraw;
      const delta =
        gap === undefined || gap > 0.25
          ? 1 / 60
          : Math.min(1 / 30, Math.max(0, gap));
      let moving = false;
      for (const module of this.modules.values())
        moving =
          module.update({
            time,
            now: now * 1000,
            delta,
            pointer,
            scroll: scrollY,
          }) || moving;
      this.blue.position.set(-3 + pointer.nx * 1.2, 3 + pointer.ny * 0.6, 5);
      this.violet.position.x = 3 + pointer.nx * 0.5;
      this.renderer.render(this.scene, this.camera);
      if (this.shaderFailed) {
        if (!this.recoverMaterials())
          throw new Error("World shader compilation failed");
        // Some drivers link lazily on the first draw. Retry the ordinary material
        // through the same guarded preparation path before announcing readiness.
        const revision = ++this.revision;
        this.gate.ready = false;
        this.prepare()
          .then(() => {
            if (
              this.gate.disposed ||
              this.gate.lost ||
              revision !== this.revision
            )
              return;
            this.gate.ready = true;
            this.invalidate();
          })
          .catch(() => {
            if (
              !this.gate.disposed &&
              !this.gate.lost &&
              revision === this.revision
            )
              this.fail("Ordinary alloy preparation failed");
          });
        return;
      }
      recordFrame(
        this.diagnostics,
        this.renderer,
        gap === undefined ? undefined : gap * 1000,
      );
      if (this.diagnostics)
        for (const module of this.modules.values())
          if (module.inspect) this.diagnostics.identity = module.inspect();
      if (import.meta.env.DEV)
        this.host.dataset.frames = String(
          Number(this.host.dataset.frames || 0) + 1,
        );
      this.gate.presented(time, moving);
      this.host.dispatchEvent(new Event("world-presented", { bubbles: true }));
      this.lastDraw = now;
      if (!this.announced) {
        this.announced = true;
        this.status({ ready: true, tier: this.quality.tier });
      }
      if (moving && gap !== undefined && this.quality.sample(gap)) {
        for (const module of this.modules.values())
          module.quality(this.quality.tier);
        this.resize();
        recordEvent(this.diagnostics, "quality-downgraded");
      }
    } catch (error) {
      this.fail(error instanceof Error ? error.message : "World render failed");
    }
  };
  private contextLost = (event: Event) => {
    event.preventDefault();
    this.gate.lost = true;
    this.gate.ready = false;
    this.losses++;
    this.revision++;
    this.announced = false;
    this.visibility();
    recordEvent(this.diagnostics, "context-lost");
    this.status({ ready: false, reason: "WebGL context lost" });
    this.host.dispatchEvent(new Event("world-unavailable", { bubbles: true }));
    if (this.losses > 1) this.fail("Repeated WebGL context loss");
  };
  private contextRestored = () => {
    if (this.gate.disposed || this.losses > 1) return;
    this.gate.lost = false;
    this.shaderFailed = false;
    const revision = ++this.revision;
    this.prepare()
      .then(() => {
        if (this.gate.disposed || this.gate.lost || revision !== this.revision)
          return;
        this.gate.ready = true;
        this.resize();
        this.visibility();
        recordEvent(this.diagnostics, "context-restored");
      })
      .catch(() => {
        if (
          !this.gate.disposed &&
          !this.gate.lost &&
          revision === this.revision
        )
          this.fail("WebGL restoration failed");
      });
  };
  private fail(reason: string) {
    this.host.dispatchEvent(new Event("world-unavailable", { bubbles: true }));
    recordEvent(this.diagnostics, `failed: ${reason}`);
    this.dispose();
    this.status({ ready: false, reason });
  }
  dispose() {
    if (this.gate.disposed) return;
    this.gate.disposed = true;
    this.abort.abort();
    const safely = (stop: () => void) => {
      try {
        stop();
      } catch {
        recordEvent(this.diagnostics, "cleanup-error");
      }
    };
    this.cleanup.splice(0).reverse().forEach(safely);
    for (const module of this.modules.values()) safely(() => module.dispose());
    this.modules.clear();
    this.scene.environment = null;
    safely(() => this.assets.dispose());
    this.scene.clear();
    if (this.renderer) {
      const renderer = this.renderer;
      safely(() => renderer.dispose());
      safely(() => renderer.forceContextLoss());
      safely(() => renderer.domElement.remove());
      this.renderer = undefined;
    }
    if (this.diagnostics) this.diagnostics.active = false;
    recordEvent(this.diagnostics, "disposed");
  }
}
