import { useEffect } from "react";
import { useReducedMotion } from "../hooks/useMotion";
import { isMotionReduced } from "../lib/motionPreference";

/** Standalone Services shares the same runtime; calm routes never mount this adapter. */
export function InstallationRouteStage() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || isMotionReduced()) return;
    let canceled = false,
      started = false,
      cleanup: (() => void) | undefined;
    const host = document.querySelector<HTMLElement>(
      "[data-installation-kind]",
    );
    if (!host) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || started || canceled)
        return;
      started = true;
      observer.disconnect();
      Promise.all([
        import("./runtime/WorldRuntime"),
        import("./scenes/StudioScene"),
        import("./runtime/installationViews"),
        import("../lib/pageMotion"),
      ])
        .then(
          ([{ WorldRuntime }, { StudioScene }, { bindInstallationViews }]) => {
            if (canceled) return;
            const scene = new StudioScene(false);
            const world = new WorldRuntime(host, () => {});
            world.register("installations", scene);
            world.ownCleanup(
              bindInstallationViews(
                world,
                scene,
                host.closest<HTMLElement>(".page-enter")!,
              ),
            );
            cleanup = () => world.dispose();
            return world.initialize();
          },
        )
        .catch(() => cleanup?.());
    });
    host
      .closest(".page-enter")
      ?.querySelectorAll("[data-installation-kind]")
      .forEach((slot) => observer.observe(slot));
    return () => {
      canceled = true;
      observer.disconnect();
      cleanup?.();
    };
  }, [reduced]);
  return null;
}
