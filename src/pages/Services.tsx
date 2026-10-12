import {
  ServicesSection,
  EngagementsSection,
  ProcessSection,
} from "../sections/StudioSections";
import { useV2Experience } from "../lib/experience";
import { InstallationRouteStage } from "../three/InstallationRouteStage";
export default function Services() {
  const experimental = useV2Experience();
  return (
    <div className="page-enter">
      {experimental && <InstallationRouteStage />}
      <section className="section page-heading">
        <span className="eyebrow">SERVICES / MADE AROUND YOUR BUSINESS</span>
        <h1>
          Good design.
          <br />
          <span>Real purpose.</span>
        </h1>
        <p>
          We connect strategy, identity and thoughtful development to create
          websites that make your business easier to understand, trust and
          choose.
        </p>
      </section>
      <ServicesSection />
      <EngagementsSection />
      <ProcessSection />
    </div>
  );
}
