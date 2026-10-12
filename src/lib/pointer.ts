import { isV2Experience } from "./experience";
import { subscribeFrame } from "./frameClock";
/** One pointer, one damping clock: cursor, lights, meshes and shaders agree. */
export const pointer = {
  x: -100,
  y: -100,
  nx: 0,
  ny: 0,
  velocity: 0,
  active: false,
  label: "",
};
type Listener = (state: typeof pointer) => void;
/** Discrete semantic feedback uses the existing subscribers, with no additional clock. */
export function setPointerLabel(label: string) {
  pointer.label = label;
  listeners.forEach((listener) => listener(pointer));
}
const listeners = new Set<Listener>();
let stop: (() => void) | undefined;
export function subscribePointer(listener: Listener) {
  listeners.add(listener);
  if (!stop && typeof document !== "undefined") {
    let frame = 0,
      previous = 0;
    const target = { x: -100, y: -100, nx: 0, ny: 0 };
    let magnetic: HTMLElement | null = null;
    const coordinated = isV2Experience();
    let needsTick = false;
    const clearMagnet = () => {
      magnetic?.style.removeProperty("--mag-x");
      magnetic?.style.removeProperty("--mag-y");
      magnetic = null;
    };
    const tick = (time: number) => {
      frame = 0;
      const delta = previous ? Math.min(time - previous, 50) : 16.7;
      previous = time;
      const damping = 1 - Math.exp(-delta / 115);
      const speed = Math.hypot(target.x - pointer.x, target.y - pointer.y);
      pointer.x += (target.x - pointer.x) * damping;
      pointer.y += (target.y - pointer.y) * damping;
      pointer.nx += (target.nx - pointer.nx) * damping;
      pointer.ny += (target.ny - pointer.ny) * damping;
      pointer.velocity +=
        (Math.min(speed / 180, 1) - pointer.velocity) * damping;
      const settled =
        speed < 0.05 &&
        Math.abs(target.nx - pointer.nx) + Math.abs(target.ny - pointer.ny) <
          0.00001 &&
        pointer.velocity < 0.0001;
      if (settled) {
        pointer.x = target.x;
        pointer.y = target.y;
        pointer.nx = target.nx;
        pointer.ny = target.ny;
        pointer.velocity = 0;
      }
      listeners.forEach((fn) => fn(pointer));
      needsTick = !settled;
      if (!settled && !coordinated) frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      if (coordinated) {
        needsTick = true;
        return;
      }
      if (!frame && !document.hidden) {
        previous = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const move = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      target.nx = (event.clientX / innerWidth) * 2 - 1;
      target.ny = 1 - (event.clientY / innerHeight) * 2;
      pointer.active = true;
      const element = event.target instanceof Element ? event.target : null;
      pointer.label =
        element?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor || "";
      clearMagnet();
      if (event.pointerType === "mouse") {
        magnetic = element?.closest<HTMLElement>("[data-magnetic]") || null;
        if (magnetic) {
          const rect = magnetic.getBoundingClientRect();
          magnetic.style.setProperty(
            "--mag-x",
            `${(target.x - rect.left - rect.width / 2) * 0.08}px`,
          );
          magnetic.style.setProperty(
            "--mag-y",
            `${(target.y - rect.top - rect.height / 2) * 0.1}px`,
          );
        }
      }
      resume();
    };
    const leave = () => {
      pointer.active = false;
      target.nx = target.ny = 0;
      clearMagnet();
      resume();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        leave();
      } else resume();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    const stopClock = coordinated
      ? subscribeFrame("pointer", (time) => {
          if (needsTick && !document.hidden) tick(time * 1000);
        })
      : undefined;
    resume();
    stop = () => {
      stopClock?.();
      cancelAnimationFrame(frame);
      clearMagnet();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      pointer.active = false;
      stop = undefined;
    };
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) stop?.();
  };
}
