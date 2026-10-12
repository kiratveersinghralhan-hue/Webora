import * as THREE from "three/src/Three.js";

/** Closed, chamfered silhouettes. Dimensions include a real front, rear and edge. */
export function slab(
  width: number,
  height: number,
  depth: number,
  radius = 0.12,
) {
  const x = -width / 2,
    y = -height / 2;
  const r = Math.min(radius, width / 4, height / 4);
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 4,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/** A bent load-bearing bracket, derived from the sloping strokes of the W. */
export function foldedBracket(width = 1) {
  const shape = new THREE.Shape();
  const points = [
    [-1.1, -1.4],
    [-0.55, 0.8],
    [0.25, 0.8],
    [0.9, -1.4],
    [0.5, -1.4],
    [0.02, 0.35],
    [-0.25, 0.35],
    [-0.7, -1.4],
  ];
  points.forEach(([x, y], i) =>
    i ? shape.lineTo(x * width, y) : shape.moveTo(x * width, y),
  );
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.38,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    bevelSegments: 2,
    curveSegments: 1,
  });
}

/** Six complementary solid billets form one chiseled, W-derived assembly. */
export function processBillet(index: number) {
  const shape = new THREE.Shape();
  const lean = index % 2 ? -0.23 : 0.23;
  shape.moveTo(-0.47, -1.35);
  shape.lineTo(0.35, -1.35);
  shape.lineTo(0.58 + lean, 0.9);
  shape.lineTo(0.15 + lean, 1.34);
  shape.lineTo(-0.38 + lean, 1.34);
  shape.lineTo(-0.62, -0.7);
  shape.closePath();
  // A deep machined aperture reveals the inner wall, rear rib and forged edges.
  const aperture = new THREE.Path();
  aperture.moveTo(-0.14, -0.69);
  aperture.lineTo(-0.06 + lean * 0.5, 0.34);
  aperture.lineTo(0.19 + lean * 0.5, 0.48);
  aperture.lineTo(0.12, -0.61);
  aperture.closePath();
  shape.holes.push(aperture);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelSize: 0.065,
    bevelThickness: 0.07,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 1,
  });
  geometry.translate(0, 0, -0.25);
  return geometry;
}
