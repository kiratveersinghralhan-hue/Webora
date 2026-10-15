import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { featuredProjects, projects, type Project } from "../data/studio";
import { assetUrl } from "../lib/site";
import { GalleryController } from "../lib/galleryController";
import { horizontalDrag } from "../lib/gesture";
import { isMotionReduced } from "../lib/motionPreference";
import { useReducedMotion } from "../hooks/useMotion";
import { ProjectActions } from "./Projects";

const pad = (value: number) => String(value).padStart(2, "0");
const concepts = projects.filter((item) => !item.featured);

function Sheet({
  project,
  index,
  active,
}: {
  project: Project;
  index: number;
  active: boolean;
}) {
  const opens = active && project.caseStudy;
  return (
    <article
      className={`folio-sheet folio-${project.theme}`}
      style={{ "--i": index } as React.CSSProperties}
      data-index={index}
      data-active={active || undefined}
      data-cursor={opens ? "VIEW" : undefined}
    >
      <header className="folio-sheet__bar">
        <span>{project.number}</span>
        <span>{project.category}</span>
        <span
          className={`folio-status ${project.status === "LIVE" ? "is-live" : ""}`}
        >
          {project.status === "LIVE" ? "Live" : "In progress"}
        </span>
      </header>
      <div className="folio-sheet__plate">
        {project.image ? (
          <img
            src={assetUrl(project.image)}
            alt=""
            width="1440"
            height="900"
            loading={index < 2 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
        ) : (
          <div className="folio-sheet__pending">
            <span>Currently building</span>
            <strong>
              The next <em>chapter.</em>
            </strong>
          </div>
        )}
        {opens && (
          <span className="folio-sheet__open">
            View case study <ArrowUpRight size={15} />
          </span>
        )}
      </div>
      <footer className="folio-sheet__caption">
        <strong>{project.name}</strong>
        <span>{project.tagline}</span>
      </footer>
    </article>
  );
}

/**
 * Spatial Folio: project sheets fanned in CSS 3D space. One spring position
 * (--p) drives every sheet; each sheet derives its own offset in CSS, so the
 * per-frame JavaScript cost is a single custom-property write.
 */
export function SpatialFolio({ archive = false }: { archive?: boolean }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const stage = useRef<HTMLDivElement>(null);
  const select = useRef<(index: number) => void>(() => {});
  const step = useRef<(delta: number) => void>(() => {});
  const reduced = useReducedMotion();
  const last = featuredProjects.length - 1;
  const project = featuredProjects[active];
  const Heading = archive ? "h2" : "h3";

  useEffect(() => {
    const element = stage.current!;
    const calm = reduced || isMotionReduced();
    const controller = new GalleryController(featuredProjects.length);
    let frame = 0,
      previous = 0,
      settled = 0,
      canceled = false;
    controller.position = controller.target = Number(
      element.dataset.active ?? 0,
    );
    const paint = () => {
      element.style.setProperty("--p", controller.position.toFixed(4));
      // Sheets lean into the motion and settle upright with the spring.
      element.style.setProperty(
        "--v",
        Math.max(-2.5, Math.min(2.5, controller.velocity)).toFixed(3),
      );
      const nearest = Math.round(controller.position);
      if (nearest !== settled) {
        settled = nearest;
        setActive(nearest);
      }
    };
    const tick = (now: number) => {
      frame = 0;
      if (canceled) return;
      const delta = previous ? (now - previous) / 1000 : 1 / 60;
      previous = now;
      const moving = controller.update(delta);
      paint();
      if (moving && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (calm) {
        controller.position = controller.target;
        controller.velocity = 0;
        paint();
        return;
      }
      if (!frame) {
        previous = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    select.current = (index) => {
      controller.select(index);
      wake();
    };
    step.current = (delta) => {
      controller.step(delta);
      wake();
    };
    const stopDrag = horizontalDrag(element, {
      start: () => {
        controller.start();
        element.dataset.cursor = "DRAG";
      },
      move: (dx, _dy, dt) => {
        const width =
          element.querySelector<HTMLElement>(".folio-sheet")?.offsetWidth ??
          element.clientWidth * 0.6;
        controller.drag(-dx / Math.max(200, width * 0.82), dt);
        paint();
      },
      end: (cancelled) => {
        controller.end(cancelled);
        wake();
      },
    });
    let wheelIdle = 0;
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.2) return;
      event.preventDefault();
      controller.dragging = true;
      controller.position = controller.target = Math.max(
        0,
        Math.min(last, controller.position + event.deltaX / 700),
      );
      paint();
      clearTimeout(wheelIdle);
      wheelIdle = window.setTimeout(() => {
        controller.end(true);
        wake();
      }, 120);
    };
    const tilt = (event: PointerEvent) => {
      if (calm || event.pointerType !== "mouse") return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        "--tx",
        (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3),
      );
      element.style.setProperty(
        "--ty",
        (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3),
      );
    };
    const untilt = () => {
      element.style.setProperty("--tx", "0");
      element.style.setProperty("--ty", "0");
    };
    const visibility = () => {
      if (!document.hidden && controller.position !== controller.target) wake();
    };
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointermove", tilt);
    element.addEventListener("pointerleave", untilt);
    document.addEventListener("visibilitychange", visibility);
    element.dataset.enhanced = "true";
    paint();
    return () => {
      canceled = true;
      cancelAnimationFrame(frame);
      clearTimeout(wheelIdle);
      stopDrag();
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("pointermove", tilt);
      element.removeEventListener("pointerleave", untilt);
      document.removeEventListener("visibilitychange", visibility);
      select.current = () => {};
      step.current = () => {};
      delete element.dataset.enhanced;
    };
  }, [reduced, last]);

  const go = (index: number) =>
    select.current(Math.max(0, Math.min(last, index)));

  return (
    <section
      className="spatial-folio"
      aria-label="Selected website projects"
      aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          !(event.target instanceof Element) ||
          !event.target.closest(".folio-stage, .folio-controls")
        )
          return;
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        if (event.key === "Home") go(0);
        else if (event.key === "End") go(last);
        else step.current(event.key === "ArrowRight" ? 1 : -1);
      }}
    >
      <div className="folio-viewport">
        <div
          className="folio-stage"
          ref={stage}
          data-active={active}
          style={
            {
              "--p": 0,
              "--v": 0,
              "--count": featuredProjects.length,
            } as React.CSSProperties
          }
          tabIndex={0}
          role="group"
          aria-label={`Project sheets. Showing ${project.name}. Use the left and right arrow keys to browse.`}
          data-cursor="DRAG"
          onClick={(event) => {
            const sheet = (event.target as Element).closest<HTMLElement>(
              ".folio-sheet",
            );
            if (!sheet) return;
            const index = Number(sheet.dataset.index);
            // The settled front sheet opens its case study; others come forward.
            if (index === active && featuredProjects[index].caseStudy)
              navigate(`/work/${featuredProjects[index].slug}`);
            else go(index);
          }}
        >
          <span className="folio-numeral" aria-hidden="true" key={active}>
            {pad(active + 1)}
          </span>
          <div className="folio-space" aria-hidden="true">
            {featuredProjects.map((item, index) => (
              <Sheet
                key={item.slug}
                project={item}
                index={index}
                active={index === active}
              />
            ))}
          </div>
        </div>
        {/* Directly under the stage, so browsing never requires scrolling past
            the showcased project. On wide screens the arrows flank the card. */}
        <nav className="folio-controls" aria-label="Browse projects">
          <button
            className="folio-arrow folio-arrow--prev"
            aria-label="Previous project"
            disabled={active === 0}
            onClick={() => step.current(-1)}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <div className="folio-index">
            {featuredProjects.map((item, index) => (
              <button
                key={item.slug}
                onClick={() => go(index)}
                aria-label={`Show ${item.name}`}
                aria-current={index === active ? "true" : undefined}
              >
                <span>{pad(index + 1)}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <span className="folio-hint" aria-hidden="true">
            Drag, swipe or use &larr; &rarr;
          </span>
          <button
            className="folio-arrow folio-arrow--next"
            aria-label="Next project"
            disabled={active === last}
            onClick={() => step.current(1)}
          >
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </nav>
      </div>
      <div className="folio-panel">
        <div className="folio-panel__title" key={project.slug}>
          <span className="folio-panel__index">
            {pad(active + 1)} <i>/ {pad(featuredProjects.length)}</i>
          </span>
          <Heading className="folio-panel__name">{project.name}</Heading>
          <span className="folio-panel__category">
            {project.category} &middot;{" "}
            {project.status === "LIVE" ? "Live website" : "In progress"}
          </span>
        </div>
        <div className="folio-panel__body" key={`${project.slug}-body`}>
          <p>{project.description}</p>
          <span className="folio-panel__note">{project.imageNote}</span>
          <ProjectActions project={project} />
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        Project {active + 1} of {featuredProjects.length}: {project.name},{" "}
        {project.status === "LIVE" ? "live website" : "in progress"}
      </span>
      {archive && (
        <details className="folio-archive">
          <summary>
            Website concept archive{" "}
            <span>{pad(concepts.length)} explorations</span>
          </summary>
          <div className="folio-archive__list">
            {concepts.map((item) => (
              <Link key={item.slug} to={`/work/${item.slug}`}>
                <span>{item.name}</span>
                <span>Concept &middot; Website design</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
