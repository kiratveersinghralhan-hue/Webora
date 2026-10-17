import * as THREE from "three/src/Three.js";
import {
  createDiyaGeometry,
  createDiyaOilGeometry,
  createFlameGeometry,
  diyaWick,
} from "../geometry/diyaGeometry";
import type { QualityTier } from "../runtime/QualityPolicy";

/** Placement on the sculpture's floor: x, z, yaw (spout toward the viewer). */
const LAYOUT: [number, number, number][] = [
  [-2.25, 0.55, 0.55],
  [-1.15, 1.3, 0.28],
  [0, 1.65, 0],
  [1.15, 1.3, -0.28],
  [2.25, 0.55, -0.55],
];
const FLOOR = -1.95;
const SCALE = 0.62;
/** Flames keep asking for frames this long after the last reason to move. */
export const FLICKER_WINDOW = 8000;

interface Lamp {
  flame: THREE.Group;
  glow?: THREE.Sprite;
  seed: number;
  lit: number;
}

/**
 * Diwali Edition: five clay diyas lit around the W. Ordinary materials only,
 * so shader recovery is never needed. Flames animate on rendered frames and
 * only request frames during a bounded window, so an idle hero stops drawing.
 */
export class DiyaLights {
  readonly group = new THREE.Group();
  private lamps: Lamp[] = [];
  private awakeUntil = -Infinity;
  private pointerX = 0;
  private pointerY = 0;

  constructor(
    own: <T extends { dispose(): void }>(resource: T) => T,
    tier: QualityTier,
  ) {
    this.group.name = "Webora / Diwali / clay diyas";
    const segments = tier === "high" ? 96 : tier === "balanced" ? 72 : 48;
    const clay = own(createDiyaGeometry(segments));
    const oil = own(createDiyaOilGeometry(segments));
    const flameShape = own(createFlameGeometry());
    const coreShape = own(createFlameGeometry(0.2, 0.04));
    const wickShape = own(new THREE.CylinderGeometry(0.018, 0.026, 1, 8));
    // Fired clay: matte, warm, with vertex-painted ochre bands and dots.
    const clayMaterial = own(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.88,
        metalness: 0,
        envMapIntensity: 0.55,
      }),
    );
    const oilMaterial = own(
      new THREE.MeshStandardMaterial({
        color: 0x4a2408,
        emissive: 0x3a1602,
        roughness: 0.1,
        metalness: 0.1,
        envMapIntensity: 1.2,
      }),
    );
    const wickMaterial = own(
      new THREE.MeshStandardMaterial({ color: 0xe9dcc0, roughness: 1 }),
    );
    const additive = (color: number, opacity: number) =>
      own(
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
      );
    const outer = additive(0xff7a1f, 0.62);
    const inner = additive(0xfff0c2, 0.95);
    const glowTexture = this.glowTexture(own);
    const glowMaterial = glowTexture
      ? own(
          new THREE.SpriteMaterial({
            map: glowTexture,
            color: 0xffa64a,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          }),
        )
      : undefined;
    const pool = glowTexture
      ? own(
          new THREE.MeshBasicMaterial({
            map: glowTexture,
            color: 0xff9a3c,
            transparent: true,
            opacity: 0.32,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          }),
        )
      : undefined;
    const poolShape = pool ? own(new THREE.PlaneGeometry(1.6, 1.6)) : undefined;
    const { base, tip } = diyaWick();
    LAYOUT.forEach(([x, z, yaw], index) => {
      const diya = new THREE.Group();
      diya.position.set(x, FLOOR, z);
      diya.rotation.y = yaw;
      diya.scale.setScalar(SCALE);
      diya.add(
        new THREE.Mesh(clay, clayMaterial),
        new THREE.Mesh(oil, oilMaterial),
      );
      const wick = new THREE.Mesh(wickShape, wickMaterial);
      wick.position.copy(base).lerp(tip, 0.5);
      wick.scale.y = base.distanceTo(tip);
      wick.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        tip.clone().sub(base).normalize(),
      );
      const flame = new THREE.Group();
      flame.position.copy(tip).add(new THREE.Vector3(0, -0.02, 0));
      const core = new THREE.Mesh(coreShape, inner);
      core.position.y = 0.012;
      flame.add(new THREE.Mesh(flameShape, outer), core);
      let glow: THREE.Sprite | undefined;
      if (glowMaterial) {
        glow = new THREE.Sprite(glowMaterial);
        glow.position.copy(tip).add(new THREE.Vector3(0, 0.14, 0));
        diya.add(glow);
      }
      if (pool && poolShape) {
        const light = new THREE.Mesh(poolShape, pool);
        light.rotation.x = -Math.PI / 2;
        light.position.set(0, 0.004, 0.2);
        diya.add(light);
      }
      diya.add(wick, flame);
      this.group.add(diya);
      this.lamps.push({ flame, glow, seed: index * 1.7 + 0.4, lit: 1 });
    });
    // No point light: on the mirror-polished W it reads as a blown highlight.
    // Emissive oil, glow sprites and the floor pools carry the lamplight.
    this.pose(0, 1);
  }
  private glowTexture(own: <T extends { dispose(): void }>(r: T) => T) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const paint = canvas.getContext("2d");
    if (!paint) return undefined;
    const gradient = paint.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,200,130,0.55)");
    gradient.addColorStop(0.3, "rgba(255,140,50,0.2)");
    gradient.addColorStop(1, "rgba(255,120,40,0)");
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, 64, 64);
    const texture = own(new THREE.CanvasTexture(canvas));
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  /**
   * `ignition` 0..1 lights the lamps one after another across the opening
   * revolution; 1 means every flame is lit. Returns whether flames still want
   * frames (the bounded flicker window).
   */
  update(
    now: number,
    ignition: number,
    wake: boolean,
    pointer?: { nx: number; ny: number; active: boolean },
  ) {
    if (wake) this.awakeUntil = Math.max(this.awakeUntil, now + FLICKER_WINDOW);
    if (
      pointer?.active &&
      (pointer.nx !== this.pointerX || pointer.ny !== this.pointerY)
    ) {
      this.pointerX = pointer.nx;
      this.pointerY = pointer.ny;
      this.awakeUntil = Math.max(this.awakeUntil, now + FLICKER_WINDOW / 2);
    }
    const awake = now < this.awakeUntil;
    this.pose(awake ? now / 1000 : 0, ignition, awake);
    return awake;
  }
  /** A lit flame at rest is the final frame once the window closes. */
  private pose(seconds: number, ignition: number, moving = false) {
    this.lamps.forEach((lamp, index) => {
      const start = 0.12 + index * 0.13;
      const t = THREE.MathUtils.clamp((ignition - start) / 0.16, 0, 1);
      // Ease-out with a slight overshoot: a wick catching, then steadying.
      lamp.lit = t === 1 ? 1 : 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
      const s = lamp.seed;
      const flicker = moving
        ? 0.5 * Math.sin(seconds * 11.3 + s) +
          0.3 * Math.sin(seconds * 17.9 + s * 2) +
          0.2 * Math.sin(seconds * 5.1 + s * 3)
        : 0;
      const lit = Math.max(0, lamp.lit);
      lamp.flame.visible = lit > 0.01;
      lamp.flame.scale.set(
        lit * (1 - 0.05 * flicker),
        lit * (1 + 0.1 * flicker),
        lit * (1 - 0.05 * flicker),
      );
      lamp.flame.rotation.z = moving
        ? 0.06 * Math.sin(seconds * 3.7 + s) + 0.03 * flicker
        : 0;
      lamp.flame.rotation.x = moving ? 0.04 * Math.sin(seconds * 2.9 + s) : 0;
      if (lamp.glow) {
        lamp.glow.visible = lit > 0.01;
        lamp.glow.scale.setScalar(1.05 * lit * (1 + 0.06 * flicker));
      }
    });
  }
}
