import { Core } from "../three/Core";
import { PrinciplesSection, ProcessSection } from "../sections/StudioSections";
import { LinkButton } from "../components/LinkButton";
import { useV2Experience } from "../lib/experience";
import { IdentityCore } from "../three/IdentityCore";
import {
  ApproachChapter,
  ProcessChapter,
} from "../sections/ImpressionSections";
export default function Studio() {
  const experimental = useV2Experience();
  return (
    <div className="page-enter">
      <section className="section page-heading studio-intro">
        <div>
          <span className="eyebrow">THE STUDIO / A CLEAR POINT OF VIEW</span>
          <h1>
            Small details.
            <br />
            <span>Big impression.</span>
          </h1>
          <p>
            Webora is an independent web design studio creating premium digital
            experiences for businesses with ambition.
          </p>
          <p>
            We believe a website should express who you are and help your
            customers take the next step. The best experiences do both
            beautifully.
          </p>
          <div className="studio-ai" data-reveal>
            <span className="mono">DESIGN × CODE × AI</span>
            <p>
              Human direction. AI-assisted development. We combine design
              judgment, frontend engineering and interactive development with
              AI-assisted workflows to prototype faster and explore more
              ambitious ideas. Every detail is shaped, reviewed and tested by
              people.
            </p>
          </div>
          <LinkButton />
        </div>
        {experimental ? (
          <div className="v3-studio-stage">
            <IdentityCore intro={false} studio impression />
          </div>
        ) : (
          <Core small />
        )}
      </section>
      {experimental ? (
        <>
          <ApproachChapter />
          <ProcessChapter />
        </>
      ) : (
        <>
          <PrinciplesSection />
          <ProcessSection />
        </>
      )}
    </div>
  );
}
