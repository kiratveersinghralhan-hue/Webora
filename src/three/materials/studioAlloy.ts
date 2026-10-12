import * as THREE from "three/src/Three.js";
import type { QualityTier } from "../runtime/QualityPolicy";

/** Original opaque alloy. The normal/roughness patch preserves every silhouette vertex. */
export class StudioAlloy {
  readonly material: THREE.MeshStandardMaterial;
  readonly uniforms = {
    weboraTime: { value: 0 },
    weboraFlow: { value: 0 },
    weboraPointer: { value: new THREE.Vector2() },
  };
  private patched: boolean;
  private until = 0;
  private lastX = NaN;
  private lastY = NaN;
  constructor(readonly tier: QualityTier) {
    this.patched = tier !== "low";
    const parameters = {
      color: 0x8b95ab,
      metalness: 0.94,
      roughness: 0.27,
      envMapIntensity: 1.55,
    };
    this.material =
      tier === "high"
        ? new THREE.MeshPhysicalMaterial({
            ...parameters,
            clearcoat: 0.35,
            clearcoatRoughness: 0.24,
          })
        : new THREE.MeshStandardMaterial(parameters);
    this.material.name = "Webora / graphite liquid alloy";
    this.material.customProgramCacheKey = () =>
      `webora-alloy-v1/${tier}/${this.patched ? "flow" : "ordinary"}`;
    this.material.onBeforeCompile = (shader) => {
      if (!this.patched) return;
      Object.assign(shader.uniforms, this.uniforms);
      shader.vertexShader =
        `varying vec3 vWeboraPosition;\n${shader.vertexShader}`.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvWeboraPosition = position;",
        );
      shader.fragmentShader =
        `// WEBORA_ALLOY_FLOW\nuniform float weboraTime;\nuniform float weboraFlow;\nuniform vec2 weboraPointer;\nvarying vec3 vWeboraPosition;\n${shader.fragmentShader}`
          .replace(
            "#include <roughnessmap_fragment>",
            `#include <roughnessmap_fragment>
          float weboraWave = sin(vWeboraPosition.y * 4.2 + vWeboraPosition.x * 1.8 + weboraTime * .85);
          roughnessFactor = clamp(roughnessFactor + weboraWave * .035 * weboraFlow, .18, .45);`,
          )
          .replace(
            "#include <normal_fragment_maps>",
            `#include <normal_fragment_maps>
          vec2 weboraSlope = vec2(
            cos(vWeboraPosition.y * 4.2 + weboraTime * .85),
            sin(vWeboraPosition.x * 3.6 - weboraTime * .65)
          );
          normal = normalize(normal + vec3((weboraSlope * .045 + weboraPointer * .018) * weboraFlow, 0.0));`,
          );
    };
  }
  update(now: number, delta: number, x: number, y: number, active: boolean) {
    if (!this.patched) return false;
    if (
      active ||
      Math.abs(x - this.lastX) > 0.0001 ||
      Math.abs(y - this.lastY) > 0.0001
    )
      this.until = now + (this.tier === "high" ? 900 : 650);
    this.lastX = x;
    this.lastY = y;
    const remaining = Math.max(0, this.until - now);
    this.uniforms.weboraFlow.value = Math.min(1, remaining / 300);
    if (remaining > 0) this.uniforms.weboraTime.value += delta;
    this.uniforms.weboraPointer.value.set(x, y);
    return remaining > 0;
  }
  fallback() {
    if (!this.patched) return false;
    this.patched = false;
    this.uniforms.weboraFlow.value = 0;
    this.material.name = "Webora / ordinary alloy fallback";
    this.material.needsUpdate = true;
    return true;
  }
}
