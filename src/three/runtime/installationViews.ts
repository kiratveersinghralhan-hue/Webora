import type { WorldRuntime } from "./WorldRuntime";
import type { StudioChapter, StudioScene } from "../scenes/StudioScene";
import { horizontalDrag } from "../../lib/gesture";

/** One active slot, one renderer. Other slots retain their original static compositions. */
export function bindInstallationViews(
  world: WorldRuntime,
  scene: StudioScene,
  root: HTMLElement,
  hero?: HTMLElement,
  onHeroReady?: (ready: boolean) => void,
) {
  let current: HTMLElement | undefined;
  let currentIndex = -99;
  let currentTurn = -1;
  const visibility = new Map<HTMLElement, number>();
  const stops: (() => void)[] = [];
  const galleries = root.querySelectorAll<HTMLElement>(
    '[data-installation-kind="gallery"]',
  );
  scene.onGallerySettled = (index) => {
    if (current?.dataset.installationKind === "gallery")
      current.dispatchEvent(
        new CustomEvent("gallery-settled", { detail: index }),
      );
  };
  for (const slot of galleries) {
    stops.push(
      horizontalDrag(slot, {
        start: () => scene.galleryAction("start"),
        move: (dx, _dy, dt) =>
          scene.galleryAction("drag", dx, dt, slot.clientWidth),
        end: (cancelled) => scene.galleryAction("end", Number(cancelled)),
      }),
    );
    const choose = (event: Event) =>
      scene.galleryAction("select", (event as CustomEvent<number>).detail);
    slot.addEventListener("gallery-select", choose);
    stops.push(() => slot.removeEventListener("gallery-select", choose));
  }
  const presented = (event: Event) => {
    if (event.target !== current) return;
    if (current === hero) onHeroReady?.(true);
    else if (current) {
      if (current.dataset.installationKind === "gallery") {
        const state = scene.inspect();
        if (
          !("loadedScreenshots" in state) ||
          state.loadedScreenshots !== 3 ||
          state.textureFailures !== 0
        )
          return;
      }
      current.dataset.ready = "true";
    }
  };
  const unavailable = () => {
    if (current) delete current.dataset.ready;
    onHeroReady?.(false);
  };
  const select = () => {
    const slots = [
      ...(hero ? [hero] : []),
      ...root.querySelectorAll<HTMLElement>("[data-installation-kind]"),
    ];
    let best: HTMLElement | undefined,
      score = 0;
    for (const slot of slots) {
      const rect = slot.getBoundingClientRect();
      const visible = Math.max(
        0,
        Math.min(innerHeight, rect.bottom) - Math.max(100, rect.top),
      );
      const next =
        rect.width > 0 ? visible / Math.min(rect.height, innerHeight) : 0;
      if (next > score) {
        score = next;
        best = slot;
      }
      if (!visibility.has(slot)) {
        visibility.set(slot, 0);
        intersection.observe(slot);
      }
    }
    if (!best) return;
    const index = Number(best.dataset.active ?? 0),
      turn = Number(best.dataset.turn ?? 0);
    const changed = current !== best;
    if (!changed && currentIndex === index && currentTurn === turn) return;
    if (changed) {
      if (current && current !== hero) delete current.dataset.ready;
      onHeroReady?.(false);
    }
    current = best;
    currentIndex = index;
    scene.select(
      best === hero ? "hero" : (best.dataset.installationKind as StudioChapter),
      index,
      !changed && turn !== currentTurn,
    );
    currentTurn = turn;
    world.attach(best);
  };
  const intersection = new IntersectionObserver(select, {
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });
  const mutation = new MutationObserver(select);
  mutation.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-active", "data-turn"],
  });
  window.addEventListener("scroll", select, { passive: true });
  window.addEventListener("resize", select);
  root.addEventListener("world-presented", presented);
  root.addEventListener("world-unavailable", unavailable);
  select();
  return () => {
    for (const stop of stops) stop();
    scene.onGallerySettled = undefined;
    intersection.disconnect();
    mutation.disconnect();
    window.removeEventListener("scroll", select);
    window.removeEventListener("resize", select);
    root.removeEventListener("world-presented", presented);
    root.removeEventListener("world-unavailable", unavailable);
    for (const slot of visibility.keys()) delete slot.dataset.ready;
  };
}
