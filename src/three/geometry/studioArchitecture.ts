import * as THREE from "three/src/Three.js";

/** A section of the W's sloping outer stroke, opened into a folded studio wall. */
export function createStudioFold(bevelSegments: number) {
  const shape = new THREE.Shape();
  // A single folded aperture, with the W's sloping strokes carried through its
  // jambs and roof. Closed solid ribbon rather than disconnected prop meshes.
  shape.moveTo(-3.4, -2.2);
  shape.lineTo(-2.3, 2.05);
  shape.lineTo(2.75, 2.7);
  shape.lineTo(3.4, -2.2);
  shape.lineTo(2.96, -2.2);
  shape.lineTo(2.38, 2.25);
  shape.lineTo(-1.95, 1.66);
  shape.lineTo(-2.96, -2.2);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelSize: 0.045,
    bevelThickness: 0.055,
    bevelSegments,
    steps: 1,
  });
  return geometry;
}

/** Folded display landscape. The four slopes echo the W, with real depth. */
export function createStudioDais() {
  const shape = new THREE.Shape();
  shape.moveTo(-3.35, 0.12);
  shape.lineTo(-2.55, -0.05);
  shape.lineTo(-0.15, 0.12);
  shape.lineTo(1.45, -0.07);
  shape.lineTo(3.35, 0.12);
  shape.lineTo(3.35, -0.1);
  shape.lineTo(-3.35, -0.1);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 3.3,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 1,
    steps: 1,
  });
  geometry.translate(0, 0, -2.6);
  return geometry;
}
