import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three/src/Three.js";
import { AssetRegistry } from "../src/three/runtime/AssetRegistry";
import {
  QualityPolicy,
  initialTier,
  resolution,
} from "../src/three/runtime/QualityPolicy";
import { FrameGate } from "../src/three/runtime/FrameGate";
import { installFrameDriver, subscribeFrame } from "../src/lib/frameClock";
import { CoreScene } from "../src/three/scenes/CoreScene";
import { WorldRuntime } from "../src/three/runtime/WorldRuntime";
import type { SceneModule } from "../src/three/runtime/types";

const fake = vi.hoisted(() => ({
  failCreate: false,
  failRender: false,
  parallelCompile: true,
  syncCompile: vi.fn(),
  compile: vi.fn(),
  dispose: vi.fn(),
  lose: vi.fn(),
  render: vi.fn(),
  shaderError: undefined as (() => void) | undefined,
}));
vi.mock("../src/three/runtime/diagnostics", () => ({
  recordRuntime: () => undefined,
  recordEvent: () => {},
  recordFrame: () => {},
}));
vi.mock("../src/lib/pointer", () => ({
  pointer: { nx: 0, ny: 0, active: false },
  subscribePointer: () => () => {},
}));
vi.mock("../src/three/runtime/studioEnvironment", async () => {
  const actual = await import("three/src/Three.js");
  return { createStudioEnvironment: () => new actual.CubeTexture() };
});
vi.mock("three/src/Three.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("three/src/Three.js")>();
  return {
    ...actual,
    WebGLRenderer: class {
      domElement = Object.assign(new EventTarget(), { remove: vi.fn() });
      debug = {
        set onShaderError(callback: () => void) {
          fake.shaderError = callback;
        },
      };
      info = {
        render: { calls: 1, triangles: 1 },
        memory: { geometries: 1, textures: 1 },
      };
      dpr = 1;
      constructor() {
        if (fake.failCreate) throw new Error("No GL");
      }
      getContext() {
        return {
          MAX_TEXTURE_SIZE: 1,
          getExtension: (name: string) =>
            name === "KHR_parallel_shader_compile" && fake.parallelCompile
              ? {}
              : null,
          getParameter: () => 8192,
        };
      }
      setClearColor() {}
      setPixelRatio(value: number) {
        this.dpr = value;
      }
      getPixelRatio() {
        return this.dpr;
      }
      setSize() {}
      compileAsync() {
        return fake.compile();
      }
      compile() {
        return fake.syncCompile();
      }
      render() {
        if (fake.failRender) throw new Error("Render failed");
        fake.render();
      }
      dispose() {
        fake.dispose();
      }
      forceContextLoss() {
        fake.lose();
      }
    },
  };
});

const hints = {
  coarse: false,
  memory: 8,
  cores: 8,
  saveData: false,
  maxTexture: 8192,
  software: false,
};
let ticker: ((time: number) => void) | undefined;
let resizeCallback: (() => void) | undefined;
let intersectionCallback:
  | ((entries: { isIntersecting: boolean; target: HTMLElement }[]) => void)
  | undefined;
let canvas: EventTarget;
let host: HTMLElement;
let doc: EventTarget & { hidden: boolean };
let world: WorldRuntime | undefined;
let statuses: { ready: boolean; reason?: string }[];
const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};
beforeEach(() => {
  vi.clearAllMocks();
  fake.failCreate = fake.failRender = false;
  fake.parallelCompile = true;
  fake.syncCompile.mockReset();
  fake.compile.mockResolvedValue(undefined);
  installFrameDriver({
    add: (callback) => {
      ticker = callback;
    },
    remove: () => {
      ticker = undefined;
    },
  });
  doc = Object.assign(new EventTarget(), { hidden: false });
  vi.stubGlobal("document", doc);
  vi.stubGlobal(
    "window",
    Object.assign(new EventTarget(), { setTimeout, clearTimeout }),
  );
  vi.stubGlobal("navigator", { hardwareConcurrency: 8, deviceMemory: 8 });
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.stubGlobal("devicePixelRatio", 2);
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resizeCallback = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof intersectionCallback) {
        intersectionCallback = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  host = {
    clientWidth: 800,
    clientHeight: 600,
    dataset: {},
    dispatchEvent: vi.fn(() => true),
    appendChild: (element: EventTarget) => {
      canvas = element;
    },
  } as unknown as HTMLElement;
  statuses = [];
});
afterEach(() => {
  world?.dispose();
  world = undefined;
  vi.unstubAllGlobals();
});
function moduleWith(resource = { dispose: vi.fn() }): SceneModule {
  return {
    mount: (context) => {
      context.assets.acquire("test-resource", () => resource);
    },
    prepare: async () => {},
    update: () => false,
    resize: () => {},
    quality: () => {},
    suspend: () => {},
    resume: () => {},
    dispose: vi.fn(),
  };
}
function runtime(module = moduleWith()) {
  world = new WorldRuntime(host, (state) => statuses.push(state));
  world.register("test", module);
  return world;
}

describe("shared resource and rendering policy", () => {
  it("frames the original W and rear across narrow slots and quarter turns", () => {
    const core = new CoreScene(),
      assets = new AssetRegistry(),
      camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
    core.mount({
      root: new THREE.Group(),
      camera,
      assets,
      tier: "low",
      invalidate() {},
    });
    for (const [width, height] of [
      [720, 620],
      [360, 540],
      [320, 280],
      [430, 360],
    ]) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      core.resize(width, height);
      for (const yaw of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        core.yaw = yaw;
        core.update({
          time: 1,
          delta: 1 / 60,
          pointer: { nx: 0, ny: 0, active: false },
          scroll: 0,
        });
        core.group.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
        for (const mesh of core.group.children.slice(0, 2) as THREE.Mesh[]) {
          const vertices = mesh.geometry.getAttribute("position");
          for (let i = 0; i < vertices.count; i++) {
            const projected = new THREE.Vector3()
              .fromBufferAttribute(vertices, i)
              .applyMatrix4(mesh.matrixWorld)
              .project(camera);
            expect(
              Math.abs(projected.x),
              `${width}x${height}, yaw=${yaw}`,
            ).toBeLessThan(0.98);
            expect(
              Math.abs(projected.y),
              `${width}x${height}, yaw=${yaw}`,
            ).toBeLessThan(0.98);
          }
        }
      }
    }
    core.dispose();
    assets.dispose();
  });
  it("deduplicates leases, releases once and rejects allocations after disposal", () => {
    const registry = new AssetRegistry(),
      resource = { dispose: vi.fn() };
    const first = registry.acquire("w", () => resource),
      second = registry.acquire("w", () => {
        throw new Error("duplicate allocation");
      });
    first.release();
    first.release();
    expect(resource.dispose).not.toHaveBeenCalled();
    second.release();
    expect(resource.dispose).toHaveBeenCalledTimes(1);
    registry.dispose();
    expect(() => registry.acquire("late", () => resource)).toThrow();
  });
  it("blocks unready/settled/hidden/offscreen/lost/disposed draws and caps frequency", () => {
    const gate = new FrameGate();
    expect(gate.canDraw(0, 30)).toBe(false);
    gate.ready = true;
    expect(gate.canDraw(0, 30)).toBe(true);
    gate.presented(0, false);
    expect(gate.canDraw(1, 30)).toBe(false);
    gate.invalidate();
    expect(gate.canDraw(0.01, 30)).toBe(false);
    for (const key of ["hidden", "lost", "disposed"] as const) {
      gate[key] = true;
      expect(gate.canDraw(1, 30)).toBe(false);
      gate[key] = false;
    }
    gate.visible = false;
    expect(gate.canDraw(1, 30)).toBe(false);
  });
  it("uses capability hints and bounded pixels, downgrading only after sustained windows", () => {
    expect(initialTier(hints)).toBe("high");
    expect(initialTier({ ...hints, memory: undefined })).toBe("balanced");
    expect(initialTier({ ...hints, saveData: true })).toBe("low");
    expect(initialTier({ ...hints, coarse: true })).toBe("balanced");
    expect(
      resolution("low", 1920, 1080, 3) ** 2 * 1920 * 1080,
    ).toBeLessThanOrEqual(350001);
    const policy = new QualityPolicy(hints);
    for (let i = 0; i < 45; i++) policy.sample(0.05);
    expect(policy.tier).toBe("high");
    for (let i = 0; i < 45; i++) policy.sample(0.05);
    expect(policy.tier).toBe("balanced");
    for (let i = 0; i < 500; i++) policy.sample(0.016);
    expect(policy.tier).toBe("balanced");
  });
  it("orders scroll before pointer before world regardless of subscription order", () => {
    const order: string[] = [];
    const stops = [
      subscribeFrame("world", () => order.push("world")),
      subscribeFrame("pointer", () => order.push("pointer")),
      subscribeFrame("scroll", () => order.push("scroll")),
    ];
    ticker!(1);
    expect(order).toEqual(["scroll", "pointer", "world"]);
    stops.forEach((stop) => stop());
    expect(ticker).toBeUndefined();
  });
  it("preserves W geometry, exact turns and bounded ownership across quality rebuilds", () => {
    const core = new CoreScene(),
      assets = new AssetRegistry(),
      root = new THREE.Group(),
      camera = new THREE.PerspectiveCamera();
    core.mount({ root, camera, assets, tier: "high", invalidate() {} });
    core.resize(390, 450);
    const initial = assets.size;
    core.turn(Math.PI / 2);
    for (let i = 0; i < 200; i++)
      core.update({
        time: i / 60,
        delta: 1 / 60,
        pointer: { nx: 0, ny: 0, active: false },
        scroll: 0,
      });
    expect(core.yaw).toBe(Math.PI / 2);
    core.quality("low");
    expect(assets.size).toBe(initial);
    core.dispose();
    expect(assets.size).toBe(0);
    expect(root.children).toHaveLength(0);
  });
});
describe("WorldRuntime lifecycle", () => {
  it("retries a failed custom compile with ordinary alloy on the same owner", async () => {
    fake.parallelCompile = false;
    fake.syncCompile.mockImplementationOnce(() => fake.shaderError?.());
    const module = moduleWith();
    module.recoverMaterials = vi.fn(() => true);
    await runtime(module).initialize();
    expect(module.recoverMaterials).toHaveBeenCalledTimes(1);
    expect(fake.syncCompile).toHaveBeenCalledTimes(2);
    expect(statuses).toEqual([]);
    ticker!(1);
    expect(statuses.at(-1)?.ready).toBe(true);
    expect(fake.dispose).not.toHaveBeenCalled();
  });
  it("recovers lazy first-draw shader failure before announcing a useful frame", async () => {
    const module = moduleWith();
    module.recoverMaterials = vi.fn(() => true);
    await runtime(module).initialize();
    fake.render.mockImplementationOnce(() => fake.shaderError?.());
    ticker!(1);
    expect(statuses).toEqual([]);
    await flush();
    ticker!(2);
    expect(statuses.at(-1)?.ready).toBe(true);
    expect(module.recoverMaterials).toHaveBeenCalledTimes(1);
    expect(fake.dispose).not.toHaveBeenCalled();
  });
  it("uses synchronous compilation without the parallel extension and still waits for a draw", async () => {
    fake.parallelCompile = false;
    await runtime().initialize();
    expect(fake.syncCompile).toHaveBeenCalledTimes(1);
    expect(fake.compile).not.toHaveBeenCalled();
    expect(statuses).toEqual([]);
    ticker!(1);
    expect(statuses.at(-1)?.ready).toBe(true);
  });
  it("cleans resources when non-parallel compilation throws", async () => {
    fake.parallelCompile = false;
    fake.syncCompile.mockImplementation(() => {
      throw new Error("Sync compile failed");
    });
    await runtime().initialize();
    expect(statuses.at(-1)?.reason).toContain("Sync compile failed");
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(world!.assets.size).toBe(0);
  });
  it("does not announce readiness when its first render fails", async () => {
    fake.failRender = true;
    await runtime().initialize();
    ticker!(1);
    expect(statuses.some((state) => state.ready)).toBe(false);
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(world!.assets.size).toBe(0);
  });
  it("times out unfinished preparation and releases partial resources", async () => {
    vi.useFakeTimers();
    try {
      fake.compile.mockImplementation(() => new Promise(() => {}));
      const pending = runtime().initialize();
      await vi.advanceTimersByTimeAsync(8001);
      await pending;
      expect(statuses.at(-1)?.reason).toContain("timed out");
      expect(fake.dispose).toHaveBeenCalledTimes(1);
      expect(world!.assets.size).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
  it("continues teardown when a scene disposer throws", async () => {
    const resource = { dispose: vi.fn() },
      module = moduleWith(resource);
    module.dispose = () => {
      throw new Error("Scene cleanup failed");
    };
    await runtime(module).initialize();
    expect(() => world!.dispose()).not.toThrow();
    expect(resource.dispose).toHaveBeenCalledTimes(1);
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(fake.lose).toHaveBeenCalledTimes(1);
    expect(ticker).toBeUndefined();
  });
  it("announces readiness only after the first useful render, then stops idle draws", async () => {
    const instance = runtime();
    await instance.initialize();
    expect(statuses).toEqual([]);
    ticker!(1);
    expect(statuses).toEqual([{ ready: true, tier: "high" }]);
    ticker!(2);
    expect(fake.render).toHaveBeenCalledTimes(1);
  });
  it("rejects duplicate scene owners and disposes resources/context once", async () => {
    const resource = { dispose: vi.fn() },
      module = moduleWith(resource),
      instance = runtime(module);
    expect(() => instance.register("test", moduleWith())).toThrow();
    await instance.initialize();
    instance.dispose();
    instance.dispose();
    expect(resource.dispose).toHaveBeenCalledTimes(1);
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(fake.lose).toHaveBeenCalledTimes(1);
    expect(module.dispose).toHaveBeenCalledTimes(1);
    expect(ticker).toBeUndefined();
  });
  it("cleans partial initialization when a scene mount fails", async () => {
    const resource = { dispose: vi.fn() },
      module = moduleWith(resource),
      mount = module.mount;
    module.mount = (context) => {
      mount(context);
      throw new Error("Mount failed");
    };
    await runtime(module).initialize();
    expect(resource.dispose).toHaveBeenCalledTimes(1);
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(statuses.at(-1)?.ready).toBe(false);
  });
  it("falls back cleanly if renderer creation fails", async () => {
    fake.failCreate = true;
    await runtime().initialize();
    expect(statuses.at(-1)?.reason).toContain("No GL");
    expect(ticker).toBeUndefined();
  });
  it("cancels asynchronous preparation and ignores late completion after route disposal", async () => {
    let resolve!: () => void;
    fake.compile.mockImplementation(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    const instance = runtime(),
      pending = instance.initialize();
    await flush();
    instance.dispose();
    resolve();
    await pending;
    expect(statuses).toEqual([]);
    expect(fake.render).not.toHaveBeenCalled();
    expect(instance.assets.size).toBe(0);
  });
  it("falls back on rejected preparation without leaving a renderer", async () => {
    fake.compile.mockRejectedValue(new Error("Compile rejected"));
    await runtime().initialize();
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(statuses.at(-1)?.ready).toBe(false);
  });
  it("suspends hidden/offscreen rendering and resumes with a fresh invalidation", async () => {
    await runtime().initialize();
    ticker!(1);
    doc.hidden = true;
    doc.dispatchEvent(new Event("visibilitychange"));
    world!.invalidate();
    ticker!(2);
    expect(fake.render).toHaveBeenCalledTimes(1);
    doc.hidden = false;
    doc.dispatchEvent(new Event("visibilitychange"));
    ticker!(3);
    expect(fake.render).toHaveBeenCalledTimes(2);
    intersectionCallback!([{ isIntersecting: false, target: host }]);
    world!.invalidate();
    ticker!(4);
    expect(fake.render).toHaveBeenCalledTimes(2);
    intersectionCallback!([{ isIntersecting: true, target: host }]);
    ticker!(5);
    expect(fake.render).toHaveBeenCalledTimes(3);
  });
  it("recovers from a zero-size slot without waiting for a new intersection", async () => {
    Object.defineProperty(host, "clientWidth", {
      value: 0,
      configurable: true,
    });
    await runtime().initialize();
    ticker!(1);
    expect(fake.render).not.toHaveBeenCalled();
    Object.defineProperty(host, "clientWidth", { value: 390 });
    resizeCallback!();
    ticker!(2);
    expect(fake.render).toHaveBeenCalledTimes(1);
  });
  it("restores one lost context and falls back on repeated loss", async () => {
    await runtime().initialize();
    ticker!(1);
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    ticker!(2);
    expect(fake.render).toHaveBeenCalledTimes(1);
    canvas.dispatchEvent(new Event("webglcontextrestored"));
    await flush();
    ticker!(3);
    expect(fake.render).toHaveBeenCalledTimes(2);
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(ticker).toBeUndefined();
  });
  it("does not let an obsolete compile rejection destroy the restored context", async () => {
    let reject!: (error: Error) => void;
    fake.compile.mockImplementationOnce(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail;
        }),
    );
    const pending = runtime().initialize();
    await flush();
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    canvas.dispatchEvent(new Event("webglcontextrestored"));
    await flush();
    ticker!(1);
    reject(new Error("Old compile"));
    await pending;
    expect(fake.dispose).not.toHaveBeenCalled();
    expect(statuses.at(-1)?.ready).toBe(true);
  });
});
