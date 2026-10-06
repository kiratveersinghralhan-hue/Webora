# WEBORA immersive interaction addendum

Local implementation, 6 October 2026. Continued the existing working tree. No
commit, push, deployment, dependency additions or provider submissions.

## Intro

The first meaningful homepage visit constructs the custom W from dimensional
pieces triangulated from its actual silhouette. Pieces converge, the seamless
beveled sculpture resolves, violet material/light activates and the camera
settles. WEBORA and its web-design descriptor resolve in HTML. The existing
hero canvas moves into its normal position through a short FLIP transition:
the renderer and canvas are retained, rather than replaced by a second scene.

The sequence runs approximately 2.25 seconds after renderer readiness, bounded
to 2.9 seconds from entry. Skip is available immediately. Session storage and an
in-memory fallback suppress repetition on routes and return visits. Deep links
and reduced-motion visits bypass it; rendering/import failure releases it early.
The Studio also explains human design direction and reviewed AI-assisted
development without changing Webora's website-design proposition.

## 3D experiences

- Custom extruded, beveled W with completed front/back caps, rear structure,
  reflection environment, fragments and guide frames; intro and hero share it.
- Actual Three.js website gallery: browser chassis, website textures, neighboring
  surfaces in camera depth, restrained perspective and lighting transitions.
- Services: seven alloy surfaces interpolate into six different compositions.
- Process: dimensional W-derived path, stage nodes and a travelling marker.
- Value section: pointer/velocity-responsive displaced grid shader.
- Enquiry backdrop: existing W responds smoothly to six-step completion; success
  has an independent HTML/CSS confirmation animation.

Geometry and lighting maps are generated locally. No downloaded model, GLTF,
HDR, postprocessing stack or audio was added; model compression/licensing work
is therefore unnecessary for this pass.

## 360 interaction

Drag the W horizontally through unrestricted full turns. Release adds bounded
momentum with exponential damping; vertical tilt remains controlled. Touch uses
the same mechanism after horizontal intent is established. `touch-action: pan-y`
keeps vertical scrolling available. Implicit touch capture transferred from a
canvas is distinguished from actual cancellation. Desktop keyboard-accessible
rotate/reset buttons provide an alternative; the pose is retained after drag.

## Carousel

Selected Work uses Three.js geometry on desktop, tablet and phone. The active
website moves toward the camera; immediate neighbors recede, dim and rotate
slightly. Preview textures load progressively near the active index. Labels,
status, descriptions and CTAs remain semantic HTML, with inactive items inert.
Selection is announced politely. The controller changes React state only when
crossing an index; animation positions are updated directly, outside React.

Controls: vertical scrolling through the desktop pin, horizontal wheel,
horizontal drag/swipe, release momentum and settling, arrows, direct project
buttons, keyboard Left/Right/Home/End. Vertical phone gestures scroll the page.
Dragging suppresses the accidental link click, while buttons and keyboard
activation remain immediately usable. Case routes use short browser View
Transitions plus the existing route-entry fallback, not a fragile WebGL morph.

Reduced motion retains the complete static website collection. With unavailable
or lost WebGL, fitted DOM previews and all navigation remain usable.

## Scroll

Desktop fine-pointer pages use Lenis with the shared GSAP clock. Touch and the
enquiry route keep native scrolling. Discover and same-page navigation use a
shared smooth-scroll driver with sticky-header offset and normal URL/history
updates. A discreet right-edge progress line and Discover's circular marker
reflect page progress. Hero depth changes, gallery travel, service composition,
process travel and section progress use the same visual/material language.

Only the gallery pins, on fine-pointer viewports at least 900 px wide and 740 px
high. Its progression consumes about 2.1 viewport heights before releasing.
The pin start follows the real header height. Short landscape screens use the
unpinned interactive gallery. Menus have short reversible entry/exit and link
stagger; closing content becomes inert immediately. Accordion height and form
entry/forward exit transitions are brief. Back remains immediate to preserve
rapid navigation. Submission, validation and retry behavior remain unchanged.

## Projects

Existing data is preserved byte-for-byte. No fabricated URLs, results or clients.

| Website         | Public label | Link treatment                                                                             |
| --------------- | ------------ | ------------------------------------------------------------------------------------------ |
| Harvester Parts | LIVE         | Existing harvesterparts.in URL and actual capture; case study                              |
| VEYRATH         | IN PROGRESS  | Existing portfolio artwork; case study; no invented live URL                               |
| Gloss Boss      | LIVE         | Existing glossbossautomotive.online URL and actual capture; case study                     |
| Article Project | IN PROGRESS  | Clearly labelled editorial composition; no fabricated preview/link or completed case study |

Form & Field and Off Script retain their existing routes inside the separately
labelled concept archive on Work. No video, reel, poster or social-design work
was added to the gallery. LIVE is the existing public-website label, not evidence
of provider payment or fulfilment readiness.

## Device behavior

Camera distance responds to canvas aspect, rather than a fixed 1920 composition.
Wide/4K galleries have controlled maximum width and more scene height; phones
use compact metadata, numbered progression and 44 px arrows. The mobile menu
also works on tablets and coarse-pointer landscape screens. No desktop cursor
is shown on touch. Narrow headers keep the wordmark on one line.

Quality varies by viewport, touch capability, detected software renderer and
sampled frame intervals. Maximum DPR is 1.5 desktop / 1.15 touch, with a pixel
budget that can lower it further. Geometry bevel detail drops for touch/software.
Reduced motion avoids WebGL loading entirely. No device-restriction screen.

## Performance

Baseline is the exact working tree copied before this addendum to a temporary
snapshot, including its built dist. `qa/bundle-immersive-comparison.json` records
raw/gzip sizes for entry scripts plus HTML modulepreloads and all lazy chunks.
This definition excludes later dynamic requests; capable visits still load the
hero's Three.js engine early.

Initial referenced JavaScript is 316,133 bytes (100,896 gzip), compared with
307,686 bytes (98,120 gzip) before this addendum: +8,447 bytes / +2.75%. The
custom engine remains lazy at approximately 12.32 kB; Three.js foundation and
renderer chunks remain approximately 198.64 and 378.31 kB. GSAP/Lenis remains
131.47 kB lazy. The CSS is approximately 60.66 kB / 13.74 kB gzip. No chunk
exceeds the default 500 kB warning threshold.
No new media or dependencies were added. Browser-test tooling reports the
inherited NO_COLOR/FORCE_COLOR notice. Build retains its release-configuration
notice about VITE_SITE_URL and disabled preview indexing.

Measured stalls drove actual changes: multisample rendering removed, bounded
render pixel budgets, fewer off-camera gallery surfaces, inexpensive browser
chassis materials, cached resize dimensions, shared pointer clock resting after
settling, hero resting when idle, and lower-tier fabric resting when idle. Scene
observers and listeners are disposed on route exit. Hidden/offscreen scenes stop.

`qa/performance-before-tuning.json` preserves the original 120-frame local sample
(median approximately 150 ms, p95 200 ms). The final 120-frame sample records a
16.7 ms median, 33.4 ms p95 and 100 ms largest frame gap, with one 104 ms long
task. CDP records eight layouts, approximately 1.75 ms total layout work and
127 ms script work across the sampling interval. `qa/performance-immersive.json`
holds the complete receipt.
These are headless Windows Chromium measurements, not physical-device or hosted
performance certification; individual startup/interaction stalls still exist.

## Validation

TypeScript, lint and production build passed (11 prerendered routes). All 70
unit tests, all 29 browser tests and the separate seven enquiry regressions
passed. git diff --check and a separate scan of all 85 tracked/untracked text
files passed. Final command receipts are recorded in QA.md. Coverage includes all existing
enquiry tests with provider traffic blocked or fulfilled synthetically, plus
intro completion/skip/session reuse, same-canvas continuity, real full turns and
inertia, keyboard sculpture controls, gallery wheel/drag/keyboard/touch, native
vertical touch scroll, case-route cancellation, resize, menu stress, context
loss/unavailable WebGL, reduced motion, offscreen/idle behavior and lifecycle
freeze/resume. The document-hidden scenario is synthetic; freezing is driven
through Chromium's lifecycle protocol rather than physical OS backgrounding.

Responsive checks cover 320, 390, 768, 1024, 1366, 1440, 1920, 2560 and 3840 px
widths, plus 844×390 mobile landscape. Eleven routes are checked for overflow.
Browser screenshots were visually inspected for gallery/camera composition,
metadata, navigation and form usability. The in-app browser inherits the user's
reduced-motion setting; motion captures use test contexts explicitly requesting
no preference. Source service/draft/attribution/data files were hash-compared
against the pre-addendum snapshot.

## Remaining issues

- A reliable VEYRATH preview URL and Article project's final identity, preview,
  scope and URL are still absent from the supplied verified records.
- Real Formspree delivery and public-host behavior are not exercised. Existing
  deployment configuration still requires its previously documented release
  setup; this work stays local.
- No physical-device GPU/thermal/battery benchmark or real OS background test.
  The software-renderer timings are bounded local evidence, not a universal
  frame-rate guarantee.
