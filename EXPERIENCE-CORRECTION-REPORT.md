# WEBORA experience correction — 6 October 2026

Continued the current working tree and verified the production preview on port 4173.
No commit, push, deployment or real Formspree submission. The earlier reports describe
earlier passes; this report records the correction requested after manual review.

## Root cause

The actual in-app preview reported `prefers-reduced-motion: reduce`. Inspection found
zero canvases, no Lenis class/runtime, no intro and the static gallery. Existing JS and
CSS both suppressed enhancement. That accessibility default was retained, with an
explicit **Enable 3D experience** choice and a loopback-only replay override. Lenis
also independently respects the OS preference by default; the application now owns
that decision, so the explicit opt-in enables scrolling as well as the canvas.

Other visible issues were corrected:

- Session reuse skipped the intro with no convenient local replay.
- The earlier hero exit shifted DOM copy modestly and used only small camera offsets.
- The process used tiny nodes/thin geometry, and service forms occupied too little space.
- Neighboring project frames were almost parallel to the active screen.
- An inherited `nth-child(2)` background covered VEYRATH's WebGL screen.
- The scrolling decorative wordmark could cover Discover and intercept its clicks.
- Hash navigation recalculated before lazy gallery pinning changed page height.
- Phone service changes could happen after the sculpture had scrolled out of view.

## Intro

Replay locally at **http://127.0.0.1:4173/?intro=1** (also works on localhost/dev port).
The override is restricted to loopback hosts, works in the production preview build,
and represents an explicit motion preview even when the OS requests reduced motion.
Production hosts ignore the replay query. No storage clearing is necessary.

The first capable fresh session presents a near-black identity screen, triangulated
extruded W fragments, assembly, rotation, sweeping key light and resolving WEBORA /
WEB DESIGN STUDIO / DESIGN × DEVELOPMENT × AI. It runs at most 2.9 seconds, offers
Skip, and retains the same canvas as the object moves into the hero. The navigation
is hidden during the intro. Ordinary same-session navigation/reload skips it.
The reduced-motion default and unavailable-WebGL fallback remain usable.

Proof: `qa/correction-intro.png`, `qa/correction-intro-mobile.png`.

## 3D

- **Core:** thicker beveled W, rear extrusion, separate brackets, beams and depth planes.
  Pointer moves light/camera and weighted yaw/pitch. Dragging supports complete turns,
  release inertia, a damped resting pose and keyboard rotate/reset controls.
- **Screens:** actual Three.js chassis, rims, screenshot textures and recessed neighbors.
- **Process:** six faceted nodes with collars and plinths, a thicker spatial connection,
  traveling marker, progressive lighting and camera travel between stage poses.
- **Services:** seven lit surfaces interpolate among stacked, banded, grid, fan,
  folded and cascading compositions as visitors select services.
- **Value:** the existing shader fabric continues reacting to pointer and scroll.

Hardware-capable hero scenes drift gently while visible. Software/adaptive tiers
rest when idle; form and other scenes redraw for interaction rather than constantly.

## Smoothness

One layout-owned Lenis instance survives route and hash changes. GSAP's ticker calls
`lenis.raf(time * 1000)`; Lenis scroll events update ScrollTrigger. Wheel interpolation
uses a 0.075 lerp; anchors use a 1.1-second quartic ease. Native touch scrolling remains
native (`syncTouch: false`). Form fields, the form page and open menus retain ordinary
input behavior. Resize updates dimensions/triggers; cleanup removes the ticker and
listeners. `qa/correction-scroll.json` records measured early/settled wheel movement
and the same runtime generation through navigation.

## Scroll choreography

- Hero: the first fifth holds the composition; the middle separates heading depth
  while rotating/approaching the W; the final phase moves through the model and fades
  the scene as Work arrives. A real ScrollTrigger timeline feeds depth into WebGL.
  On stacked mobile layouts it starts at the sculpture, avoiding an early camera exit.
- Discover: orbiting indicator and directional pulse, then smooth travel through the
  hero timeline to Work with the actual header offset and retained hash history.
- Work: the screen world scales/tilts into view; a bounded desktop pin drives selection.
- Services: atmospheric light evolves on entry; each selection changes physical form.
- Value: reactive grid depth behind typography and staggered cards with perspective.
- Principles: cooler atmosphere, clipped heading and staggered depth/scale entry.
- Process: active node/collars and camera change with scroll or accessible tab selection;
  stage copy re-enters as the selection changes.
- Engagements: moving warmer atmosphere, perspective/clipped row entries and press cues.
- Routes: outgoing page recedes; the incoming page opens through a short spatial mask
  and settles. Native View Transitions use 300/500 ms animations; GSAP entry is the
  fallback. Rapid cancellation is handled. Cursor contexts and restrained magnetic
  CTA/arrow/press feedback remain active on suitable pointers.

## Carousel

The active website is large, front and center. Neighbors angle inward and recede;
farther frames sit deeper. Motion interpolates position, camera offset, screen opacity,
environment color, metadata and index. Mouse drag, horizontal wheel, touch swipe,
arrows, direct project selection, Left/Right/Home/End keys and vertical desktop pin
progression are supported. The pin ends after 2.1 viewport heights; touch/short
landscape/reduced-motion layouts retain natural page scrolling.

Proof: `qa/correction-gallery-1920x1080.png`, `qa/correction-gallery-1366x768.png`,
`qa/correction-gallery-390x844.png`, `qa/correction-gallery-360x800.png`.

## Portfolio

| Website         | Status      | Existing external URL               |
| --------------- | ----------- | ----------------------------------- |
| Harvester Parts | LIVE        | https://harvesterparts.in/          |
| VEYRATH         | IN PROGRESS | None supplied                       |
| Gloss Boss      | LIVE        | https://glossbossautomotive.online/ |
| Article Project | IN PROGRESS | None supplied                       |

Project records were not changed. VEYRATH remains labelled portfolio artwork;
Harvester Parts/Gloss Boss remain labelled actual captures. The Article project
uses an honest currently-building presentation. Existing labelled website concepts
stay in the separate archive. No non-web projects or invented URLs/claims were added.

## Responsive behavior

The requested matrix covers 1920×1080, 1440×900, 1366×768, 1024×1366, 768×1024,
430×932, 390×844, 360×800 and 844×390. Existing tests additionally cover 320 px,
ultrawide and 4K. Desktop uses bounded gallery pinning; tablets/phones use swipe,
arrows and native vertical scrolling. Phone service sculpture stays above the active
service on sufficiently tall screens; short landscape screens keep a natural layout.
Only one service scene mounts at a time, including breakpoint changes.

The six-step form retains stable DOM inputs, the existing draft/validation/attribution/
submission/duplicate-lock/retry logic, and its surrounding progress-sensitive W.
Step advances combine 90 ms exit and 220 ms entry; success remains independent of WebGL.

## Performance

Initial referenced JS: **317,766 bytes**, **101,454 gzip**, versus **316,133 bytes**
before this correction: **+1,633 bytes / +0.52%**. Three.js stays lazy and split:
foundation approximately 200 kB; renderer 378 kB. Motion is 131 kB lazy; scene code
approximately 14 kB. No chunk exceeds the existing 500 kB warning threshold; that
threshold was not raised. See `qa/bundle-correction-comparison.json`.

Non-hero scenes load on intersection, project textures load progressively, DPR and
geometry adapt to touch/software/slow frames, offscreen/hidden scenes pause and route
cleanup disposes resources. Software rendering resolves one sharper still frame when
motion settles. No model/environment downloads or additional dependencies were added.
The final 120-frame local sample recorded a 16.7 ms median, 33.4 ms p95, 100 ms largest
gap and one 111 ms long task; 12 layouts consumed 2.21 ms. The sample is recorded in
`qa/performance-immersive.json`; it measures this Windows Chromium environment,
not physical-device or hosted performance.

## Validation

TypeScript, lint, production build and **70/70 unit tests** pass. Eleven routes prerender.
The final full browser suite passes **34/34**, including the five new correction checks
for replay/opt-in, a single scrolling runtime, hero depth and the requested viewport
matrix. Separate enquiry regressions pass **7/7**. Targeted context-loss, idle rendering
and performance checks also pass after the still-frame rendering adjustment.
Every browser context blocks real Formspree calls; success/rejection
tests use mocks. Protected enquiry service, shared validation, draft, attribution,
project data and package manifest match the preserved before-correction snapshot.

Actual in-app browser inspection covered reduced-motion root cause, replay, Discover,
desktop gallery, mobile service selection and form navigation. Saved browser images
were inspected for model depth, overlap, preview visibility and phone readability.
`git diff --check` passes. Whitespace validation also passes for **91 tracked/untracked
text files**, because this checkout has no tracked files.

## Remaining issues

VEYRATH's public URL and the Article project's final name/URL/actual capture remain
unsupplied. Local browser testing does not establish hosted performance or physical
phone GPU behavior. No real Formspree receipt was exercised in this correction pass.
