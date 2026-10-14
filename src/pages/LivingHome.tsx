import { ImpressionHero } from "../components/ImpressionHero";
import {
  WorkChapter,
  ServicesChapter,
  ApproachChapter,
  ProcessChapter,
  ScopeChapter,
} from "../sections/ImpressionSections";

/** Impression: semantic business chapters around one sculpted identity. */
export function LivingHome() {
  return (
    <div className="page-enter living-home v3-home">
      <ImpressionHero />
      <WorkChapter />
      <ServicesChapter />
      <ApproachChapter />
      <ProcessChapter />
      <ScopeChapter />
    </div>
  );
}
