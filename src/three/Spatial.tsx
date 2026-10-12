import { isMotionReduced } from "../lib/motionPreference";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "../hooks/useMotion";
import { isV2Experience, useV2Experience } from "../lib/experience";
import { ExperienceStage } from "./ExperienceStage";
export type SceneKind = "hero" | "work" | "services" | "process" | "fabric";

/** Progressive WebGL enhancement. Content always exists outside the canvas. */
export function Spatial({
  kind,
  active = 0,
  progress = 0,
  children,
  onReady,
  intro = false,
  allowV2 = false,
}: {
  kind: SceneKind;
  active?: number;
  progress?: number;
  children?: ReactNode;
  onReady?: (ready: boolean) => void;
  intro?: boolean;
  allowV2?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callback = useRef(onReady);
  callback.current = onReady;
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  const experimental = useV2Experience();
  useEffect(() => {
    const element = host.current!;
    let cleanup: (() => void) | undefined;
    let cancelled = false,
      started = false;
    setReady(false);
    callback.current?.(false);
    if (reduced || isMotionReduced() || isV2Experience()) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        import("./engine")
          .then(({ createScene }) => {
            if (cancelled) return;
            try {
              cleanup = createScene(element, kind, (value) => {
                if (!cancelled) {
                  setReady(value);
                  callback.current?.(value);
                }
              });
            } catch {
              setReady(false);
              callback.current?.(false);
              element.dispatchEvent(
                new Event("spatial-unavailable", { bubbles: true }),
              );
            }
          })
          .catch(() => {
            if (!cancelled) {
              setReady(false);
              element.dispatchEvent(
                new Event("spatial-unavailable", { bubbles: true }),
              );
            }
          });
      },
      { rootMargin: kind === "hero" ? "0px" : "180px" },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup?.();
    };
  }, [kind, reduced]);
  return (
    <div
      className={`spatial spatial-${kind} ${ready ? "spatial-ready" : ""}`}
      data-scene={kind}
      aria-hidden="true"
    >
      <div className="spatial-fallback">{children}</div>
      {experimental && kind === "hero" && allowV2 ? (
        <ExperienceStage
          intro={intro}
          onReady={(value) => {
            setReady(value);
            callback.current?.(value);
          }}
        />
      ) : (
        <div
          className="spatial-canvas"
          ref={host}
          data-active={active}
          data-progress={progress}
          data-intro={intro ? "active" : "complete"}
        />
      )}
    </div>
  );
}
