import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useReducedMotion } from "../hooks/useMotion";
import { isMotionReduced, localIntroReplay } from "../lib/motionPreference";
import { IntroDirector, INTRO_DEADLINE } from "./runtime/IntroDirector";
import { ExperienceStage } from "./ExperienceStage";
import { ImpressionFallback } from "./ImpressionFallback";

let visited = false;
export function IdentityCore({
  intro,
  studio = false,
  impression = false,
}: {
  intro: boolean;
  studio?: boolean;
  impression?: boolean;
}) {
  const [director] = useState(() => new IntroDirector());
  const phase = useSyncExternalStore(
    director.subscribe,
    director.snapshot,
    () => "settled",
  );
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  const sculpture = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reduced || isMotionReduced()) director.finish("reduced-motion");
    let seen = visited;
    try {
      seen ||= sessionStorage.getItem("webora-intro-v2") === "seen";
    } catch {
      /* In-memory fallback. */
    }
    director.request(performance.now(), {
      seen,
      reduced: reduced || isMotionReduced(),
      eligible: intro && !location.hash && scrollY < 80,
      replay: localIntroReplay(),
      mobile: matchMedia("(pointer: coarse)").matches || innerWidth < 700,
    });
    if (director.phase === "preparing") {
      visited = true;
      try {
        sessionStorage.setItem("webora-intro-v2", "seen");
      } catch {
        /* Optional storage. */
      }
    }
    // React StrictMode rehearses effects without leaving this route. The stage
    // owns actual unmount cancellation; a rehearsal must not consume the intro.
  }, [director, intro, reduced]);
  useEffect(() => {
    if (phase === "settled") {
      window.dispatchEvent(new Event("webora-intro-complete"));
      return;
    }
    const finish = () => director.finish("intent");
    const key = (event: KeyboardEvent) => {
      if (["Escape", "PageDown", "ArrowDown", " "].includes(event.key))
        finish();
    };
    const navigation = (event: Event) => {
      if ((event.target as Element).closest("a, .menu-toggle")) finish();
    };
    const timer = window.setTimeout(
      () => director.finish("deadline"),
      Math.max(0, director.requestedAt + INTRO_DEADLINE - performance.now()),
    );
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("touchstart", finish, { passive: true });
    window.addEventListener("scroll", finish, { passive: true });
    window.addEventListener("keydown", key);
    document.addEventListener("click", navigation, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
      window.removeEventListener("scroll", finish);
      window.removeEventListener("keydown", key);
      document.removeEventListener("click", navigation, true);
    };
  }, [director, phase]);
  const turn = (amount: number) =>
    sculpture.current?.dispatchEvent(
      new CustomEvent("core-turn", { detail: amount }),
    );
  return (
    <>
      <div
        className={`core identity-core ${ready ? "core-ready" : ""}`}
        ref={sculpture}
        data-intro-phase={phase}
        aria-hidden="true"
      >
        <div className="core-halo" />
        <div className="core-fallback">
          {impression ? (
            <ImpressionFallback />
          ) : (
            <svg viewBox="0 0 600 600">
              <defs>
                <linearGradient id="identity-alloy" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#cad5e9" />
                  <stop offset=".3" stopColor="#647fba" />
                  <stop offset=".52" stopColor="#202637" />
                  <stop offset=".8" stopColor="#8d85c4" />
                  <stop offset="1" stopColor="#343e56" />
                </linearGradient>
              </defs>
              <g transform="translate(60 120) rotate(-8 230 180)">
                <path
                  d="M30 20L120 360 235 125 340 360 450 20 375 20 327 200 245 20 208 20 134 200 92 20Z"
                  fill="url(#identity-alloy)"
                  stroke="#aabbd3"
                  strokeWidth="2"
                />
              </g>
            </svg>
          )}
        </div>
        <div className="core-canvas">
          <ExperienceStage
            studio={studio}
            impression={impression}
            intro={phase !== "settled"}
            director={director}
            onReady={setReady}
          />
        </div>
        <span className="core-coordinate mono">W—01 / FORGED IN MOTION</span>
      </div>
      {phase !== "settled" && (
        <div className="identity-intro" data-testid="webora-intro">
          <span className="mono" aria-live="polite">
            {phase === "preparing"
              ? "FORM / MATERIAL / LIGHT"
              : phase === "handoff"
                ? "WEBORA / A NEW DIMENSION"
                : "W—01 / COMING TOGETHER"}
          </span>
          <button onClick={() => director.finish("skip")}>Skip intro ↗</button>
        </div>
      )}
      {ready && phase === "settled" && (
        <div
          className="core-controls"
          role="group"
          aria-label="Sculpture controls"
        >
          <button
            aria-label="Rotate sculpture left"
            onClick={() => turn(-Math.PI / 2)}
          >
            ←
          </button>
          <button aria-label="Reset sculpture" onClick={() => turn(0)}>
            ↺
          </button>
          <button
            aria-label="Rotate sculpture right"
            onClick={() => turn(Math.PI / 2)}
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
