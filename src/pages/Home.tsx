import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../components/LinkButton";
import { Core } from "../three/Core";
import { Projects } from "../components/Projects";
import {
  ServicesSection,
  ValueSection,
  PrinciplesSection,
  ProcessSection,
  EngagementsSection,
} from "../sections/StudioSections";

export default function Home() {
  return (
    <div className="page-enter">
      <section className="hero">
        <div className="hero-topline mono">
          <span>
            <i className="status-dot" /> DESIGN FOR WHAT’S NEXT
          </span>
          <span>STRATEGY × DESIGN × DEVELOPMENT</span>
        </div>
        <div className="hero-content">
          <div className="hero-copy">
            <span className="eyebrow">
              A BETTER PRESENCE. A STRONGER BUSINESS.
            </span>
            <h1>
              Your business.
              <br />
              In a new
              <br />
              <span>dimension.</span>
            </h1>
            <p>
              Premium websites for businesses ready to look the part. Designed
              to earn trust. Built to turn interest into action.
            </p>
            <div className="hero-actions">
              <LinkButton />
              <LinkButton to="/work" secondary>
                View Selected Work
              </LinkButton>
            </div>
          </div>
          <div className="hero-scene" data-cursor="EXPLORE">
            <Core intro />
            <div className="scene-note mono">
              <span>FORM FOLLOWS AMBITION.</span>
              <span>DRAG TO EXPLORE / 360° ↗</span>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#work" className="scroll-link mono">
            <span className="scroll-icon">
              <ArrowDown size={16} />
            </span>
            SCROLL TO DISCOVER
          </a>
          <p>
            Independent minds.
            <br />
            Extraordinary digital experiences.
          </p>
          <span className="hero-edition mono">
            WEBORA / VOL. 01
            <br />
            EST. FOR THE FUTURE
          </span>
        </div>
        <div className="hero-brand" aria-hidden="true">
          WEBORA<span>✳</span>
        </div>
      </section>
      <section className="section work-section" id="work">
        <div className="section-label">
          <span className="mono">01 / SELECTED WEBSITES</span>
          <span className="mono">REAL BUSINESSES. DISTINCTIVE WORLDS.</span>
        </div>
        <div className="section-heading" data-reveal>
          <h2>
            Ideas made
            <br />
            <span>tangible.</span>
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
      <ServicesSection />
      <ValueSection />
      <PrinciplesSection />
      <ProcessSection />
      <EngagementsSection />
    </div>
  );
}
