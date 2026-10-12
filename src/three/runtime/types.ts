import type * as THREE from "three/src/Three.js";
import type { AssetRegistry } from "./AssetRegistry";
import type { QualityTier } from "./QualityPolicy";

export interface FrameState {
  time: number;
  /** Monotonic milliseconds sampled by the same authoritative world tick. */
  now?: number;
  delta: number;
  pointer: { nx: number; ny: number; active: boolean };
  scroll: number;
}
export interface SceneContext {
  root: THREE.Group;
  camera: THREE.PerspectiveCamera;
  assets: AssetRegistry;
  tier: QualityTier;
  invalidate(): void;
}
export interface SceneModule {
  mount(context: SceneContext): void;
  prepare(signal: AbortSignal): Promise<void>;
  update(frame: FrameState): boolean;
  resize(width: number, height: number): void;
  quality(tier: QualityTier): void;
  suspend(): void;
  resume(): void;
  dispose(): void;
  recoverMaterials?(): boolean;
  inspect?(): Record<string, number | string>;
}
export interface RuntimeStatus {
  ready: boolean;
  tier?: QualityTier;
  reason?: string;
}
