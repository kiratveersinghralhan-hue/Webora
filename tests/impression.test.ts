import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three/src/Three.js";
import { ImpressionScene } from "../src/three/scenes/ImpressionScene";
import { IntroDirector } from "../src/three/runtime/IntroDirector";
import { AssetRegistry } from "../src/three/runtime/AssetRegistry";

const request = (d: IntroDirector, mobile = false) =>
  d.request(100, {
    seen: false,
    reduced: false,
    eligible: true,
    replay: false,
    mobile,
  });
afterEach(() => vi.unstubAllGlobals());

describe("V3.2 finite sculpture revolution", () => {
  it("settles once when the watchdog precedes a late final frame", () => {
    const d = new IntroDirector("revolution");
    request(d);
    d.ready(500, false);
    d.sample(500 + d.duration * 0.9);
    expect(d.phase).toBe("handoff");
    expect(d.sample(d.deadlineAt + 100)).toBe(1);
    expect(d.reason).toBe("complete");
    d.finish("deadline");
    d.finish("suspended");
    expect(d.reason).toBe("complete");
    expect(d.phase).toBe("settled");
  });
  it("gives a slow first frame the full playback duration, even on low-tier hardware", () => {
    for (const mobile of [false, true]) {
      const d = new IntroDirector("revolution");
      request(d, mobile);
      expect(d.sample(6000)).toBe(0);
      d.ready(7000, true);
      expect(d.phase).toBe("playing");
      expect(d.duration).toBe(mobile ? 4600 : 5200);
      expect(d.sample(7000 + d.duration / 2)).toBeCloseTo(0.5);
      expect(d.sample(7000 + d.duration)).toBe(1);
      expect(d.reason).toBe("complete");
    }
  });
  it("bounds failed preparation and cannot reopen after dismissal", () => {
    const timeout = new IntroDirector("revolution");
    request(timeout);
    timeout.ready(9500, false);
    expect(timeout.reason).toBe("preparation-timeout");
    for (const reason of ["skip", "intent", "unavailable", "reduced-motion"]) {
      const d = new IntroDirector("revolution");
      request(d);
      d.finish(reason);
      d.ready(500, false);
      expect(d.phase).toBe("settled");
      expect(d.sample(500)).toBe(1);
    }
  });
  it("shows front, both edges and back on the same mesh, finishes in the exact hero pose, then stops", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    vi.stubGlobal("document", {
      createElement: () => ({ getContext: () => null }),
    });
    const scene = new ImpressionScene(),
      d = new IntroDirector("revolution");
    const assets = new AssetRegistry(),
      camera = new THREE.PerspectiveCamera(35);
    scene.setDirector(d);
    scene.mount({
      root: new THREE.Group(),
      camera,
      assets,
      tier: "low",
      invalidate() {},
    });
    scene.resize(600, 500);
    const mesh = scene.group.children[0] as THREE.Mesh;
    const originalMesh = mesh.uuid,
      geometry = mesh.geometry.uuid,
      leases = assets.size;
    const frame = (now: number) =>
      scene.update({
        time: now / 1000,
        now,
        delta: 1 / 60,
        pointer: { nx: 0, ny: 0, active: false },
        scroll: 0,
      });
    request(d);
    frame(100);
    const initial = mesh.quaternion.clone(),
      cameraStart = camera.position.clone();
    d.ready(500, false);
    const samples: { angle: number; front: number }[] = [];
    for (let i = 0; i <= 312; i++) {
      frame(500 + (i * d.duration) / 312);
      samples.push({
        angle: scene.inspect().introTurn,
        front: new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.quaternion).z,
      });
    }
    expect(samples[0].angle).toBe(0);
    expect(samples.at(-1)!.angle).toBeCloseTo(Math.PI * 2);
    expect(samples.every((s, i) => !i || s.angle >= samples[i - 1].angle)).toBe(
      true,
    );
    expect(Math.min(...samples.map((s) => s.front))).toBeLessThan(-0.95);
    expect(
      samples.filter((s) => Math.abs(s.front) < 0.15).length,
    ).toBeGreaterThan(8);
    // The camera never orbits with the mesh; the final handoff only dollies in.
    expect(camera.position.x).toBe(cameraStart.x);
    expect(camera.position.y).toBe(cameraStart.y);
    expect(camera.position.z).toBeCloseTo(cameraStart.z / 1.22);
    expect(Math.abs(initial.dot(mesh.quaternion))).toBeCloseTo(1, 10);
    expect(frame(20000)).toBe(false);
    const settled = mesh.quaternion.clone();
    expect(frame(25000)).toBe(false);
    expect(mesh.quaternion.toArray()).toEqual(settled.toArray());
    expect(mesh.uuid).toBe(originalMesh);
    expect(mesh.geometry.uuid).toBe(geometry);
    expect(assets.size).toBe(leases);
    scene.dispose();
    expect(assets.size).toBe(0);
  });
  it("allows full manual turns, accumulates rapid quarter-turn controls and resets without spinning forever", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    vi.stubGlobal("document", {
      createElement: () => ({ getContext: () => null }),
    });
    const scene = new ImpressionScene(),
      assets = new AssetRegistry();
    scene.mount({
      root: new THREE.Group(),
      camera: new THREE.PerspectiveCamera(35),
      assets,
      tier: "low",
      invalidate() {},
    });
    scene.resize(600, 500);
    scene.startDrag();
    scene.drag(1500, 0, 100);
    scene.endDrag(true);
    expect(scene.yaw).toBeGreaterThan(2 * Math.PI);
    const before = scene.yaw;
    for (let i = 0; i < 4; i++) scene.turn(Math.PI / 2);
    const frame = (i: number) =>
      scene.update({
        time: i / 60,
        now: (i * 1000) / 60,
        delta: 1 / 60,
        pointer: { nx: 0, ny: 0, active: false },
        scroll: 0,
      });
    for (let i = 0; i < 180; i++) frame(i);
    expect(scene.yaw - before).toBeCloseTo(2 * Math.PI, 8);
    scene.turn(0);
    for (let i = 180; i < 360; i++) frame(i);
    expect(Math.cos(scene.yaw)).toBeCloseTo(1, 8);
    expect(frame(400)).toBe(false);
    scene.dispose();
    expect(assets.size).toBe(0);
  });
});
