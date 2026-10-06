import { isMotionReduced } from "../lib/motionPreference";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import { LinkButton } from "../components/LinkButton";
import { services, process, engagements } from "../data/studio";
import { Spatial } from "../three/Spatial";
import { useReducedMotion } from "../hooks/useMotion";
import { Disclosure } from "../components/Disclosure";

function ServiceModel({
  active,
  mobile = false,
}: {
  active: number;
  mobile?: boolean;
}) {
  return (
    <div
      className={`services-spatial ${mobile ? "services-spatial-mobile" : "services-spatial-primary"}`}
    >
      <Spatial kind="services" active={active}>
        <div className="folded-fallback">
          <span />
          <span />
          <span />
          <span />
        </div>
      </Spatial>
    </div>
  );
}

export function ServicesSection() {
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = matchMedia("(max-width: 899px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <section className="section services-section" id="services">
      <div className="section-label">
        <span className="mono">02 / WHAT WE BUILD</span>
        <span className="mono">THOUGHTFULLY DESIGNED. PURPOSEFULLY BUILT.</span>
      </div>
      <div className="services-layout">
        <div className="services-intro" data-reveal>
          <h2>
            Your ambition.
            <br />
            <span>Our canvas.</span>
          </h2>
          <p>
            From a first digital home to a completely new kind of experience. We
            build around your business.
          </p>
          <div
            className={`service-sculpture shape-${active}`}
            aria-hidden="true"
          >
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
          {!compact && <ServiceModel active={active} />}
          <span className="mono sculpture-caption">
            ONE STUDIO. MANY POSSIBILITIES.
          </span>
        </div>
        <div className="service-list">
          {compact && <ServiceModel active={active} mobile />}
          {services.map((service, i) => (
            <div
              className={`service-row ${active === i ? "active" : ""}`}
              key={service.name}
            >
              <button
                aria-expanded={active === i}
                aria-controls={`service-${i}`}
                onClick={() => setActive(active === i ? -1 : i)}
              >
                <span className="mono">0{i + 1}</span>
                <h3>{service.name}</h3>
                {active === i ? <Minus size={18} /> : <Plus size={18} />}
              </button>
              <Disclosure id={`service-${i}`} open={active === i}>
                <p>{service.detail}</p>
                <small>{service.deliverables}</small>
                <LinkButton to="/start-project" secondary>
                  Let’s build it
                </LinkButton>
              </Disclosure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function ValueSection() {
  return (
    <section className="section value-section">
      <div className="value-spatial">
        <Spatial kind="fabric">
          <div className="fabric-fallback" />
        </Spatial>
      </div>
      <div className="section-label">
        <span className="mono">03 / MORE THAN A WEBSITE</span>
        <span className="value-dot" />
      </div>
      <div className="value-heading" data-reveal>
        <h2>
          Your website is
          <br />
          part of your
          <br />
          <span>sales process.</span>
        </h2>
        <p>
          It’s where first impressions become trust.
          <br />
          Where curiosity becomes clarity.
          <br />
          And where a visitor becomes your next customer.
        </p>
      </div>
      <div className="value-grid">
        {[
          [
            "01",
            "Make the right first impression",
            "Give customers a reason to feel confident in your business from the first click.",
          ],
          [
            "02",
            "Make your offer clear",
            "Help people understand what you do, who it’s for and why it matters.",
          ],
          [
            "03",
            "Give interest a direction",
            "Guide visitors towards an enquiry, a booking or a purchase with a clear next step.",
          ],
          [
            "04",
            "Keep your business present",
            "A distinctive digital home communicates your value around the clock.",
          ],
        ].map(([n, title, text]) => (
          <div key={n} data-reveal>
            <span className="mono">/{n}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export function PrinciplesSection() {
  return (
    <section className="section principles-section">
      <div className="section-label">
        <span className="mono">04 / THE WEBORA WAY</span>
        <span className="mono">DETAILS MAKE THE DIFFERENCE</span>
      </div>
      <div className="principles-heading" data-reveal>
        <h2>
          Built with intention.
          <br />
          <span>Down to the last pixel.</span>
        </h2>
        <p>
          Strong ideas. Thoughtful execution. A clear purpose behind every
          decision.
        </p>
      </div>
      <div className="principles-grid">
        {[
          [
            "Business first",
            "We understand the offer, the audience and the goal before opening a design file.",
          ],
          [
            "Distinctly yours",
            "Custom design with a point of view, shaped around your identity.",
          ],
          [
            "Every screen matters",
            "Responsive engineering for the devices your customers actually use.",
          ],
          [
            "Motion with meaning",
            "Interaction that guides attention and adds character.",
          ],
          [
            "Care in the details",
            "Typography, spacing and visual consistency make the experience feel complete.",
          ],
          [
            "Performance by design",
            "High-end visuals paired with considered loading and lighter alternatives.",
          ],
        ].map(([title, text], i) => (
          <div key={title}>
            <span className="mono">
              0{i + 1} <ArrowUpRight size={15} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export function ProcessSection() {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    if (reduced || isMotionReduced()) return;
    import("../lib/pageMotion")
      .then(({ ScrollTrigger }) => {
        if (cancelled) return;
        let last = -1;
        const trigger = ScrollTrigger.create({
          trigger: section.current,
          start: "top 38%",
          end: "bottom 65%",
          onUpdate: (self) => {
            const next = Math.min(5, Math.floor(self.progress * 6));
            // Keyboard/tab choices remain stable until the next actual scroll stage.
            if (next !== last) {
              last = next;
              if (!section.current?.contains(document.activeElement))
                setActive(next);
            }
          },
        });
        cleanup = () => trigger.kill();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);
  return (
    <section className="section process-section" id="process" ref={section}>
      <div className="section-label">
        <span className="mono">05 / FROM IDEA TO IMPACT</span>
        <span className="mono">A CLEAR PATH FORWARD</span>
      </div>
      <div className="process-heading">
        <h2>
          A good process.
          <br />
          <span>A better outcome.</span>
        </h2>
        <p>You’ll know where we are, what comes next and why it matters.</p>
      </div>
      <div className="process-layout">
        <div
          className="process-stages"
          role="tablist"
          aria-label="Project process"
        >
          {process.map(([name], i) => (
            <button
              key={name}
              id={`stage-${i}`}
              role="tab"
              aria-selected={active === i}
              aria-controls={`stage-panel-${i}`}
              tabIndex={active === i ? 0 : -1}
              className={active === i ? "active" : ""}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (
                  [
                    "ArrowRight",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowUp",
                    "Home",
                    "End",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 5
                        : (i +
                            (e.key === "ArrowRight" || e.key === "ArrowDown"
                              ? 1
                              : 5)) %
                          6;
                  setActive(next);
                  document.getElementById(`stage-${next}`)?.focus();
                }
              }}
            >
              <span className="mono">0{i + 1}</span>
              {name}
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
        <div
          className="process-panel"
          id={`stage-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`stage-${active}`}
          tabIndex={0}
        >
          <div className="process-spatial">
            <Spatial kind="process" active={active}>
              <svg viewBox="0 0 600 240">
                <path
                  d="M40 50L145 195 245 65 350 195 455 50 560 120"
                  fill="none"
                  stroke="#8f8bdf"
                  strokeWidth="2"
                />
                {[40, 145, 245, 350, 455, 560].map((x, i) => (
                  <circle
                    key={x}
                    cx={x}
                    cy={[50, 195, 65, 195, 50, 120][i]}
                    r={i === active ? 10 : 5}
                    fill={i === active ? "#c7baff" : "#626598"}
                  />
                ))}
              </svg>
            </Spatial>
          </div>
          <span className="process-number" aria-hidden="true">
            0{active + 1}
          </span>
          <div className="process-copy" key={active}>
            <span className="mono">{process[active][0].toUpperCase()}</span>
            <h3>{process[active][1]}</h3>
            <p>{process[active][2]}</p>
            <span className="mono">0{active + 1} — 06</span>
          </div>
        </div>
      </div>
    </section>
  );
}
export function EngagementsSection() {
  return (
    <section className="section engagements-section">
      <div className="section-label">
        <span className="mono">06 / A SCOPE THAT FITS</span>
        <span className="mono">YOUR BUSINESS SETS THE BRIEF</span>
      </div>
      <h2>
        The right starting point.
        <br />
        <span>Room to go further.</span>
      </h2>
      <div className="engagements">
        {engagements.map(([title, line, detail], i) => (
          <article key={title}>
            <span className="mono">0{i + 1}</span>
            <h3>{title}</h3>
            <div>
              <p>{line}</p>
              <small>{detail}</small>
            </div>
            <ArrowUpRight size={20} />
          </article>
        ))}
      </div>
      <div className="engagements-bottom">
        <p>
          Every Webora project is scoped around the business. Tell us what
          you’re building and we’ll recommend the right approach.
        </p>
        <LinkButton />
      </div>
    </section>
  );
}
