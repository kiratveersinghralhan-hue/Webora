import { useId } from "react";

/** Local vector fallback, without WebGL, downloaded assets or animation. */
export function ImpressionFallback() {
  const id = useId();
  return (
    <svg viewBox="0 0 600 480" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0.8">
          <stop stopColor="#f6e2b4" />
          <stop offset=".22" stopColor="#a87a34" />
          <stop offset=".48" stopColor="#3a2610" />
          <stop offset=".7" stopColor="#e2b86a" />
          <stop offset="1" stopColor="#6a4a1c" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor="#ff9a3c" stopOpacity=".28" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-flame`} cx=".5" cy=".75" r=".7">
          <stop stopColor="#fff6d8" />
          <stop offset=".4" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#ff7a1f" />
        </radialGradient>
      </defs>
      <ellipse cx="300" cy="397" rx="216" ry="34" fill={`url(#${id}-shadow)`} />
      <g transform="translate(98 74) rotate(-7 200 150)">
        <path
          d="M0 0L75 320H130L200 150L270 320H325L400 0H335L285 210L223 50H177L115 210L65 0Z"
          transform="translate(12 13)"
          fill="#24170b"
        />
        <path
          d="M0 0L75 320H130L200 150L270 320H325L400 0H335L285 210L223 50H177L115 210L65 0Z"
          fill={`url(#${id}-metal)`}
          stroke="#d9b06a"
          strokeWidth="1.5"
        />
      </g>
      {/* Diwali Edition: three static clay diyas at the sculpture's base. */}
      {[
        [150, 404, 0.9],
        [300, 424, 1],
        [450, 404, 0.9],
      ].map(([x, y, scale]) => (
        <g
          key={x}
          transform={`translate(${x} ${y}) scale(${scale})`}
          className="impression-fallback__diya"
        >
          <path
            d="M-31 -4C-27 11 5 17 18 5L30 -6C19 -3 -5 -1 -31 -4Z"
            fill="#8c3d1d"
          />
          <path
            d="M-31 -4C-5 -1 19 -3 30 -6C20 -8 -5 -8 -31 -4Z"
            fill="#3a1408"
          />
          <path
            d="M27.5 -29C31.5 -22 33 -16.5 27.5 -11C22 -16.5 23.5 -22 27.5 -29Z"
            fill={`url(#${id}-flame)`}
          />
        </g>
      ))}
    </svg>
  );
}
