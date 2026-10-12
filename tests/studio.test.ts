import { describe, expect, it } from "vitest";
import * as THREE from "three/src/Three.js";
import { CoreScene } from "../src/three/scenes/CoreScene";
import { AssetRegistry } from "../src/three/runtime/AssetRegistry";

describe("living studio ownership", () => {
  it("keeps the architectural setting fixed through full turns and releases every lease", () => {
    const assets = new AssetRegistry();
    const root = new THREE.Group();
    const core = new CoreScene(true);
    core.mount({
      root,
      camera: new THREE.PerspectiveCamera(35),
      assets,
      tier: "balanced",
      invalidate() {},
    });
    core.resize(900, 490);
    const identity = core.inspect();
    const initial = assets.size;
    expect(identity.materials).toBe(5);
    expect(root.children).toHaveLength(2);
    const setting = root.children.find((child) => child !== core.group)!;
    const before = setting.children.map((child) => child.position.toArray());
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const positions = object.geometry.getAttribute("position").array;
      expect([...positions].every(Number.isFinite)).toBe(true);
    });
    core.startDrag();
    core.drag(2400, 0, 180);
    core.endDrag(true);
    core.update({
      time: 2,
      now: 2000,
      delta: 1 / 60,
      pointer: { nx: 0, ny: 0, active: false },
      scroll: 0,
    });
    expect(core.yaw).toBeGreaterThan(2 * Math.PI);
    expect(setting.children.map((child) => child.position.toArray())).toEqual(
      before,
    );
    expect(core.inspect().geometryId).toBe(identity.geometryId);
    expect(assets.size).toBe(initial);
    core.quality("low");
    expect(assets.size).toBe(initial);
    core.dispose();
    core.dispose();
    expect(assets.size).toBe(0);
    expect(root.children).toHaveLength(0);
  });
});
