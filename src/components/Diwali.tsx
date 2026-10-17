import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import {
  diwaliEdition,
  giftComparison,
  giftPackages,
  type GiftPackage,
} from "../data/diwali";
import { track } from "../lib/analytics";

const giftLink = (gift: GiftPackage) => `/start-project?gift=${gift.id}`;

/** Procedural rangoli: concentric petal rings that draw themselves in once. */
export function Rangoli({ className = "" }: { className?: string }) {
  const ring = (count: number, radius: number, size: number, offset = 0) =>
    Array.from({ length: count }, (_, i) => {
      const angle = (360 / count) * i + offset;
      return (
        <path
          key={`${radius}-${i}`}
          pathLength={1}
          transform={`rotate(${angle}) translate(0 ${-radius})`}
          d={`M0 ${size} C${size * 0.62} ${size * 0.35} ${size * 0.42} ${-size * 0.55} 0 ${-size} C${-size * 0.42} ${-size * 0.55} ${-size * 0.62} ${size * 0.35} 0 ${size}Z`}
        />
      );
    });
  return (
    <svg
      className={`dw-rangoli ${className}`}
      viewBox="-200 -200 400 400"
      aria-hidden="true"
      focusable="false"
    >
      <g className="dw-rangoli__outer">
        <circle r="186" pathLength={1} />
        {Array.from({ length: 48 }, (_, i) => (
          <circle
            key={i}
            className="dw-rangoli__dot"
            r={i % 2 ? 2 : 3.4}
            transform={`rotate(${7.5 * i}) translate(0 -172)`}
          />
        ))}
      </g>
      <g className="dw-rangoli__petals">{ring(16, 142, 22, 11.25)}</g>
      <g className="dw-rangoli__petals dw-rangoli__petals--wide">
        {ring(8, 92, 40)}
      </g>
      <circle className="dw-rangoli__line" r="118" pathLength={1} />
      <g className="dw-rangoli__petals">{ring(8, 40, 22, 22.5)}</g>
      <circle className="dw-rangoli__line" r="16" pathLength={1} />
      <circle className="dw-rangoli__dot" r="5" />
    </svg>
  );
}

/** A few warm embers that rise for a short while, then rest (finite motion). */
export function Sparks({ count = 12 }: { count?: number }) {
  return (
    <span className="dw-sparks" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--x": `${(i * 37) % 100}%`,
              "--d": `${(i * 0.53) % 3.2}s`,
              "--t": `${3.4 + ((i * 7) % 5) * 0.45}s`,
              "--s": `${2 + (i % 3)}px`,
              "--drift": `${((i * 13) % 30) - 15}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

/** Side-view clay diya. `lit` toggles the flame; CSS animates the change. */
export function DiyaIcon({
  lit = true,
  className = "",
}: {
  lit?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      className={`dw-diya ${lit ? "is-lit" : ""} ${className}`}
      viewBox="0 0 72 52"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-clay`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#c0602d" />
          <stop offset=".55" stopColor="#8c3d1d" />
          <stop offset="1" stopColor="#5a2410" />
        </linearGradient>
        <radialGradient id={`${id}-flame`} cx=".5" cy=".75" r=".7">
          <stop stopColor="#fff6d8" />
          <stop offset=".35" stopColor="#ffd27a" />
          <stop offset=".75" stopColor="#ff8a2a" />
          <stop offset="1" stopColor="#ff6a1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="#ffb35c" stopOpacity=".55" />
          <stop offset="1" stopColor="#ff8a2a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        className="dw-diya__glow"
        cx="58"
        cy="18"
        r="18"
        fill={`url(#${id}-glow)`}
      />
      <path
        d="M5 29C9 44 41 50 54 38L66 27C55 30 31 32 5 29Z"
        fill={`url(#${id}-clay)`}
      />
      <path d="M5 29C31 32 55 30 66 27C56 25 31 25 5 29Z" fill="#3a1408" />
      <path
        d="M14 37C27 41 41 41 51 37"
        stroke="#e0b25a"
        strokeWidth="1.3"
        strokeDasharray="1.5 3.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60 28L63 23"
        stroke="#efe2c4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className="dw-diya__flame"
        d="M63.5 4C67.5 11 69 16.5 63.5 22C58 16.5 59.5 11 63.5 4Z"
        fill={`url(#${id}-flame)`}
      />
    </svg>
  );
}

function Lamps({ count }: { count: number }) {
  return (
    <span className="dw-lamps" aria-label={`${count} of 5 lamps`}>
      {Array.from({ length: 5 }, (_, i) => (
        <DiyaIcon key={i} lit={i < count} />
      ))}
    </span>
  );
}

export function GiftCard({
  gift,
  index,
  compact = false,
}: {
  gift: GiftPackage;
  index: number;
  compact?: boolean;
}) {
  return (
    <article
      className={`dw-card dw-card--${gift.id}`}
      aria-labelledby={`gift-${gift.id}`}
      data-rise
    >
      <div className="dw-card__head">
        <span className="dw-card__number">0{index + 1}</span>
        <Lamps count={gift.lamps} />
      </div>
      <h3 id={`gift-${gift.id}`}>{gift.name}</h3>
      <p className="dw-card__price">
        <strong>{gift.price}</strong>
        <span>one-time</span>
      </p>
      <p className="dw-card__tagline">{gift.tagline}</p>
      {!compact && <p className="dw-card__story">{gift.story}</p>}
      <ul className="dw-card__includes">
        {(compact ? gift.includes.slice(0, 3) : gift.includes).map((item) => (
          <li key={item}>
            <Check size={15} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <p className="dw-card__ideal">
        <span>Made for</span> {gift.idealFor}
      </p>
      <Link
        className="dw-card__cta"
        to={giftLink(gift)}
        data-cursor="GO"
        onClick={() =>
          track("gift_package_selected", { gift: gift.id, from: "card" })
        }
      >
        <span>Gift {gift.name}</span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </article>
  );
}

/** Interactive sample: choose an edition, light its diya, read the page. */
export function GiftPreview() {
  const [selected, setSelected] = useState(giftPackages[1].id);
  const [lit, setLit] = useState(false);
  const gift = giftPackages.find((g) => g.id === selected)!;
  return (
    <div className="dw-preview" data-rise>
      <div className="dw-preview__controls">
        <span className="dw-kicker">Try a sample page</span>
        <div
          className="dw-preview__tabs"
          role="group"
          aria-label="Sample edition"
        >
          {giftPackages.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === selected}
              onClick={() => {
                setSelected(option.id);
                setLit(false);
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
        <p>
          Each Memory Gift opens like this: a lamp waits for the person you made
          it for. Light it to see a fictional sample of the{" "}
          <strong>{gift.name}</strong> edition.
        </p>
        <p className="dw-preview__note">
          Sample names and memories are illustrative only.
        </p>
      </div>
      <div
        className={`dw-phone ${lit ? "is-lit" : ""} dw-phone--${gift.id}`}
        aria-live="polite"
      >
        <div className="dw-phone__screen">
          <span className="dw-phone__edition">
            {diwaliEdition.greeting} · {gift.name}
          </span>
          <button
            type="button"
            className="dw-phone__lamp"
            aria-pressed={lit}
            onClick={() => setLit(!lit)}
          >
            <DiyaIcon lit={lit} />
            <span>{lit ? "Lamp lit" : "Tap to light the diya"}</span>
          </button>
          <h4>{gift.sample.title}</h4>
          {lit && (
            <ol className="dw-phone__lines">
              {gift.sample.lines.map((line, i) => (
                <li key={line} style={{ "--i": i } as React.CSSProperties}>
                  {line}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export function GiftComparison() {
  return (
    <>
      <p className="dw-compare-hint">Swipe the table to compare all three →</p>
      <div
        className="dw-compare"
        data-rise
        tabIndex={0}
        aria-label="Edition comparison table, scrollable"
      >
        <table>
          <caption className="sr-only">Memory Gift editions compared</caption>
          <thead>
            <tr>
              <th scope="col">Included</th>
              {giftPackages.map((gift) => (
                <th scope="col" key={gift.id}>
                  {gift.name}
                  <span>{gift.price}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {giftComparison.map(([feature, ...values]) => (
              <tr key={feature}>
                <th scope="row">{feature}</th>
                {values.map((value, i) => (
                  <td key={i}>
                    {value === true ? (
                      <Check size={17} aria-label="Included" />
                    ) : value === false ? (
                      <Minus size={17} aria-label="Not included" />
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Homepage chapter: the seasonal offer, beside (not instead of) the studio. */
export function GiftsChapter() {
  return (
    <section
      className="v3-chapter dw-chapter"
      id="diwali-gifts"
      aria-labelledby="dw-home-title"
    >
      <div className="v3-label" data-rise>
        <span aria-hidden="true" />
        <span>Diwali Edition · Memory Gifts</span>
      </div>
      <Rangoli className="dw-chapter__rangoli" />
      <div className="v3-heading">
        <h2 id="dw-home-title" data-rise>
          This Diwali, gift a memory. <span>Lit for the people you love.</span>
        </h2>
        <div data-rise>
          <p>
            A personal website made from your photographs and words, designed
            with the same care as our business work. Three editions, from a
            single lit page to a keepsake world.
          </p>
          <Link className="v3-link" to={diwaliEdition.route}>
            Explore Memory Gifts <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="dw-cards">
        {giftPackages.map((gift, i) => (
          <GiftCard gift={gift} index={i} key={gift.id} compact />
        ))}
      </div>
    </section>
  );
}
