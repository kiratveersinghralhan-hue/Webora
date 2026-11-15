import { ImpressionHero } from "../components/ImpressionHero";
import {
  WorkChapter,
  ServicesChapter,
  ApproachChapter,
  ProcessChapter,
  ScopeChapter,
} from "../sections/ImpressionSections";

/**
 * Impression: the studio narrative leads. Seasonal gifts keep their own
 * route (navigation and footer), outside the core homepage story.
 */
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
