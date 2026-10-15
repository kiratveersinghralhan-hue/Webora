import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projects } from "../data/studio";
import { ProjectVisual } from "../components/ProjectVisual";
import { LinkButton } from "../components/LinkButton";
import { track } from "../lib/analytics";
import NotFound from "./NotFound";
import { ProjectActions } from "../components/Projects";
export default function CaseStudy() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
  useEffect(() => {
    if (project) track("project_viewed", { project: project.slug });
  }, [project]);
  if (!project || !project.caseStudy) return <NotFound />;
  const studies = projects.filter((item) => item.caseStudy);
  const next = studies[(studies.indexOf(project) + 1) % studies.length];
  return (
    <article className="page-enter case-study">
      <section className="section page-heading">
        <Link className="text-link" to="/work">
          <ArrowLeft size={17} /> All websites
        </Link>
        <div className="case-title">
          <h1>
            {project.name}
            <span aria-hidden="true">✳</span>
          </h1>
          <span className="concept-tag">
            {project.status === "CONCEPT" ? "Concept Project" : project.status}
          </span>
        </div>
        <p>{project.tagline}</p>
        <div className="case-metadata">
          <div>
            <span className="mono">INDUSTRY</span>
            {project.category}
          </div>
          <div>
            <span className="mono">SCOPE</span>
            {project.services.join(" · ")}
          </div>
          <div>
            <span className="mono">STATUS</span>
            {project.status === "CONCEPT"
              ? "Independent design exploration"
              : project.status === "LIVE"
                ? "Public website available"
                : "Currently building"}
          </div>
        </div>
      </section>
      <div className="case-hero section">
        <ProjectVisual theme={project.theme} project={project} />
        <p className="mono case-image-note">{project.imageNote}</p>
        <ProjectActions project={project} />
      </div>
      <section className="section case-content">
        <span className="mono">01 / THE INTENTION</span>
        <h2>{project.overview}</h2>
        <div className="case-grid">
          <div>
            <h3>The challenge</h3>
            <p>{project.problem}</p>
          </div>
          <div>
            <h3>The approach</h3>
            <p>{project.approach}</p>
          </div>
          <div>
            <h3>Design direction</h3>
            <p>{project.direction}</p>
          </div>
          <div>
            <h3>Development direction</h3>
            <p>{project.development}</p>
          </div>
        </div>
      </section>
      <section className="section case-devices">
        <div>
          <span className="mono">02 / ACROSS EVERY SCREEN</span>
          <h2>
            A considered
            <br />
            <span>point of view.</span>
          </h2>
          <ul>
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="phone-preview">
          <ProjectVisual theme={project.theme} project={project} mobile />
        </div>
      </section>
      <section className="section case-result">
        <span className="mono">03 / DESIGN OUTCOME</span>
        <h2>
          {project.status === "CONCEPT"
            ? "A direction to build on."
            : project.status === "LIVE"
              ? "A website with a clear purpose."
              : "The work continues."}
        </h2>
        <p>
          {project.status === "CONCEPT"
            ? "This exploration demonstrates a visual system and proposed customer journey. It has not been launched for a client, so there are no commercial results or conversion metrics to report."
            : project.development}
        </p>
        <LinkButton />
      </section>
      <Link
        className="section next-project"
        to={`/work/${next.slug}`}
        data-cursor="NEXT"
      >
        <span className="mono">NEXT WEBSITE</span>
        <h2>{next.name}</h2>
        <ArrowUpRight size={40} />
      </Link>
    </article>
  );
}
