import { expect, it } from "vitest";
import { GalleryController } from "../src/lib/galleryController";
import { curvedScreen } from "../src/three/geometry/curvedScreen";

it("settles to the same selection at different frame rates without overshooting bounds", () => {
  for (const fps of [15, 30, 60, 120]) {
    const controller = new GalleryController(4);
    controller.select(3);
    for (let i = 0; i < fps * 8; i++) {
      controller.update(1 / fps);
      expect(controller.position).toBeGreaterThanOrEqual(0);
      expect(controller.position).toBeLessThanOrEqual(3);
    }
    expect(controller.position).toBe(3);
    expect(controller.update(1 / fps)).toBe(false);
    controller.select(-20);
    for (let i = 0; i < fps * 8; i++) controller.update(1 / fps);
    expect(controller.position).toBe(0);
  }
});
it("takes direct drag input, projects release velocity and cancels safely", () => {
  const controller = new GalleryController(4);
  controller.start();
  controller.drag(0.8, 100);
  expect(controller.position).toBe(0.8);
  controller.end(false);
  expect(controller.target).toBe(2);
  for (let i = 0; i < 300; i++) controller.update(1 / 60);
  expect(controller.position).toBe(2);
  controller.start();
  controller.drag(-0.8, 20);
  controller.end(true);
  expect(controller.target).toBe(1);
  expect(controller.velocity).toBe(0);
});
it("models actual curvature and a closed shell with finite normals and UVs", () => {
  for (const solid of [false, true]) {
    const geometry = curvedScreen(6, 4, 0.22, solid);
    const p = geometry.getAttribute("position");
    let near = -Infinity,
      far = Infinity;
    for (let i = 0; i < p.count; i++) {
      near = Math.max(near, p.getZ(i));
      far = Math.min(far, p.getZ(i));
    }
    expect(near - far).toBeGreaterThan(0.4);
    for (const key of ["position", "normal", "uv"])
      expect([...geometry.getAttribute(key).array].every(Number.isFinite)).toBe(
        true,
      );
    geometry.dispose();
  }
});
