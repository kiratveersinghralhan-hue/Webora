import { isMotionReduced } from "../lib/motionPreference";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects, projects, type Project } from "../data/studio";
import { ProjectVisual } from "./ProjectVisual";
import { Spatial } from "../three/Spatial";
import { useReducedMotion } from "../hooks/useMotion";
import { subscribePointer } from "../lib/pointer";
import { horizontalDrag } from "../lib/gesture";
import { scrollToPosition } from "../lib/scroll";

export function ProjectActions({ project }: { project: Project }) {
  return (
    <div className="project-actions">
      {project.status === "LIVE" && project.websiteUrl && (
        <a
          className="text-link"
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Website <ArrowUpRight size={16} />
        </a>
      )}
      {project.caseStudy && (
        <Link className="text-link" to={`/work/${project.slug}`}>
          View Case Study <ArrowUpRight size={16} />
        </Link>
      )}
      {project.status === "IN PROGRESS" && (
        <span className="progress-label mono">
          In Progress <span aria-hidden="true">↗</span>
        </span>
      )}
    </div>
  );
}
export function Projects({ archive = false }: { archive?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const jump = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || isMotionReduced()) return;
    const element = stage.current!;
    let cancelled = false,
      frame = 0,
      lastTime = 0,
      position = 0,
      target = 0,
      current = 0;
    let dragging = false,
      velocity = 0;
    let pinned: { start: number; end: number } | undefined;
    let cleanup: (() => void) | undefined;
    const max = featuredProjects.length - 1;
    const clamp = (n: number) => Math.max(0, Math.min(max, n));
    setEnhanced(true);
    const paint = () => {
      element.dataset.position = String(position);
      element.style.setProperty("--work-progress", String(position / max));
      const next = Math.round(position);
      if (next !== current) {
        current = next;
        setActive(next);
      }
    };
    const tick = (now: number) => {
      frame = 0;
      if (cancelled || document.hidden) return;
      const delta = Math.min(50, lastTime ? now - lastTime : 16.7);
      lastTime = now;
      position += (target - position) * (1 - Math.exp(-delta / 135));
      if (Math.abs(target - position) < 0.0005) position = target;
      paint();
      if (position !== target) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (cancelled) return;
      if (!frame && !document.hidden) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const setTarget = (value: number) => {
      target = clamp(value);
      wake();
    };
    const select = (index: number) => {
      const next = clamp(index);
      if (pinned)
        scrollToPosition(
          pinned.start + ((pinned.end - pinned.start) * next) / max,
        );
      else setTarget(next);
    };
    jump.current = select;
    paint();
    const unsubscribe = subscribePointer(({ nx, ny }) => {
      element.style.setProperty("--pointer-x", String(nx));
      element.style.setProperty("--pointer-y", String(ny));
    });
    const stopDrag = horizontalDrag(element, {
      start: () => {
        dragging = true;
        velocity = 0;
      },
      move: (dx, _dy, dt) => {
        const movement = -dx / Math.max(230, element.clientWidth * 0.52);
        position = target = clamp(position + movement);
        velocity = movement / dt;
        paint();
        if (pinned)
          scrollToPosition(
            pinned.start + ((pinned.end - pinned.start) * position) / max,
            true,
          );
      },
      end: (cancelled) => {
        dragging = false;
        select(Math.round(clamp(position + (cancelled ? 0 : velocity * 160))));
      },
    });
    const key = (event: KeyboardEvent) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      if (!(event.target as HTMLElement).closest("button"))
        element.focus({ preventScroll: true });
      select(
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? max
            : Math.round(target) + (event.key === "ArrowRight" ? 1 : -1),
      );
    };
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      setTarget(target + event.deltaX / 650);
      if (pinned)
        scrollToPosition(
          pinned.start + ((pinned.end - pinned.start) * target) / max,
          true,
        );
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else wake();
    };
    element.addEventListener("keydown", key);
    element.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("visibilitychange", visibility);
    import("../lib/pageMotion")
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return;
        const media = gsap.matchMedia();
        media.add(
          "(min-width: 900px) and (min-height: 740px) and (pointer: fine)",
          () => {
            const trigger = ScrollTrigger.create({
              trigger: element,
              start: () =>
                `top ${(document.querySelector(".site-header")?.getBoundingClientRect().height ?? 85) + 16}px`,
              end: () => "+=" + innerHeight * max * 0.7,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (!dragging) setTarget(self.progress * max);
              },
              onRefresh: (self) => {
                if (!dragging) setTarget(self.progress * max);
              },
            });
            pinned = trigger;
            requestAnimationFrame(() => {
              if (!cancelled) ScrollTrigger.refresh();
            });
            return () => {
              pinned = undefined;
              trigger.kill(true);
            };
          },
        );
        cleanup = () => media.revert();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanup?.();
      stopDrag();
      unsubscribe();
      element.removeEventListener("keydown", key);
      element.removeEventListener("wheel", wheel);
      document.removeEventListener("visibilitychange", visibility);
      jump.current = () => {};
      setEnhanced(false);
    };
  }, [reduced]);
  return (
    <div
      className={`work-theatre ${enhanced ? "work-enhanced" : ""} ${ready ? "work-ready" : ""}`}
      ref={root}
    >
      <div
        className="work-stage"
        ref={stage}
        tabIndex={enhanced ? 0 : undefined}
        role="region"
        aria-label="Selected website gallery"
        aria-roledescription={enhanced ? "carousel" : undefined}
      >
        <div className="work-world">
          {enhanced && <Spatial kind="work" onReady={setReady} />}
        </div>
        <div className="work-stage-top mono">
          <span>WEBORA / SELECTED WEBSITES</span>
          <span>SCROLL · DRAG · EXPLORE</span>
        </div>
        <div className="work-drag-zone" aria-hidden="true" data-cursor="DRAG" />
        <div className="projects-list">
          {featuredProjects.map((project, i) => (
            <article
              className={`project ${active === i ? "is-active" : ""}`}
              key={project.slug}
              inert={enhanced && active !== i}
            >
              {project.caseStudy ? (
                <Link
                  to={`/work/${project.slug}`}
                  className="project-visual-link"
                  data-cursor="DRAG"
                  aria-label={`Explore ${project.name}, ${project.status}`}
                >
                  <div className="project-surface">
                    <ProjectVisual theme={project.theme} project={project} />
                  </div>
                  <span className="project-open">
                    <ArrowUpRight size={25} />
                  </span>
                </Link>
              ) : (
                <div className="project-visual-link">
                  <div className="project-surface">
                    <ProjectVisual theme={project.theme} project={project} />
                  </div>
                </div>
              )}
              <div className="project-info">
                <span className="mono project-index">/{project.number}</span>
                <div className="project-description">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <span className="mono preview-note">{project.imageNote}</span>
                  <ProjectActions project={project} />
                </div>
                <span
                  className={`concept-tag status-${project.status.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {project.status}
                </span>
              </div>
            </article>
          ))}
        </div>
        <nav
          className="work-controls"
          aria-label="Selected projects"
          hidden={!enhanced}
        >
          <button
            className="work-arrow"
            aria-label="Previous project"
            onClick={() => jump.current(active - 1)}
            disabled={active === 0}
          >
            ←
          </button>
          {featuredProjects.map((project, i) => (
            <button
              key={project.slug}
              onClick={() => jump.current(i)}
              aria-label={`Show ${project.name}`}
              aria-current={active === i ? "true" : undefined}
            >
              <span className="mono">0{i + 1}</span>
              <span>{project.name}</span>
            </button>
          ))}
          <button
            className="work-arrow"
            aria-label="Next project"
            onClick={() => jump.current(active + 1)}
            disabled={active === featuredProjects.length - 1}
          >
            →
          </button>
          <span className="work-meter" aria-hidden="true">
            <span />
          </span>
        </nav>
        <span className="sr-only" aria-live="polite">
          {enhanced
            ? `Project ${active + 1} of ${featuredProjects.length}: ${featuredProjects[active].name}`
            : ""}
        </span>
      </div>
      {archive && (
        <details className="concept-archive">
          <summary>
            Website concept archive <span>02 explorations +</span>
          </summary>
          <div className="archive-list">
            {projects
              .filter((p) => !p.featured)
              .map((project) => (
                <Link key={project.slug} to={`/work/${project.slug}`}>
                  <span>{project.name}</span>
                  <span className="mono">CONCEPT / WEBSITE DESIGN</span>
                  <ArrowUpRight size={20} />
                </Link>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}
