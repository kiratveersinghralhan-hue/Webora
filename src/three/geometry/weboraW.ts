import * as THREE from "three/src/Three.js";
/** Canonical original V1 silhouette, now owned independently of renderer code. */
export const weboraOutline: [number, number][] = [
  [-2, 1.6],
  [-1.25, -1.6],
  [-0.7, -1.6],
  [0, 0.1],
  [0.7, -1.6],
  [1.25, -1.6],
  [2, 1.6],
  [1.35, 1.6],
  [0.85, -0.5],
  [0.23, 1.1],
  [-0.23, 1.1],
  [-0.85, -0.5],
  [-1.35, 1.6],
];
export function createWeboraW(bevelSegments: number) {
  const shape = new THREE.Shape();
  weboraOutline.forEach(([x, y], index) =>
    index ? shape.lineTo(x, y) : shape.moveTo(x, y),
  );
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.85,
    bevelEnabled: true,
    bevelSegments,
    bevelSize: 0.095,
    bevelThickness: 0.12,
    steps: 1,
  });
  geometry.center();
  return geometry;
}
