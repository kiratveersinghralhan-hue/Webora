import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Spatial } from "./Spatial";
import { useReducedMotion } from "../hooks/useMotion";
import { isMotionReduced, localIntroReplay } from "../lib/motionPreference";
import { isV2Experience, useV2Experience } from "../lib/experience";
import { IdentityCore } from "./IdentityCore";

let visited = false;

export function Core(props: {
  small?: boolean;
  progress?: number;
  intro?: boolean;
}) {
  const experimental = useV2Experience();
  return experimental && !props.small ? (
    <IdentityCore intro={!!props.intro} />
  ) : (
    <LegacyCore {...props} />
  );
}

function LegacyCore({
  small = false,
  progress = 1,
  intro = false,
}: {
  small?: boolean;
  progress?: number;
  intro?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const reduced = useReducedMotion();
  const sculpture = useRef<HTMLDivElement>(null);
  const from = useRef<DOMRect | null>(null);
  const deadline = useRef(0);
  const finish = () => {
    from.current = sculpture.current?.getBoundingClientRect() ?? null;
    visited = true;
    try {
      sessionStorage.setItem("webora-intro-v2", "seen");
    } catch {
      /* Optional session storage. */
    }
    setOpening(false);
  };
  useLayoutEffect(() => {
    if (isV2Experience() && !small) return;
    if (!intro || reduced || isMotionReduced() || location.hash || scrollY > 80)
      return;
    let seen = visited;
    try {
      seen ||= sessionStorage.getItem("webora-intro-v2") === "seen";
    } catch {
      /* In-memory session fallback. */
    }
    if (seen && !localIntroReplay()) return;
    deadline.current = performance.now() + 2900;
    setOpening(true);
    try {
      sessionStorage.setItem("webora-intro-v2", "seen");
    } catch {
      /* Session storage is optional. */
    }
    return () => {
      visited = true;
    };
  }, [intro, reduced, small]);
  useLayoutEffect(() => {
    if (!opening) return;
    document.documentElement.classList.add("intro-running");
    return () => document.documentElement.classList.remove("intro-running");
  }, [opening]);
  useEffect(() => {
    if (!opening) return;
    if (reduced) {
      finish();
      return;
    }
    const timer = window.setTimeout(
      finish,
      ready
        ? Math.min(2250, Math.max(0, deadline.current - performance.now()))
        : Math.max(0, deadline.current - performance.now()),
    );
    const element = sculpture.current;
    element?.addEventListener("spatial-unavailable", finish);
    return () => {
      clearTimeout(timer);
      element?.removeEventListener("spatial-unavailable", finish);
    };
  }, [opening, ready, reduced]);
  useLayoutEffect(() => {
    if (opening || !from.current || !sculpture.current || reduced) return;
    const target = sculpture.current.getBoundingClientRect(),
      old = from.current;
    window.dispatchEvent(new Event("webora-intro-complete"));
    from.current = null;
    const animation = sculpture.current.animate(
      [
        {
          transform: `translate(${old.x - target.x}px, ${old.y - target.y}px) scale(${old.width / target.width}, ${old.height / target.height})`,
        },
        { transform: "none" },
      ],
      { duration: 550, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
    return () => animation.cancel();
  }, [opening, reduced]);
  return (
    <>
      {opening && (
        <div className="intro-veil" data-testid="webora-intro">
          <span className="intro-identifier mono">
            W—01 / WEB DESIGN STUDIO
          </span>
          <div className="intro-type">
            <strong>WEBORA</strong>
            <span>WEB DESIGN STUDIO</span>
            <small className="mono">DESIGN × DEVELOPMENT × AI</small>
          </div>
          <button className="intro-skip mono" onClick={finish}>
            Skip intro ↗
          </button>
        </div>
      )}
      <div
        ref={sculpture}
        className={`core ${small ? "core-small" : ""} ${ready ? "core-ready" : ""} ${opening ? "core-intro" : ""}`}
        aria-hidden="true"
      >
        <div className="core-halo" />
        <div className="core-fallback">
          <svg viewBox="0 0 600 600">
            <defs>
              <linearGradient
                id={small ? "metal-small" : "metal"}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop stopColor="#d5dcff" />
                <stop offset=".25" stopColor="#737ef5" />
                <stop offset=".5" stopColor="#302848" />
                <stop offset=".75" stopColor="#9b8ff2" />
                <stop offset="1" stopColor="#25273c" />
              </linearGradient>
            </defs>
            <g transform="translate(60 120) rotate(-12 230 180)">
              <path
                d="M30 20L120 360 235 125 340 360 450 20 375 20 327 200 245 20 208 20 134 200 92 20Z"
                fill={`url(#${small ? "metal-small" : "metal"})`}
                stroke="#b6c4ff"
                strokeWidth="2"
              />
            </g>
          </svg>
        </div>
        <div className="core-canvas">
          <Spatial
            kind="hero"
            progress={progress}
            intro={opening}
            onReady={setReady}
            allowV2={!small}
          />
        </div>
        <span className="core-coordinate mono">W—01 / DIGITAL CORE</span>
      </div>
      {!small && !opening && ready && (
        <div
          className="core-controls"
          role="group"
          aria-label="Sculpture controls"
        >
          <button
            aria-label="Rotate sculpture left"
            onClick={() =>
              sculpture.current?.dispatchEvent(
                new CustomEvent("core-turn", { detail: -Math.PI / 2 }),
              )
            }
          >
            ←
          </button>
          <button
            aria-label="Reset sculpture"
            onClick={() =>
              sculpture.current?.dispatchEvent(
                new CustomEvent("core-turn", { detail: 0 }),
              )
            }
          >
            ↺
          </button>
          <button
            aria-label="Rotate sculpture right"
            onClick={() =>
              sculpture.current?.dispatchEvent(
                new CustomEvent("core-turn", { detail: Math.PI / 2 }),
              )
            }
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
