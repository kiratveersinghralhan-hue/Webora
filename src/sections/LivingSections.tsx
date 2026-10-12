import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { services, process } from "../data/studio";
import { Disclosure } from "../components/Disclosure";
import { LinkButton } from "../components/LinkButton";
import { InstallationView } from "../three/InstallationView";

export function LivingServices({
  active,
  select,
}: {
  active: number;
  select: (value: number) => void;
}) {
  return (
    <section
      className="section services-section installation-services-section"
      id="services"
    >
      <div className="section-label">
        <span className="mono">02 / WHAT WE BUILD</span>
        <span className="mono">FORM FOLLOWS YOUR AMBITION</span>
      </div>
      <div className="installation-section-heading" data-reveal>
        <h2>
          A digital presence.
          <br />
          <em>Built around you.</em>
        </h2>
        <p>
          From a first digital home to a completely new kind of experience. We
          build around your business.
        </p>
      </div>
      <div className="installation-services-layout">
        <InstallationView kind="services" active={active} />
        <div className="service-list">
          {services.map((service, i) => (
            <div
              className={`service-row ${active === i ? "active" : ""}`}
              key={service.name}
            >
              <button
                aria-expanded={active === i}
                aria-controls={`service-${i}`}
                onClick={() => select(active === i ? -1 : i)}
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

export function LivingProcess({
  active,
  select,
  sectionRef,
}: {
  active: number;
  select: (value: number) => void;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      className="section process-section installation-process-section"
      id="process"
      ref={sectionRef}
    >
      <div className="section-label">
        <span className="mono">05 / FROM IDEA TO IMPACT</span>
        <span className="mono">A CLEAR PATH FORWARD</span>
      </div>
      <div className="installation-section-heading">
        <h2>
          Considered in stages.
          <br />
          <em>Connected by design.</em>
        </h2>
        <p>You’ll know where we are, what comes next and why it matters.</p>
      </div>
      <InstallationView kind="process" active={active} />
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
            onClick={() => select(i)}
            onKeyDown={(event) => {
              if (
                ![
                  "ArrowRight",
                  "ArrowDown",
                  "ArrowLeft",
                  "ArrowUp",
                  "Home",
                  "End",
                ].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? 5
                    : (i +
                        (["ArrowRight", "ArrowDown"].includes(event.key)
                          ? 1
                          : 5)) %
                      6;
              select(next);
              document.getElementById(`stage-${next}`)?.focus();
            }}
          >
            <span className="mono">0{i + 1}</span>
            {name}
            <ArrowUpRight size={15} />
          </button>
        ))}
      </div>
      {process.map(([name, title, detail], i) => (
        <div
          key={name}
          className="installation-process-copy"
          id={`stage-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`stage-${i}`}
          tabIndex={0}
          hidden={i !== active}
        >
          <span className="installation-stage-index">
            0{i + 1}
            <small>/ 06</small>
          </span>
          <div className="process-copy">
            <span className="mono">{name.toUpperCase()}</span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
