import type { Project } from "../data/studio";
import { assetUrl } from "../lib/site";
export function ProjectVisual({
  theme,
  mobile = false,
  project,
}: {
  theme: string;
  mobile?: boolean;
  project?: Project;
}) {
  if (project?.featured)
    return (
      <div className={`website-preview preview-${theme}`}>
        <div className="browser-bar" aria-hidden="true">
          <span>● ● ●</span>
          <span>
            {project.websiteUrl
              ? new URL(project.websiteUrl).hostname
              : `${project.name} / CURRENTLY BUILDING`}
          </span>
          <span>↗</span>
        </div>
        {project.image ? (
          <img
            src={assetUrl(project.image)}
            alt={`${project.name} — ${project.imageNote}`}
            width="1440"
            height="900"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="editorial-preview"
            role="img"
            aria-label="Article website in progress; project preview to follow"
          >
            <span className="mono">CURRENTLY BUILDING / 04</span>
            <strong>
              The next
              <br />
              <i>chapter.</i>
            </strong>
            <span className="mono">PROJECT PREVIEW TO FOLLOW</span>
          </div>
        )}
      </div>
    );
  return (
    <div
      className={`project-art ${theme} ${mobile ? "mobile-art" : ""}`}
      aria-label={`${theme === "architecture" ? "Architectural studio" : "Fashion storefront"} concept interface preview`}
      role="img"
    >
      <div className="art-nav">
        <b>{theme === "architecture" ? "form & field" : "OFF SCRIPT✳"}</b>
        <span>
          {theme === "architecture"
            ? "Spaces  /  Studio  /  Contact"
            : "Shop  /  Our story  /  Bag (0)"}
        </span>
      </div>
      {theme === "architecture" ? (
        <>
          <div className="architecture-type">
            Spaces for
            <br />
            <i>living.</i>
          </div>
          <div className="building">
            <div className="building-side" />
            <div className="building-face">
              <div className="window window-one" />
              <div className="window window-two" />
              <div className="window window-three" />
              <div className="balcony" />
            </div>
            <div className="building-roof" />
          </div>
          <div className="art-caption">
            THOUGHTFUL ARCHITECTURE. LASTING IMPACT.
            <span>Explore our spaces ↗</span>
          </div>
        </>
      ) : (
        <>
          <div className="fashion-type">
            OWN
            <br />
            <i>YOUR</i>
            <br />
            STORY.
          </div>
          <div className="shirt">
            <svg viewBox="0 0 360 390">
              <defs>
                <linearGradient
                  id={mobile ? "cloth-m" : "cloth"}
                  x1="0"
                  x2="1"
                  y1="0"
                  y2="1"
                >
                  <stop stopColor="#393a37" />
                  <stop offset=".5" stopColor="#131411" />
                  <stop offset="1" stopColor="#30312c" />
                </linearGradient>
              </defs>
              <path
                d="M104 40L32 90 6 161 78 183 90 144 78 356Q177 388 282 356L270 145 281 183 354 160 329 89 256 40 218 22Q180 65 142 22Z"
                fill={`url(#${mobile ? "cloth-m" : "cloth"})`}
              />
              <path
                d="M142 22Q181 67 218 22"
                fill="none"
                stroke="#62645a"
                strokeWidth="7"
              />
              <path
                d="M107 62l-10 244M252 62l9 250"
                stroke="#595a50"
                opacity=".3"
              />
              <text
                x="181"
                y="170"
                textAnchor="middle"
                fill="#d2ee81"
                fontFamily="sans-serif"
                fontSize="19"
                fontWeight="800"
              >
                OFF SCRIPT.
              </text>
              <text
                x="181"
                y="185"
                textAnchor="middle"
                fill="#a3a995"
                fontFamily="sans-serif"
                fontSize="6"
              >
                WEAR YOUR OWN NARRATIVE
              </text>
            </svg>
          </div>
          <div className="art-caption">
            INDEPENDENT BY DESIGN.<span>Discover the collection ↗</span>
          </div>
        </>
      )}
    </div>
  );
}
