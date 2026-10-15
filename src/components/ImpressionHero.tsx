import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { projects } from "../data/studio";
import { assetUrl } from "../lib/site";
import { IdentityCore } from "../three/IdentityCore";
import { LinkButton } from "./LinkButton";

const audiences = [
  "Service businesses",
  "Online stores",
  "Specialist commerce",
  "Personal brands",
];
const notes = [
  ["Strategy", "The right questions first."],
  ["Design", "Unmistakably yours."],
  ["Development", "Bringing the idea to life."],
];

/** Semantic first paint; the sculpture enhances the offer, never gates it. */
export function ImpressionHero() {
  const proof = projects.filter(
    (project) =>
      project.status === "LIVE" && project.image && project.caseStudy,
  );
  return (
    <section className="impression-hero" aria-labelledby="impression-title">
      <div className="impression-hero__grid">
        <div className="impression-hero__copy">
          <span className="impression-hero__eyebrow">
            Webora &mdash; Premium web design &amp; development studio
          </span>
          <h1 id="impression-title">
            Distinctive websites. <span>Built for your business.</span>
          </h1>
          <p className="impression-hero__description">
            Strategy, design and development for businesses ready for a stronger
            online presence. Considered from first impression to next enquiry.
          </p>
          <div className="impression-hero__actions">
            <LinkButton>Start a project</LinkButton>
            <Link className="impression-hero__work" to="/work">
              Explore the work <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <p className="impression-hero__for">
            <span>Built for</span>
            {audiences.map((audience) => (
              <span key={audience}>{audience}</span>
            ))}
          </p>
        </div>
        <div className="impression-hero__stage">
          <span className="impression-hero__object-label" aria-hidden="true">
            W / SCULPTED IDENTITY
          </span>
          <IdentityCore intro studio impression />
          {/* A gallery label under the sculpture: the three disciplines the
              description names, in the studio's own process language. */}
          <ol className="impression-hero__notes" aria-hidden="true">
            {notes.map(([discipline, line], index) => (
              <li key={discipline}>
                <span>
                  0{index + 1} {discipline}
                </span>
                {line}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div
        className="impression-hero__evidence"
        aria-label="Selected live website projects"
      >
        <p>
          Real businesses.
          <br />
          Work you can explore.
        </p>
        {proof.map((project) => (
          <Link
            className="impression-hero__project"
            key={project.slug}
            to={`/work/${project.slug}`}
          >
            <img
              src={assetUrl(project.image!)}
              width="80"
              height="56"
              alt=""
              decoding="async"
            />
            <span>
              <strong>{project.name}</strong>
              <small>{project.status} &middot; Website capture</small>
            </span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
