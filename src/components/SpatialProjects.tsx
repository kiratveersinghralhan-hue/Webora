import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects, projects } from "../data/studio";
import { ProjectVisual } from "./ProjectVisual";
import { ProjectActions } from "./Projects";
import { InstallationRouteStage } from "../three/InstallationRouteStage";

export function SpatialProjects({ archive = false }: { archive?: boolean }) {
  const [active, setActive] = useState(0);
  const surface = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLElement>(null);
  const project = featuredProjects[active];
  const ProjectHeading = archive ? "h2" : "h3";
  useEffect(() => {
    const host = surface.current!;
    const settled = (event: Event) =>
      setActive((event as CustomEvent<number>).detail);
    host.addEventListener("gallery-settled", settled);
    return () => host.removeEventListener("gallery-settled", settled);
  }, []);
  const select = (index: number) => {
    const next = Math.max(0, Math.min(featuredProjects.length - 1, index));
    setActive(next);
    surface.current?.dispatchEvent(
      new CustomEvent("gallery-select", { detail: next }),
    );
  };
  return (
    <section
      className="spatial-portfolio"
      aria-label="Selected website gallery"
      aria-roledescription="carousel"
      ref={gallery}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        select(
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? 3
              : active + (event.key === "ArrowRight" ? 1 : -1),
        );
      }}
    >
      {archive && <InstallationRouteStage />}
      <div className="spatial-gallery-top mono">
        <span>WEBORA / SPATIAL EDITION</span>
        <span>DRAG TO DISCOVER ↔</span>
      </div>
      <div
        className="spatial-gallery-surface"
        ref={surface}
        data-installation-kind="gallery"
        data-active={active}
        tabIndex={0}
        role="group"
        aria-label={`Project previews. ${project.name}. Use left and right arrow keys.`}
        data-cursor="DRAG"
      >
        <div className="spatial-gallery-fallback">
          <ProjectVisual theme={project.theme} project={project} />
        </div>
        <span className="spatial-gallery-floor" aria-hidden="true" />
      </div>
      <div className="spatial-gallery-meta">
        <div className="spatial-gallery-title">
          <span className="mono">
            0{active + 1} / 04 — {project.category}
          </span>
          <ProjectHeading className="gallery-project-name">
            {project.name}
          </ProjectHeading>
          <span
            className={`concept-tag status-${project.status.toLowerCase().replaceAll(" ", "-")}`}
          >
            {project.status}
          </span>
        </div>
        <div className="spatial-gallery-description">
          <p>{project.description}</p>
          <span className="mono preview-note">{project.imageNote}</span>
          <ProjectActions project={project} />
        </div>
      </div>
      <nav className="spatial-gallery-controls" aria-label="Selected projects">
        <button
          aria-label="Previous project"
          disabled={active === 0}
          onClick={() => select(active - 1)}
        >
          ←
        </button>
        {featuredProjects.map((item, index) => (
          <button
            key={item.slug}
            onClick={() => select(index)}
            aria-label={`Show ${item.name}`}
            aria-current={index === active ? "true" : undefined}
          >
            <span className="mono">0{index + 1}</span>
            <span>{item.name}</span>
          </button>
        ))}
        <button
          aria-label="Next project"
          disabled={active === 3}
          onClick={() => select(active + 1)}
        >
          →
        </button>
      </nav>
      <span className="sr-only" aria-live="polite">
        Project {active + 1} of 4: {project.name}, {project.status}
      </span>
      {archive && (
        <details className="concept-archive">
          <summary>
            Website concept archive <span>02 explorations +</span>
          </summary>
          <div className="archive-list">
            {projects
              .filter((item) => !item.featured)
              .map((item) => (
                <Link key={item.slug} to={`/work/${item.slug}`}>
                  <span>{item.name}</span>
                  <span className="mono">CONCEPT / WEBSITE DESIGN</span>
                  <ArrowUpRight size={20} />
                </Link>
              ))}
          </div>
        </details>
      )}
    </section>
  );
}
