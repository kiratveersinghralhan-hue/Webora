import { useEffect, useRef } from "react";
import { isMotionReduced } from "../lib/motionPreference";
import { horizontalDrag } from "../lib/gesture";
import { useReducedMotion } from "../hooks/useMotion";
import type { CoreScene } from "./scenes/CoreScene";
import type { ImpressionScene } from "./scenes/ImpressionScene";
import type { WorldRuntime } from "./runtime/WorldRuntime";
import type { IntroDirector } from "./runtime/IntroDirector";
import { setPointerLabel } from "../lib/pointer";

/** Lazy local V2 hero adapter. The module/runtime own no business state. */
export function ExperienceStage({
  intro,
  onReady,
  director,
  studio = false,
  impression = false,
}: {
  intro: boolean;
  onReady?: (ready: boolean) => void;
  director?: IntroDirector;
  studio?: boolean;
  impression?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const core = useRef<CoreScene | ImpressionScene | undefined>(undefined);
  const runtime = useRef<WorldRuntime | undefined>(undefined);
  const callback = useRef(onReady);
  callback.current = onReady;
  const opening = useRef(intro);
  opening.current = intro;
  const reduced = useReducedMotion();
  useEffect(() => {
    core.current?.setIntro(intro);
  }, [intro]);
  useEffect(() => {
    const element = host.current!;
    let canceled = false,
      started = false;
    let stopDrag: (() => void) | undefined;
    let stopTurn: (() => void) | undefined;
    let world: WorldRuntime | undefined;
    const unavailable = () => {
      callback.current?.(false);
      element.dispatchEvent(
        new Event("spatial-unavailable", { bubbles: true }),
      );
    };
    callback.current?.(false);
    if (reduced || isMotionReduced()) return;
    const stopDirector = director?.subscribe(() => {
      runtime.current?.invalidate();
      if (import.meta.env.DEV) element.dataset.introReason = director.reason;
    });
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || started || canceled)
        return;
      started = true;
      Promise.all([
        import("./runtime/WorldRuntime"),
        import("./scenes/CoreScene"),
        import("../lib/pageMotion"),
        studio ? import("./scenes/StudioScene") : Promise.resolve(undefined),
        studio
          ? import("./runtime/installationViews")
          : Promise.resolve(undefined),
      ])
        .then(
          ([{ WorldRuntime }, { CoreScene }, , studioModule, viewModule]) => {
            if (canceled) return;
            const chapters = studioModule
              ? new studioModule.StudioScene(true, impression)
              : undefined;
            const module = chapters?.core ?? new CoreScene(studio);
            if (director) module.setDirector(director);
            core.current = module;
            world = new WorldRuntime(
              element,
              (status) => {
                if (canceled) return;
                callback.current?.(status.ready);
                if (status.ready)
                  director?.ready(performance.now(), status.tier === "low");
                else if (status.reason) director?.finish("unavailable");
                if (!status.ready && status.reason) unavailable();
              },
              impression,
            );
            runtime.current = world;
            world.register("core", chapters ?? module);
            if (chapters && viewModule)
              world.ownCleanup(
                viewModule.bindInstallationViews(
                  world,
                  chapters,
                  element.closest<HTMLElement>(".living-layout")!,
                  element,
                  (value) => callback.current?.(value),
                ),
              );
            module.setIntro(opening.current);
            const surface = element.closest<HTMLElement>(".core")!;
            stopDrag = horizontalDrag(surface, {
              start: () => {
                module.startDrag();
                surface.dataset.cursor = "DRAG";
                setPointerLabel("DRAG");
              },
              move: (dx, dy, dt) => module.drag(dx, dy, dt),
              end: (cancelled) => {
                module.endDrag(cancelled);
                surface.dataset.cursor = "EXPLORE";
                setPointerLabel("EXPLORE");
              },
            });
            const turn = (event: Event) =>
              module.turn((event as CustomEvent<number>).detail);
            surface.addEventListener("core-turn", turn);
            stopTurn = () => surface.removeEventListener("core-turn", turn);
            world.ownCleanup(stopDrag);
            world.ownCleanup(stopTurn);
            return world.initialize();
          },
        )
        .catch(() => {
          if (!canceled) {
            world?.dispose();
            unavailable();
          }
        });
    });
    observer.observe(element);
    if (studio)
      element
        .closest(".living-layout")
        ?.querySelectorAll("[data-installation-kind]")
        .forEach((slot) => observer.observe(slot));
    return () => {
      canceled = true;
      observer.disconnect();
      stopDirector?.();
      stopDrag?.();
      stopTurn?.();
      world?.dispose();
      setPointerLabel("");
      core.current = undefined;
      runtime.current = undefined;
    };
  }, [reduced, director, studio, impression]);
  return (
    <div
      className="spatial-canvas experience-stage"
      ref={host}
      data-experience-stage={impression ? "impression" : "v2"}
      aria-hidden="true"
    />
  );
}
