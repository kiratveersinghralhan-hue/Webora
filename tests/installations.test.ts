import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three/src/Three.js";
import { InstallationScene } from "../src/three/scenes/InstallationScene";
import { StudioScene } from "../src/three/scenes/StudioScene";
import { AssetRegistry } from "../src/three/runtime/AssetRegistry";
import type { FrameState } from "../src/three/runtime/types";

const frame: FrameState = {
  time: 1,
  delta: 1 / 30,
  pointer: { nx: 0, ny: 0, active: false },
  scroll: 0,
};
afterEach(() => vi.restoreAllMocks());
function fixture() {
  vi.spyOn(THREE.TextureLoader.prototype, "load").mockImplementation(
    () => new THREE.Texture(),
  );
  const assets = new AssetRegistry();
  const root = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(35);
  return {
    assets,
    root,
    camera,
    tier: "balanced" as const,
    invalidate: vi.fn(),
  };
}
function settle(scene: InstallationScene) {
  let moving = true;
  for (let i = 0; i < 180 && moving; i++) moving = scene.update(frame);
  expect(moving).toBe(false);
}

describe("Checkpoint A modeled installations", () => {
  for (const kind of ["services", "process"] as const)
    it(`${kind}: bounded geometry, six distinct selections, full-turn framing and complete disposal`, () => {
      const context = fixture();
      const scene = new InstallationScene(kind);
      scene.mount(context);
      const resources = context.assets.size;
      const identity = scene.inspect().geometryId;
      const disposed = new Map<object, number>();
      scene.group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const geometry = object.geometry;
        geometry.computeBoundingBox();
        expect(
          [...geometry.getAttribute("position").array].every(Number.isFinite),
        ).toBe(true);
        expect(
          geometry.boundingBox!.getSize(new THREE.Vector3()).length(),
        ).toBeGreaterThan(0.01);
        for (const value of [
          geometry,
          ...(Array.isArray(object.material)
            ? object.material
            : [object.material]),
        ]) {
          if (disposed.has(value)) continue;
          disposed.set(value, 0);
          value.addEventListener("dispose", () =>
            disposed.set(value, disposed.get(value)! + 1),
          );
        }
      });
      const poses = [];
      for (let stage = 0; stage < 6; stage++) {
        scene.select(stage);
        scene.resize(620, 500);
        settle(scene);
        poses.push(
          scene.group.children
            .filter((c) => c instanceof THREE.Group)
            .map((p) => p.position.toArray()),
        );
        expect(scene.inspect().selected).toBe(stage);
        expect(context.assets.size).toBe(resources);
        expect(scene.inspect().geometryId).toBe(identity);
      }
      expect(new Set(poses.map((p) => JSON.stringify(p))).size).toBe(6);
      // Project actual mesh vertices at portrait, landscape and six inspection angles.
      let maxX = 0,
        maxY = 0;
      for (const [width, height] of [
        [346, 350],
        [1040, 500],
        [280, 290],
      ]) {
        context.camera.aspect = width / height;
        context.camera.updateProjectionMatrix();
        scene.resize(width, height);
        for (let turn = 0; turn < 6; turn++) {
          scene.turn();
          settle(scene);
          scene.group.updateMatrixWorld(true);
          context.camera.updateMatrixWorld(true);
          scene.group.traverse((object) => {
            if (
              !(object instanceof THREE.Mesh) ||
              object instanceof THREE.InstancedMesh
            )
              return;
            const vertices = object.geometry.getAttribute("position");
            for (let i = 0; i < vertices.count; i++) {
              const p = new THREE.Vector3()
                .fromBufferAttribute(vertices, i)
                .applyMatrix4(object.matrixWorld)
                .project(context.camera);
              maxX = Math.max(maxX, Math.abs(p.x));
              maxY = Math.max(maxY, Math.abs(p.y));
            }
          });
        }
      }
      expect(maxX).toBeLessThan(1);
      expect(maxY).toBeLessThan(1);
      scene.dispose();
      scene.dispose();
      expect(context.assets.size).toBe(0);
      expect(context.root.children).toHaveLength(0);
      expect([...disposed.values()].every((count) => count === 1)).toBe(true);
    });
  it("updates only the selected chapter and reuses both installations and the W", () => {
    const context = fixture();
    const studio = new StudioScene();
    studio.mount(context);
    studio.resize(800, 500);
    const hero = vi.spyOn(studio.core, "update");
    studio.select("services");
    studio.update(frame);
    expect(hero).not.toHaveBeenCalled();
    const servicesId = studio.inspect().geometryId;
    const serviceRoot = context.root.children.find((c) =>
      c.name.includes("responsive"),
    )!;
    studio.select("process");
    studio.update(frame);
    expect(hero).not.toHaveBeenCalled();
    expect(serviceRoot.visible).toBe(false);
    const count = context.assets.size;
    studio.select("services", 3);
    expect(studio.inspect().geometryId).toBe(servicesId);
    expect(context.assets.size).toBe(count);
    studio.select("hero");
    studio.update(frame);
    expect(hero).toHaveBeenCalledOnce();
    expect(serviceRoot.visible).toBe(false);
    studio.dispose();
    studio.dispose();
    expect(context.assets.size).toBe(0);
    expect(context.root.children).toHaveLength(0);
  });
});
