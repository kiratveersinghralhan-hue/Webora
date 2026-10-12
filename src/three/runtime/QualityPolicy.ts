export type QualityTier = "high" | "balanced" | "low";
export interface Capabilities {
  coarse: boolean;
  memory?: number;
  cores?: number;
  saveData: boolean;
  maxTexture: number;
  software: boolean;
}
export const qualitySettings = {
  high: { dpr: 1.5, pixels: 1600000, fps: 60, bevel: 4 },
  balanced: { dpr: 1.15, pixels: 700000, fps: 30, bevel: 2 },
  low: { dpr: 1, pixels: 350000, fps: 30, bevel: 1 },
} as const;
export function initialTier(hints: Capabilities): QualityTier {
  if (
    hints.saveData ||
    hints.software ||
    hints.maxTexture < 4096 ||
    (hints.memory !== undefined && hints.memory <= 2) ||
    (hints.cores !== undefined && hints.cores <= 2)
  )
    return "low";
  if (!hints.coarse && (hints.memory ?? 0) >= 8 && (hints.cores ?? 0) >= 8)
    return "high";
  return "balanced";
}
export function resolution(
  tier: QualityTier,
  width: number,
  height: number,
  deviceDpr: number,
) {
  const settings = qualitySettings[tier];
  return Math.min(
    deviceDpr,
    settings.dpr,
    Math.sqrt(settings.pixels / Math.max(1, width * height)),
  );
}
/** Conservative initial policy: two sustained bad windows; no automatic upgrades. */
export class QualityPolicy {
  tier: QualityTier;
  private samples: number[] = [];
  private elapsed = 0;
  private badWindows = 0;
  constructor(hints: Capabilities) {
    this.tier = initialTier(hints);
  }
  sample(delta: number) {
    if (delta <= 0 || delta > 0.25) {
      this.resetWindow();
      return false;
    }
    this.elapsed += delta;
    this.samples.push(delta);
    if (this.elapsed < 2) return false;
    const average =
      this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const bad = average > (this.tier === "high" ? 0.025 : 0.045);
    this.badWindows = bad ? this.badWindows + 1 : 0;
    this.resetWindow();
    if (this.badWindows < 2 || this.tier === "low") return false;
    this.tier = this.tier === "high" ? "balanced" : "low";
    this.badWindows = 0;
    return true;
  }
  resetWindow() {
    this.samples = [];
    this.elapsed = 0;
  }
}
