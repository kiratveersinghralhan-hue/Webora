import * as THREE from "three/src/Three.js";
import { weboraOutline } from "./weboraW";

/** Continuous canonical W, with deep cambered strokes and polished bevels. */
export function createImpressionGeometry(bevelSegments: number) {
  const shape = new THREE.Shape(
    weboraOutline.map(([x, y]) => new THREE.Vector2(x, y)),
  );
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.9,
    steps: 3,
    bevelEnabled: true,
    bevelSegments,
    bevelSize: 0.09,
    bevelThickness: 0.14,
  });
  geometry.translate(0, 0, -0.45);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i),
      y = position.getY(i),
      z = position.getZ(i);
    // A static sculptural fold: no per-frame vertex work or custom shader.
    position.setZ(i, z + Math.sin(x * 1.35) * 0.3 + y * 0.12);
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
