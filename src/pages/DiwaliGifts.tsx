import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  GiftCard,
  GiftComparison,
  GiftPreview,
  Rangoli,
  Sparks,
} from "../components/Diwali";
import { LinkButton } from "../components/LinkButton";
import { diwaliEdition, giftPackages } from "../data/diwali";

const steps = [
  [
    "Choose an edition",
    "Pick the edition that fits the story, from a single lit page to a keepsake world.",
  ],
  [
    "Share the memories",
    "Send photographs, names, dates and the words you want to say. We help shape the story.",
  ],
  [
    "Preview in under 60 minutes",
    "After our discussion and once work starts, review a preview shaped around your memories.",
  ],
  [
    "Your gift within 90 minutes",
    "Receive your finished gift website within 90 minutes of work starting, ready to share on WhatsApp or reveal in person.",
  ],
];

export default function DiwaliGifts() {
  return (
    <div className="page-enter dw-page">
      <section
        className="section page-heading dw-hero"
        aria-labelledby="dw-title"
      >
        <Rangoli className="dw-hero__rangoli" />
        <Sparks />
        <span className="eyebrow">
          {diwaliEdition.name} / Personal gift websites
        </span>
        <h1 id="dw-title">
          Some memories deserve <span>their own light.</span>
        </h1>
        <p>
          Give a personal website made from your photographs and words, for
          birthdays, anniversaries, festivals and the people you love. After we
          discuss your idea and start work, see your preview in under 60 minutes
          and receive your finished gift website within 90 minutes.
        </p>
        <div className="dw-hero__actions">
          <a className="button" href="#editions">
            <span>See the three editions</span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </a>
          <a className="v3-link" href="#sample">
            Try a sample page <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section
        className="v3-chapter dw-editions"
        id="editions"
        aria-labelledby="dw-editions-title"
      >
        <div className="v3-label" data-rise>
          <span aria-hidden="true" />
          <span>Three editions</span>
        </div>
        <div className="v3-heading">
          <h2 id="dw-editions-title" data-rise>
            One lamp, three lamps, <span>or five.</span>
          </h2>
          <p data-rise>
            Every edition is designed for one person and one story. Choose how
            much of the story you want to tell.
          </p>
        </div>
        <div className="dw-cards">
          {giftPackages.map((gift, i) => (
            <GiftCard gift={gift} index={i} key={gift.id} />
          ))}
        </div>
      </section>

      <section
        className="v3-chapter dw-sample"
        id="sample"
        aria-labelledby="dw-sample-title"
      >
        <div className="v3-label" data-rise>
          <span aria-hidden="true" />
          <span>A sample, lit</span>
        </div>
        <div className="v3-heading">
          <h2 id="dw-sample-title" data-rise>
            The moment it opens. <span>That is the gift.</span>
          </h2>
        </div>
        <GiftPreview />
      </section>

      <section className="v3-chapter dw-how" aria-labelledby="dw-how-title">
        <div className="v3-label" data-rise>
          <span aria-hidden="true" />
          <span>How it works</span>
        </div>
        <div className="v3-heading">
          <h2 id="dw-how-title" data-rise>
            Simple for you. <span>Considered by us.</span>
          </h2>
        </div>
        <ol className="dw-steps">
          {steps.map(([title, text], i) => (
            <li key={title} data-rise>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="v3-chapter dw-compare-chapter"
        aria-labelledby="dw-compare-title"
      >
        <div className="v3-label" data-rise>
          <span aria-hidden="true" />
          <span>Compare editions</span>
        </div>
        <div className="v3-heading">
          <h2 id="dw-compare-title" data-rise>
            Side by side. <span>No surprises.</span>
          </h2>
        </div>
        <GiftComparison />
      </section>

      <section className="v3-chapter dw-close" aria-labelledby="dw-close-title">
        <div className="dw-close__inner" data-rise>
          <h2 id="dw-close-title">
            Start a Memory Gift. <span>We’ll take it from there.</span>
          </h2>
          <p>
            Tell us who it’s for and which edition you have in mind. We’ll reply
            with the next steps and what to send us.
          </p>
          <div className="dw-close__actions">
            <LinkButton to="/start-project?gift=our-story">
              Start a Memory Gift
            </LinkButton>
            <Link className="v3-link" to="/services">
              Looking for a business website?{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
