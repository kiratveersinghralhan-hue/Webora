import * as THREE from "three/src/Three.js";
import { weboraOutline } from "./weboraW";

// Four forged strokes partition the canonical W. These same surfaces assemble and remain in the hero.
const p = weboraOutline;
export const identityPanels: [number, number][][] = [
  [p[0], p[1], p[2], p[11], p[12]],
  [p[2], p[3], [0, 1.1], p[10], p[11]],
  [p[3], p[4], p[8], p[9], [0, 1.1]],
  [p[4], p[5], p[6], p[7], p[8]],
];
export function createIdentityGeometry(bevel: number, rear = false) {
  const position: number[] = [],
    normal: number[] = [],
    uv: number[] = [],
    panel: number[] = [];
  const geometry = new THREE.BufferGeometry();
  identityPanels.forEach((points, index) => {
    const center = points
      .reduce(
        (sum, [x, y]) => sum.add(new THREE.Vector2(x, y)),
        new THREE.Vector2(),
      )
      .divideScalar(points.length);
    const shape = new THREE.Shape(
      points.map(([x, y]) =>
        new THREE.Vector2(x, y).sub(center).multiplyScalar(0.945).add(center),
      ),
    );
    const part = new THREE.ExtrudeGeometry(shape, {
      depth: rear ? 0.045 : 0.82,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: Math.max(2, bevel),
      bevelSize: rear ? 0.025 : 0.055,
      bevelThickness: rear ? 0.025 : 0.13,
    });
    part.translate(0, 0, rear ? -0.62 : -0.41);
    const offset = position.length / 3;
    position.push(...part.getAttribute("position").array);
    normal.push(...part.getAttribute("normal").array);
    uv.push(...part.getAttribute("uv").array);
    panel.push(...Array(part.getAttribute("position").count).fill(index));
    for (const group of part.groups)
      geometry.addGroup(
        offset + group.start,
        group.count,
        rear ? 0 : group.materialIndex,
      );
    part.dispose();
  });
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(position, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normal, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setAttribute("panel", new THREE.Float32BufferAttribute(panel, 1));
  geometry.userData.restPosition = new Float32Array(position);
  geometry.userData.restNormal = new Float32Array(normal);
  geometry.computeBoundingSphere();
  return geometry;
}

const rotation = new THREE.Euler(),
  quaternion = new THREE.Quaternion(),
  point = new THREE.Vector3();
/** CPU transforms are finite intro work; no shader variant is needed on low-power hardware. */
export function assembleIdentity(
  geometry: THREE.BufferGeometry,
  progress: number,
) {
  const positions = geometry.getAttribute("position"),
    normals = geometry.getAttribute("normal"),
    panels = geometry.getAttribute("panel");
  const rest = geometry.userData.restPosition as Float32Array,
    restNormal = geometry.userData.restNormal as Float32Array;
  if (progress >= 1) {
    (positions.array as Float32Array).set(rest);
    (normals.array as Float32Array).set(restNormal);
  } else {
    for (let panel = 0; panel < 4; panel++) {
      const t = THREE.MathUtils.smoothstep(
        progress,
        0.1 + panel * 0.035,
        0.66 + panel * 0.025,
      );
      const travel = 1 - t,
        sign = panel < 2 ? -1 : 1;
      rotation.set(
        travel * (0.58 - panel * 0.22),
        sign * travel * 1.1,
        sign * travel * 0.38,
      );
      quaternion.setFromEuler(rotation);
      for (let i = 0; i < positions.count; i++) {
        if (panels.getX(i) !== panel) continue;
        point.fromArray(rest, i * 3).applyQuaternion(quaternion);
        point.x += sign * travel * (1.2 + Math.sin(t * Math.PI) * 0.25);
        point.y += travel * (panel % 2 ? -0.62 : 0.62);
        point.z -= travel * (1.1 + panel * 0.4);
        positions.setXYZ(i, point.x, point.y, point.z);
        point.fromArray(restNormal, i * 3).applyQuaternion(quaternion);
        normals.setXYZ(i, point.x, point.y, point.z);
      }
    }
  }
  positions.needsUpdate = normals.needsUpdate = true;
}
