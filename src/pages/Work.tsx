import { Projects } from "../components/Projects";
import { LinkButton } from "../components/LinkButton";
export default function Work() {
  return (
    <div className="page-enter">
      <section className="page-heading section">
        <span className="eyebrow">WORK / WEBSITES WITH A POINT OF VIEW</span>
        <h1>
          Different businesses.
          <br />
          <span>Distinctive worlds.</span>
        </h1>
        <p>
          A focused collection of websites and commerce experiences. Explore
          live websites, ongoing builds and a clearly labelled website concept
          archive.
        </p>
      </section>
      <section className="section work-page">
        <Projects archive />
        <div className="work-end">
          <h2>
            Your business could
            <br />
            be our next chapter.
          </h2>
          <LinkButton />
        </div>
      </section>
    </div>
  );
}
