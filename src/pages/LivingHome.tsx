import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ImpressionHero } from "../components/ImpressionHero";
import "../styles/v3-tokens.css";
import "../styles/v3-hero.css";
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
      <ImpressionHero />
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
