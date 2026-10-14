import * as THREE from "three/src/Three.js";
import { weboraOutline } from "./weboraW";

const FOLD = 0.3;
const FREQUENCY = 1.35;
const LEAN = 0.12;
/** The sculptural fold, z += f(x, y), and its x derivative (df/dy = LEAN). */
const fold = (x: number, y: number) =>
  Math.sin(x * FREQUENCY) * FOLD + y * LEAN;
const foldX = (x: number) => Math.cos(x * FREQUENCY) * FOLD * FREQUENCY;

/**
 * Bisect triangles until no edge exceeds `limit`. Extruded caps are
 * triangulated from the outline alone, so long slivers would facet the fold.
 */
function subdivide(source: THREE.BufferGeometry, limit: number) {
  const names = ["position", "normal", "uv"] as const;
  const input = names.map((name) => source.getAttribute(name));
  const output: number[][] = names.map(() => []);
  type Point = number[][];
  const vertex = (index: number): Point =>
    input.map((attribute) =>
      Array.from({ length: attribute.itemSize }, (_, k) =>
        attribute.getComponent(index, k),
      ),
    );
  const mix = (a: Point, b: Point): Point =>
    a.map((values, i) => values.map((value, k) => (value + b[i][k]) / 2));
  const span = (a: Point, b: Point) =>
    Math.hypot(a[0][0] - b[0][0], a[0][1] - b[0][1], a[0][2] - b[0][2]);
  const emit = (a: Point, b: Point, c: Point, depth: number): number => {
    const edges = [span(a, b), span(b, c), span(c, a)];
    const longest = Math.max(...edges);
    if (longest <= limit || depth > 10) {
      for (const point of [a, b, c])
        point.forEach((values, i) => output[i].push(...values));
      return 3;
    }
    // Bisect the longest edge only: keeps slivers well shaped and counts low.
    const [p, q, r] =
      longest === edges[0] ? [a, b, c] : longest === edges[1] ? [b, c, a] : [c, a, b];
    const middle = mix(p, q);
    return emit(p, middle, r, depth + 1) + emit(middle, q, r, depth + 1);
  };
  const geometry = new THREE.BufferGeometry();
  let start = 0;
  for (const group of source.groups) {
    let count = 0;
    for (let i = group.start; i < group.start + group.count; i += 3)
      count += emit(vertex(i), vertex(i + 1), vertex(i + 2), 0);
    geometry.addGroup(start, count, group.materialIndex ?? 0);
    start += count;
  }
  names.forEach((name, i) =>
    geometry.setAttribute(
      name,
      new THREE.Float32BufferAttribute(output[i], input[i].itemSize),
    ),
  );
  source.dispose();
  return geometry;
}

/** Continuous canonical W, with deep cambered strokes and polished bevels. */
export function createImpressionGeometry(bevelSegments: number) {
  const shape = new THREE.Shape(
    weboraOutline.map(([x, y]) => new THREE.Vector2(x, y)),
  );
  shape.closePath();
  const extruded = new THREE.ExtrudeGeometry(shape, {
    depth: 0.9,
    steps: 3,
    bevelEnabled: true,
    bevelSegments,
    bevelSize: 0.09,
    bevelThickness: 0.14,
  });
  extruded.translate(0, 0, -0.45);
  const geometry = subdivide(
    extruded,
    bevelSegments >= 6 ? 0.12 : bevelSegments >= 3 ? 0.18 : 0.26,
  );
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const vector = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i),
      y = position.getY(i);
    // A static sculptural fold: no per-frame vertex work or custom shader.
    position.setZ(i, position.getZ(i) + fold(x, y));
    // Normals follow the fold's inverse transpose, so faces read as continuous
    // curved metal while cap-to-bevel edges keep crisp, separate normals.
    const nz = normal.getZ(i);
    vector
      .set(normal.getX(i) - foldX(x) * nz, normal.getY(i) - LEAN * nz, nz)
      .normalize();
    normal.setXYZ(i, vector.x, vector.y, vector.z);
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
