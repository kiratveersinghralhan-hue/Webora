import * as THREE from "three/src/Three.js";

/**
 * Diwali Edition clay diya. A revolved profile, indexed without a seam so the
 * smooth normals stay continuous, then pinched into the classic teardrop
 * spout. Units: rim radius ~0.56, height ~0.28 (scaled by the scene).
 */
type Zone = "foot" | "outer" | "band" | "dots" | "rim" | "inner";
/** Bottom centre → foot → outer wall → rim → inner wall → inner centre. */
const PROFILE: [number, number, Zone][] = [
  [0, 0, "foot"],
  [0.21, 0, "foot"],
  [0.25, 0.018, "foot"],
  [0.33, 0.04, "outer"],
  [0.41, 0.075, "outer"],
  [0.47, 0.11, "outer"],
  [0.51, 0.145, "dots"],
  [0.535, 0.18, "outer"],
  [0.552, 0.215, "band"],
  [0.56, 0.24, "band"],
  [0.558, 0.262, "rim"],
  [0.54, 0.276, "rim"],
  [0.515, 0.272, "rim"],
  [0.495, 0.25, "inner"],
  [0.46, 0.2, "inner"],
  [0.4, 0.155, "inner"],
  [0.3, 0.122, "inner"],
  [0.16, 0.105, "inner"],
  [0, 0.1, "inner"],
];
const HEIGHT = 0.276;
export const DIYA_OIL_LEVEL = 0.19;

/** 0 away from the spout, 1 at its tip (spout faces +z). */
export const spoutWeight = (phi: number) =>
  Math.pow((1 + Math.cos(phi)) / 2, 7);
/** Plan-view teardrop with a slight hand-thrown irregularity. */
export const diyaRadiusScale = (phi: number) =>
  (1 + 0.62 * spoutWeight(phi)) *
  (1 + 0.012 * Math.sin(3 * phi + 1.3) + 0.008 * Math.sin(7 * phi + 0.4));
const lift = (phi: number, y: number) =>
  0.07 * spoutWeight(phi) * Math.max(0, y / HEIGHT) ** 2;

const palette = {
  foot: new THREE.Color(0x6b2c14),
  outer: new THREE.Color(0x8c3d1d),
  band: new THREE.Color(0xc58a2e),
  dots: new THREE.Color(0xe0b25a),
  rim: new THREE.Color(0xb2552a),
  inner: new THREE.Color(0x3a1408),
};

export function createDiyaGeometry(segments = 72) {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const rows = PROFILE.length;
  const colour = new THREE.Color();
  for (let i = 0; i < segments; i++) {
    const phi = (i / segments) * Math.PI * 2;
    const scale = diyaRadiusScale(phi);
    for (const [r, y, zone] of PROFILE) {
      positions.push(
        Math.sin(phi) * r * scale,
        y + lift(phi, y),
        Math.cos(phi) * r * scale,
      );
      colour.copy(palette[zone === "dots" ? "outer" : zone]);
      // Hand-painted dots around the belly; soot darkens the spout interior.
      if (zone === "dots" && Math.cos(phi * 14) > 0.55)
        colour.copy(palette.dots);
      if (zone === "inner")
        colour.lerp(palette.foot, 0.3 * (1 - spoutWeight(phi)));
      colours(colors, colour);
    }
  }
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    for (let j = 0; j < rows - 1; j++) {
      const a = j + i * rows,
        b = j + next * rows,
        c = j + 1 + next * rows,
        d = j + 1 + i * rows;
      indices.push(a, b, d, c, d, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
function colours(target: number[], colour: THREE.Color) {
  target.push(colour.r, colour.g, colour.b);
}

/** Pooled ghee surface, following the same teardrop plan. */
export function createDiyaOilGeometry(segments = 72) {
  const radius = 0.47;
  const positions = [0, DIYA_OIL_LEVEL, 0];
  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const phi = (i / segments) * Math.PI * 2;
    const r = radius * diyaRadiusScale(phi) * (1 - 0.06 * spoutWeight(phi));
    positions.push(
      Math.sin(phi) * r,
      DIYA_OIL_LEVEL + lift(phi, DIYA_OIL_LEVEL),
      Math.cos(phi) * r,
    );
    indices.push(0, 1 + i, 1 + ((i + 1) % segments));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Where the cotton wick rests and where its flame stands. */
export function diyaWick() {
  const tipRadius = 0.5 * diyaRadiusScale(0);
  return {
    base: new THREE.Vector3(0, DIYA_OIL_LEVEL + 0.01, tipRadius * 0.8),
    tip: new THREE.Vector3(0, DIYA_OIL_LEVEL + 0.13, tipRadius * 0.97),
  };
}

/** Teardrop flame, base at the origin, pointing up. */
export function createFlameGeometry(height = 0.36, width = 0.078) {
  const points: THREE.Vector2[] = [];
  for (let k = 0; k <= 18; k++) {
    const t = k / 18;
    points.push(
      new THREE.Vector2(
        width * Math.sin(Math.PI * Math.pow(t, 0.62)) + (k === 18 ? 0 : 1e-4),
        t * height,
      ),
    );
  }
  return new THREE.LatheGeometry(points, 24);
}
