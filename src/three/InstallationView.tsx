import { useId, useState } from "react";
import { assetUrl } from "../lib/site";
import { projects } from "../data/studio";

/** Designed static counterparts remain visible if WebGL/motion is unavailable. */
export function InstallationView({
  kind,
  active,
}: {
  kind: "services" | "process";
  active: number;
}) {
  const id = useId().replaceAll(":", "");
  const [turn, setTurn] = useState(0);
  const screenshot = projects.find(
    (project) => project.name === "Harvester Parts",
  )!.image!;
  return (
    <figure className={`installation installation-${kind}`}>
      <div
        className="installation-viewport"
        data-installation-kind={kind}
        data-active={Math.max(0, active)}
        data-turn={turn}
        aria-hidden="true"
      >
        <svg className="installation-still" viewBox="0 0 900 560">
          <defs>
            <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2=".7">
              <stop stopColor="#c5d2eb" />
              <stop offset=".3" stopColor="#667fae" />
              <stop offset=".65" stopColor="#15213c" />
              <stop offset="1" stopColor="#7f79c1" />
            </linearGradient>
            <linearGradient id={`${id}-dark`}>
              <stop stopColor="#273c61" />
              <stop offset="1" stopColor="#0b1427" />
            </linearGradient>
            <clipPath id={`${id}-screen`}>
              <rect x="222" y="110" width="436" height="268" rx="5" />
            </clipPath>
          </defs>
          {kind === "services" ? (
            <g
              transform={`translate(${active % 2 ? 20 : 0} 0) rotate(${active % 2 ? 3 : -3} 450 280)`}
            >
              <path
                d="M130 440L610 408 785 465 305 515Z"
                fill={`url(#${id}-dark)`}
                stroke="#6778b3"
              />
              <path
                d="M305 515L785 465 785 482 305 532 130 455 130 440Z"
                fill="#0a1121"
              />
              <path
                d="M380 380L425 240 475 240 520 430 476 436 447 313 420 418Z"
                fill={`url(#${id}-metal)`}
              />
              <path
                d="M210 98L673 98 697 115 697 398 674 410 210 394Z"
                fill={`url(#${id}-dark)`}
              />
              <rect
                x="210"
                y="98"
                width="460"
                height="292"
                rx="12"
                fill={`url(#${id}-metal)`}
              />
              <image
                href={assetUrl(screenshot)}
                x="222"
                y="110"
                width="436"
                height="268"
                preserveAspectRatio="xMidYMin slice"
                clipPath={`url(#${id}-screen)`}
              />
              <path
                d="M665 270L749 255 770 268 770 458 688 478 665 465Z"
                fill={`url(#${id}-metal)`}
              />
              <path
                d="M676 280L746 268 746 448 690 463 676 452Z"
                fill="#1b2e52"
              />
              <path
                d="M700 295L733 290M690 330L733 322M690 352L733 343M690 375L733 365"
                stroke="#b8bfe9"
                strokeWidth="5"
              />
            </g>
          ) : (
            <g transform="translate(30 30)">
              <path
                d="M130 375L610 300 810 405 325 490Z"
                fill={`url(#${id}-dark)`}
                stroke="#566e9a"
              />
              <path
                d="M130 375L325 490 810 405 810 426 325 510 130 395Z"
                fill="#0b1221"
              />
              {Array.from({ length: 6 }, (_, i) => (
                <g
                  key={i}
                  transform={`translate(${170 + i * 87} ${i === active ? -36 : 0})`}
                >
                  <path
                    d={`M0 ${165 - i * 9}L45 ${135 - i * 9} 100 ${345 - i * 9} 50 ${378 - i * 9}Z`}
                    fill={`url(#${id}-metal)`}
                    stroke={i === active ? "#d7c9ff" : "#7d90b2"}
                    strokeWidth="2"
                  />
                  <path
                    d={`M45 ${135 - i * 9}L63 ${149 - i * 9} 119 ${356 - i * 9} 100 ${345 - i * 9}Z`}
                    fill="#43567c"
                  />
                  <path
                    d={`M50 ${378 - i * 9}L100 ${345 - i * 9} 119 ${356 - i * 9} 69 ${390 - i * 9}Z`}
                    fill="#0e172b"
                  />
                  <text
                    x="41"
                    y={220 - i * 9}
                    fill="#e1e8fa"
                    fontSize="16"
                    transform={`rotate(-15 41 ${220 - i * 9})`}
                  >
                    0{i + 1}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
      <figcaption>
        <span>
          {kind === "services"
            ? "RESPONSIVE CONSTRUCTION"
            : "SIX PARTS. ONE DIRECTION."}
        </span>
        <button
          className="installation-turn"
          onClick={() => setTurn((value) => value + 1)}
          aria-label={`Rotate ${kind} installation`}
        >
          Inspect the form ↻
        </button>
      </figcaption>
      {kind === "services" && (
        <small className="installation-source">
          Harvester Parts & Gloss Boss · existing actual website captures.
          Static artwork shown when 3D is unavailable.
        </small>
      )}
    </figure>
  );
}
