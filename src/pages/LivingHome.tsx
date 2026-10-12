import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { IdentityCore } from "../three/IdentityCore";
import { LinkButton } from "../components/LinkButton";
import { Projects } from "../components/Projects";
import {
  ServicesSection,
  ValueSection,
  PrinciplesSection,
  ProcessSection,
  EngagementsSection,
} from "../sections/StudioSections";

/** The living studio: semantic business content with one shared spatial world. */
export function LivingHome() {
  return (
    <div className="page-enter living-home">
      <section className="hero living-hero" aria-labelledby="living-title">
        <div className="living-kicker">
          <span className="living-star" aria-hidden="true">
            ✳
          </span>
          <span>WEBORA — THE LIVING DIGITAL STUDIO</span>
        </div>
        <div className="hero-copy living-title">
          <h1 id="living-title">
            Distinct.
            <br />
            <em>By design.</em>
          </h1>
        </div>
        <div className="hero-scene living-scene">
          <div className="living-stage-light" aria-hidden="true" />
          <IdentityCore intro studio />
        </div>
        <div className="living-offer">
          <span className="living-caption">A STRONGER DIGITAL PRESENCE</span>
          <p>
            Extraordinary websites.
            <br />
            Built around your business.
          </p>
          <span className="living-description">
            Strategy, design and development.
            <br />
            From first impression to next enquiry.
          </span>
        </div>
        <div className="hero-actions living-invitation">
          <span>Have something in mind?</span>
          <LinkButton />
          <Link className="living-work-link" to="/work">
            Explore selected work <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="living-hero-foot">
          <a href="#work" className="scroll-link">
            <ArrowDown size={17} />
            <span>Step into the studio</span>
          </a>
          <span>INDEPENDENT THINKING. DISTINCTIVE WEBSITES.</span>
          <span className="living-drag-note">
            Drag the sculpture to explore ↔
          </span>
        </div>
      </section>
      <section className="living-manifesto" aria-label="Our approach">
        <span className="living-caption">THE WEBORA POINT OF VIEW</span>
        <p>
          Good design gets attention.
          <br />
          <em>Great design gives it a purpose.</em>
        </p>
        <span>
          We turn business ambition into a digital presence
          <br />
          that feels considered, distinctive and easy to use.
        </span>
      </section>
      <section className="section work-section living-work" id="work">
        <div className="section-label">
          <span className="mono">01 / SELECTED WEBSITES</span>
          <span className="mono">IDEAS OUT IN THE WORLD</span>
        </div>
        <div className="section-heading" data-reveal>
          <h2>
            Different businesses.
            <br />
            <em>Distinctive worlds.</em>
          </h2>
          <div>
            <p>
              Website work, from specialist commerce to service-led businesses.
              <br />
              Built, evolving and currently taking shape.
            </p>
            <Link className="text-link" to="/work">
              Explore the work <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <Projects />
      </section>
      <div className="living-chapters">
        <ServicesSection />
        <ValueSection />
        <PrinciplesSection />
        <ProcessSection />
        <EngagementsSection />
      </div>
    </div>
  );
}
