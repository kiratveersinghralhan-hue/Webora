import * as THREE from "three/src/Three.js";
/** Cylindrical, UV-preserving surface. Same bend on face, rear and edge shell. */
export function curvedScreen(
  width: number,
  height: number,
  depth: number,
  solid = false,
) {
  const geometry = solid
    ? new THREE.BoxGeometry(width, height, depth, 40, 1, 1)
    : new THREE.PlaneGeometry(width, height, 40, 1);
  const p = geometry.getAttribute("position"),
    radius = 10;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getZ(i),
      angle = x / radius;
    p.setXYZ(
      i,
      (radius + z) * Math.sin(angle),
      p.getY(i),
      (radius + z) * Math.cos(angle) - radius,
    );
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
