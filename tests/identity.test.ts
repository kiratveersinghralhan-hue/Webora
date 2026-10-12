import { describe, expect, it } from "vitest";
import * as THREE from "three/src/Three.js";
import { IntroDirector } from "../src/three/runtime/IntroDirector";
import { StudioAlloy } from "../src/three/materials/studioAlloy";
import {
  createIdentityGeometry,
  assembleIdentity,
} from "../src/three/geometry/identityGeometry";
import { CoreScene } from "../src/three/scenes/CoreScene";
import { AssetRegistry } from "../src/three/runtime/AssetRegistry";

const request = (director: IntroDirector, replay = false, mobile = false) =>
  director.request(0, {
    seen: false,
    reduced: false,
    eligible: true,
    replay,
    mobile,
  });
describe("readiness-driven identity timeline", () => {
  it("waits for a useful frame, samples the same timeline through handoff and respects the request deadline", () => {
    const d = new IntroDirector();
    request(d);
    expect(d.sample(300)).toBe(0);
    expect(d.phase).toBe("preparing");
    d.ready(400, false);
    expect(d.phase).toBe("playing");
    expect(d.duration).toBe(2200);
    expect(d.sample(400)).toBe(0);
    expect(d.sample(2050)).toBe(0.75);
    expect(d.phase).toBe("handoff");
    expect(d.sample(2600)).toBe(1);
    expect(d.reason).toBe("complete");
  });
  it("skips late preparation and low capability, while explicit local replay can inspect low-tier assembly", () => {
    const late = new IntroDirector();
    request(late);
    late.ready(2100, false);
    expect(late.reason).toBe("late-readiness");
    const low = new IntroDirector();
    request(low);
    low.ready(400, true);
    expect(low.reason).toBe("low-tier");
    const replay = new IntroDirector();
    request(replay, true, true);
    replay.ready(400, true);
    expect(replay.duration).toBe(1400);
    expect(replay.phase).toBe("playing");
  });
  it("never reopens after skip or failure and caps delayed playback to the remaining deadline", () => {
    const d = new IntroDirector();
    request(d);
    d.finish("skip");
    d.ready(200, false);
    expect(d.phase).toBe("settled");
    request(d, true);
    expect(d.phase).toBe("settled");
    const delayed = new IntroDirector();
    request(delayed);
    delayed.ready(1600, false);
    expect(delayed.duration).toBe(1250);
    delayed.sample(3000);
    expect(delayed.reason).toBe("deadline");
  });
  it("preserves the pending request across StrictMode effect rehearsal", () => {
    const d = new IntroDirector();
    request(d);
    d.request(10, {
      seen: true,
      reduced: false,
      eligible: true,
      replay: false,
      mobile: false,
    });
    expect(d.phase).toBe("preparing");
    expect(d.requestedAt).toBe(0);
    d.ready(200, false);
    expect(d.phase).toBe("playing");
  });
  it("does not request playback for reduced motion, deep links, or the same session", () => {
    for (const change of [
      { reduced: true },
      { eligible: false },
      { seen: true },
    ]) {
      const d = new IntroDirector();
      d.request(0, {
        seen: false,
        reduced: false,
        eligible: true,
        replay: false,
        mobile: false,
        ...change,
      });
      expect(d.phase).toBe("settled");
    }
  });
});
describe("continuous geometry and finite alloy", () => {
  it("restores exact positions/normals on the same geometry after finite assembly", () => {
    const geometry = createIdentityGeometry(4);
    const original = new Float32Array(geometry.getAttribute("position").array);
    const originalNormals = new Float32Array(
      geometry.getAttribute("normal").array,
    );
    assembleIdentity(geometry, 0.2);
    expect(geometry.getAttribute("position").array).not.toEqual(original);
    for (const value of geometry.getAttribute("normal").array)
      expect(Number.isFinite(value)).toBe(true);
    assembleIdentity(geometry, 1);
    expect(geometry.getAttribute("position").array).toEqual(original);
    expect(geometry.getAttribute("normal").array).toEqual(originalNormals);
    geometry.dispose();
  });
  it("keeps the same W object and geometry from preparation through hero and allows more than one full turn", () => {
    const assets = new AssetRegistry(),
      core = new CoreScene(),
      d = new IntroDirector();
    request(d, true);
    core.setDirector(d);
    core.mount({
      root: new THREE.Group(),
      camera: new THREE.PerspectiveCamera(),
      assets,
      tier: "low",
      invalidate() {},
    });
    core.resize(720, 620);
    const mesh = core.group.children[0] as THREE.Mesh,
      id = mesh.uuid,
      geo = mesh.geometry.uuid;
    const frame = (now: number) =>
      core.update({
        time: now / 1000,
        now,
        delta: 1 / 60,
        pointer: { nx: 0, ny: 0, active: false },
        scroll: 0,
      });
    frame(0);
    d.ready(100, false);
    frame(500);
    frame(2300);
    expect(core.group.children[0].uuid).toBe(id);
    expect((core.group.children[0] as THREE.Mesh).geometry.uuid).toBe(geo);
    core.startDrag();
    for (let i = 0; i < 4; i++) core.drag(300, 0, 100);
    core.endDrag(true);
    expect(core.yaw).toBeGreaterThan(Math.PI * 2);
    expect(frame(5000)).toBe(false);
    core.dispose();
    expect(assets.size).toBe(0);
  });
  it("updates stable uniforms only during a finite pulse and switches permanently to ordinary alloy", () => {
    const alloy = new StudioAlloy("balanced"),
      material = alloy.material;
    alloy.update(0, 0.016, 0, 0, false);
    expect(alloy.update(100, 0.016, 0.2, 0, false)).toBe(true);
    expect(alloy.update(800, 0.016, 0.2, 0, false)).toBe(false);
    const time = alloy.uniforms.weboraTime.value;
    alloy.update(1000, 0.016, 0.2, 0, false);
    expect(alloy.uniforms.weboraTime.value).toBe(time);
    expect(alloy.fallback()).toBe(true);
    expect(alloy.fallback()).toBe(false);
    expect(alloy.material).toBe(material);
    expect(alloy.update(1100, 0.016, 1, 1, true)).toBe(false);
    expect(material.customProgramCacheKey()).toContain("ordinary");
    material.dispose();
  });
  it("uses ordinary opaque alloy without custom flow on low capability", () => {
    const alloy = new StudioAlloy("low");
    expect(alloy.update(0, 0.016, 1, 1, true)).toBe(false);
    expect(alloy.fallback()).toBe(false);
    expect(alloy.material.transparent).toBe(false);
    alloy.material.dispose();
  });
});
