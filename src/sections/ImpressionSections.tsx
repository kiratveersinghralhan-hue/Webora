import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { services, process, engagements } from "../data/studio";
import { LinkButton } from "../components/LinkButton";
import { Projects } from "../components/Projects";

/** Chapter numbers come from a CSS counter, so each route numbers in order. */
function ChapterLabel({ children }: { children: string }) {
  return (
    <div className="v3-label" data-rise>
      <span aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function WorkChapter() {
  return (
    <section
      className="v3-chapter v3-work"
      id="work"
      aria-labelledby="v3-work-title"
    >
      <ChapterLabel>Selected work</ChapterLabel>
      <div className="v3-heading">
        <h2 id="v3-work-title" data-rise>
          Websites with a point of view. <span>Out in the world.</span>
        </h2>
        <div data-rise>
          <p>
            Live websites and builds in progress, from specialist commerce to
            service-led businesses. Drag, swipe or use the arrows to browse.
          </p>
          <Link className="v3-link" to="/work">
            All work <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div data-rise>
        <Projects />
      </div>
    </section>
  );
}

export function ServicesChapter() {
  return (
    <section
      className="v3-chapter v3-services"
      id="services"
      aria-labelledby="v3-services-title"
    >
      <ChapterLabel>What we build</ChapterLabel>
      <div className="v3-services__grid">
        <div className="v3-services__intro">
          <h2 id="v3-services-title" data-rise>
            A digital presence, <span>built around you.</span>
          </h2>
          <p data-rise>
            From a first digital home to a completely new kind of experience.
            Every engagement starts with the business, then the design.
          </p>
          <div data-rise>
            <LinkButton>Discuss your project</LinkButton>
          </div>
        </div>
        <ol className="v3-services__list">
          {services.map((service, i) => (
            <li key={service.name} data-rise>
              <span className="v3-services__number">0{i + 1}</span>
              <div>
                <h3>{service.name}</h3>
                <p>{service.detail}</p>
                <small>{service.deliverables}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const outcomes = [
  [
    "Make the right first impression",
    "Give customers a reason to feel confident in your business from the first click.",
  ],
  [
    "Make your offer clear",
    "Help people understand what you do, who it’s for and why it matters.",
  ],
  [
    "Give interest a direction",
    "Guide visitors towards an enquiry, a booking or a purchase with a clear next step.",
  ],
  [
    "Keep your business present",
    "A distinctive digital home communicates your value around the clock.",
  ],
];
const principles = [
  "Business first",
  "Distinctly yours",
  "Every screen matters",
  "Motion with meaning",
  "Care in the details",
  "Performance by design",
];

export function ApproachChapter() {
  return (
    <section
      className="v3-chapter v3-approach"
      aria-labelledby="v3-approach-title"
    >
      <ChapterLabel>More than a website</ChapterLabel>
      <div className="v3-approach__statement">
        <h2 id="v3-approach-title" data-rise>
          Your website is part of your <em>sales process.</em>
        </h2>
        <p data-rise>
          It’s where first impressions become trust, where curiosity becomes
          clarity, and where a visitor becomes your next customer.
        </p>
      </div>
      <ol className="v3-approach__outcomes">
        {outcomes.map(([title, text], i) => (
          <li key={title} data-rise>
            <span>0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <div className="v3-approach__principles" data-rise>
        <span>The Webora way</span>
        <ul>
          {principles.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ProcessChapter() {
  return (
    <section
      className="v3-chapter v3-process"
      id="process"
      aria-labelledby="v3-process-title"
    >
      <ChapterLabel>From idea to launch</ChapterLabel>
      <div className="v3-heading">
        <h2 id="v3-process-title" data-rise>
          Considered in stages. <span>Connected by design.</span>
        </h2>
        <p data-rise>
          You’ll always know where we are, what comes next and why it matters.
        </p>
      </div>
      <ol className="v3-process__steps">
        {process.map(([name, title, detail], i) => (
          <li key={name} data-rise>
            <span className="v3-process__number" aria-hidden="true">
              0{i + 1}
            </span>
            <span className="v3-process__name">{name}</span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </li>
        ))}
      </ol>
      {/* The natural next step after reading the process: step 01 itself. */}
      <div className="v3-process__next" data-rise>
        <p>
          <strong>Every project begins with Discover.</strong> Tell us about
          your business and goals in a short, six-step brief.
        </p>
        <LinkButton>Start your brief</LinkButton>
      </div>
    </section>
  );
}

export function ScopeChapter() {
  return (
    <section className="v3-chapter v3-scope" aria-labelledby="v3-scope-title">
      <ChapterLabel>A scope that fits</ChapterLabel>
      <div className="v3-heading">
        <h2 id="v3-scope-title" data-rise>
          The right starting point. <span>Room to go further.</span>
        </h2>
      </div>
      <ol className="v3-scope__list">
        {engagements.map(([title, line, detail], i) => (
          <li key={title} data-rise>
            <span>0{i + 1}</span>
            <h3>{title}</h3>
            <p>
              <strong>{line}</strong> {detail}
            </p>
          </li>
        ))}
      </ol>
      <div className="v3-scope__cta" data-rise>
        <p>
          Every Webora project is scoped around the business. Tell us what
          you’re building and we’ll recommend the right approach.
        </p>
        <LinkButton />
      </div>
    </section>
  );
}
