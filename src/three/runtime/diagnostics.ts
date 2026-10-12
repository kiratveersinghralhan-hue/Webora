import { isLocalPreview } from "../../lib/experience";
import type { WebGLRenderer } from "three/src/Three.js";

export interface RuntimeRecord {
  id: number;
  kind: string;
  owner: "v1" | "v2";
  active: boolean;
  visible: boolean;
  status: string;
  frames: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  dpr: number;
  quality: string;
  gaps: number[];
  events: string[];
  identity?: Record<string, number | string>;
}
declare global {
  interface Window {
    __WEBORA_RUNTIME__?: { records: RuntimeRecord[] };
  }
}
/** Explicit opt-in, development only. No production diagnostic API or GPU-memory claims. */
export function recordRuntime(owner: RuntimeRecord["owner"], kind: string) {
  if (
    !import.meta.env.DEV ||
    !isLocalPreview() ||
    !new URLSearchParams(location.search).has("diagnostics")
  )
    return undefined;
  const store = (window.__WEBORA_RUNTIME__ ??= { records: [] });
  const record: RuntimeRecord = {
    id: store.records.length + 1,
    kind,
    owner,
    active: true,
    visible: true,
    status: "initializing",
    frames: 0,
    calls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
    dpr: 0,
    quality: "pending",
    gaps: [],
    events: [],
  };
  store.records.push(record);
  return record;
}
export function recordFrame(
  record: RuntimeRecord | undefined,
  renderer: WebGLRenderer,
  gap?: number,
) {
  if (!record) return;
  record.frames++;
  record.calls = renderer.info.render.calls;
  record.triangles = renderer.info.render.triangles;
  record.geometries = renderer.info.memory.geometries;
  record.textures = renderer.info.memory.textures;
  record.programs = renderer.info.programs?.length ?? 0;
  record.dpr = renderer.getPixelRatio();
  record.status = "ready";
  if (gap !== undefined && gap > 0 && gap < 250) {
    record.gaps.push(gap);
    if (record.gaps.length > 1200) record.gaps.shift();
  }
}
export function recordEvent(record: RuntimeRecord | undefined, event: string) {
  if (!record) return;
  record.events.push(event);
  if (record.events.length > 100) record.events.shift();
  record.status = event;
}
