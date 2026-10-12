export type FramePhase = "scroll" | "pointer" | "world";
type Tick = (seconds: number, delta: number) => void;
type Driver = {
  add(callback: (time: number) => void): void;
  remove(callback: (time: number) => void): void;
};
const phases: FramePhase[] = ["scroll", "pointer", "world"];
const subscribers = new Map<FramePhase, Set<Tick>>(
  phases.map((phase) => [phase, new Set()]),
);
let driver: Driver | undefined;
let attached = false;
let previous: number | undefined;
const tick = (time: number) => {
  const delta =
    previous === undefined
      ? 1 / 60
      : Math.min(1 / 30, Math.max(0, time - previous));
  previous = time;
  for (const phase of phases)
    for (const callback of subscribers.get(phase)!) callback(time, delta);
};
function reconcile() {
  const needed = phases.some((phase) => subscribers.get(phase)!.size > 0);
  if (needed && !attached && driver) {
    driver.add(tick);
    attached = true;
    previous = undefined;
  }
  if (!needed && attached && driver) {
    driver.remove(tick);
    attached = false;
    previous = undefined;
  }
}
/** One existing GSAP ticker, ordered scroll → pointer → world; no new RAF. */
export function installFrameDriver(next: Driver) {
  if (driver === next) return;
  if (attached) driver?.remove(tick);
  driver = next;
  attached = false;
  reconcile();
}
export function subscribeFrame(phase: FramePhase, callback: Tick) {
  subscribers.get(phase)!.add(callback);
  reconcile();
  return () => {
    subscribers.get(phase)!.delete(callback);
    reconcile();
  };
}
