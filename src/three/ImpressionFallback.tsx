import { useId } from "react";

/** Local vector fallback, without WebGL, downloaded assets or animation. */
export function ImpressionFallback() {
  const id = useId();
  return (
    <svg viewBox="0 0 600 480" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0.8">
          <stop stopColor="#ece9e1" />
          <stop offset=".22" stopColor="#9c9991" />
          <stop offset=".48" stopColor="#302f2b" />
          <stop offset=".7" stopColor="#d4d1c9" />
          <stop offset="1" stopColor="#68665e" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor="#14130f" stopOpacity=".28" />
          <stop offset="1" stopColor="#14130f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="300" cy="397" rx="216" ry="34" fill={`url(#${id}-shadow)`} />
      <g transform="translate(98 74) rotate(-7 200 150)">
        <path
          d="M0 0L75 320H130L200 150L270 320H325L400 0H335L285 210L223 50H177L115 210L65 0Z"
          transform="translate(12 13)"
          fill="#25241f"
        />
        <path
          d="M0 0L75 320H130L200 150L270 320H325L400 0H335L285 210L223 50H177L115 210L65 0Z"
          fill={`url(#${id}-metal)`}
          stroke="#d5d1c6"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
