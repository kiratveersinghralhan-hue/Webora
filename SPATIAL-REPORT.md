# Webora spatial upgrade — 6 October 2026

Implemented in the existing React/Vite working tree. No commit, push, deployment,
Supabase operation or real Formspree submission was performed.

## Creative upgrades

The existing W remains the hero identity, now with bevelled alloy layers, a dark
rear structure, a separate contour, structural fragments and reflection guides.
The same folded-surface language carries into browser frames, service compositions,
the process path and a restrained digital fabric. Violet/blue lighting, editorial
labels, section progress lines and consistent route entry connect the experience.
Buttons, navigation, project links and cursor states have controlled feedback.

Selected Work is now a signature spatial sequence rather than a normal card grid.
Actual website captures appear on textured Three.js planes with physical browser
frames. Previous/next surfaces recede through depth as scroll changes the active
project. Metadata and CTAs remain HTML, with inactive projects excluded from focus.
Direct project buttons provide a second way to explore the sequence.

## 3D system

Five scene types share one engine and one material/light family:

1. Hero: the original extruded W, layered rear/contour, structural fragments,
   pointer-reactive orientation and lighting; scroll pulls the composition deeper.
2. Work: textured browser surfaces, chassis, rims and browser chrome. The adjacent
   project previews load progressively and move relative to the active project.
3. Services: seven interface layers interpolate between six original arrangements
   representing presence, a landing surface, commerce, portfolio, redesign and
   interactive development. The accessible accordion selects the composition.
4. Process: an original six-point folded path, physical nodes and a travelling
   focus marker. Scroll advances stages; mouse/keyboard selection remains usable.
5. Value: a subdivided shader-driven grid, subtly deformed by the shared pointer,
   velocity and scroll progress behind conversion-focused copy.

The enquiry environment reuses the W. Its layer separation, fragment scale and
lighting resolve across the six steps and complete after mocked AJAX acceptance.
Only the visual `Core` prop changed in StartProject.tsx. No validation, payload,
attribution, persistence, retry, submit, success or contact logic changed.

`src/lib/pointer.ts` supplies shared normalized coordinates, frame-independent
smoothing and velocity to the custom cursor, lights, meshes and shader. The native
pointer remains available; custom cursor/magnets are disabled on touch or reduced
motion. No orientation permission or external model pack is used.

## Scroll and motion

Lenis is lazy-loaded on desktop with native touch scrolling. It runs from GSAP's
ticker, synchronizes ScrollTrigger, respects menu locking and input controls, and
is excluded from the enquiry route. Route cleanup destroys Lenis and reverts
animations/triggers. GSAP matchMedia handles desktop pin changes on resize.

Only the Selected Work sequence pins. Hero depth and type separation, project
progress, restrained image perspective, section light/progress lines and the
process stage advance respond to scroll. Route entry uses one short resolve/fade
across pages. Project detail pages retain the same project capture; they use the
shared route transition rather than a brittle full-screen morph.

Mobile presents projects sequentially with native scroll and restrained perspective.
It retains simpler actual WebGL in the hero, services, process and value sections.
Reduced-motion and WebGL failure retain designed static surfaces, all content,
project links, navigation and enquiry functionality. Prerendered navigation works
without JavaScript.

## Portfolio

| Project         | Status                          | External URL                                  | Visual                                         |
| --------------- | ------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| Harvester Parts | LIVE — public website available | https://harvesterparts.in                     | Actual website capture, September 2026         |
| VEYRATH         | IN PROGRESS                     | Unavailable; previous portfolio URL was empty | Explicitly labelled portfolio artwork          |
| Gloss Boss      | LIVE — public website available | https://glossbossautomotive.online            | Actual website capture, September 2026         |
| Article Project | IN PROGRESS                     | Unavailable                                   | Clearly labelled preview-to-follow composition |
| Form & Field    | CONCEPT — website archive       | None                                          | Existing original interface concept            |
| Off Script      | CONCEPT — website archive       | None                                          | Existing original storefront concept           |

LIVE means a public website responds, not that payments, transactions, bookings or
fulfilment were exercised. VEYRATH explicitly does not claim live checkout,
payments or fulfilment. No client metrics or results are invented. The Article
Project label comes from the user's request; its actual identity remains pending.

Data and statuses live centrally in `src/data/studio.ts`. Only live records with
verified supplied URLs get Visit Website. Only records with detail content get
View Case Study. Ongoing work gets In Progress. External project links use
`target="_blank" rel="noopener noreferrer"`. Preview and Vercel rewrite
configuration include the three new case routes; no remote hosting was changed.

### Provenance

The Webora tree originally contained only the two website concepts and no real
project URLs. Previous portfolio records and existing optimized captures were
located at:

`C:/Users/ACER/Documents/Codex/2026-09-15/master-request-completely-rebuild-my-portfolio/outputs/kirat-portfolio/public/`

The supplied `site-data.js` provided Harvester Parts/Gloss Boss URLs and the
VEYRATH development status. Existing `screen-harvesterparts.webp`,
`screen-glossboss.webp` and `project-veyrath.webp` were copied into
`public/projects/`. Both supplied public URLs were checked with read-only web
retrieval on this pass. No guessed domain was introduced. Captures retain their
September date; they are not claimed as freshly captured October interfaces.

## Removed / excluded

The current Webora tree contained no video/reel/social-only portfolio items.
Its two legitimate website concepts remain accessible in the archive. The previous
portfolio's automotive video/social scope, reels, social property, poster assets
and general creative-service language were not imported. Gloss Boss is presented
strictly as a business website. Webora stays focused on web design, development
and interactive web experiences.

## Performance

Sizes below use decimal kB, measured from production files. Initial JS means the
entry script plus unique JS modulepreloads referenced in the built homepage HTML;
it does not include later dynamic requests, CSS, fonts or media. Gzip values here
use Node's default gzip settings summed per file; server transfer varies.

| Measure                 |                   Before |           After |
| ----------------------- | -----------------------: | --------------: |
| Initial referenced JS   |             1,004.024 kB |      307.686 kB |
| Initial JS gzip         |               288.434 kB |       98.120 kB |
| Main entry chunk        |               236.843 kB |      254.033 kB |
| Three.js renderer       | Part of 626.542 kB chunk | 378.332 kB lazy |
| Three.js foundation     |       Part of same chunk | 198.632 kB lazy |
| Scene engine            |       Part of same chunk |  10.192 kB lazy |
| GSAP / Lenis            |       131.466 kB initial | 131.466 kB lazy |
| Page-motion integration |   In initial application |   1.918 kB lazy |
| Booking route           |          103.405 kB lazy | 103.430 kB lazy |
| CSS                     |                39.988 kB |  About 51.28 kB |

Initial referenced JS fell **69.35%** (696.338 kB). The baseline build was recreated
from the pre-edit source snapshot in a temporary folder using the same installed
dependencies. Its output reproduced the original asset hashes/sizes.

The old manual chunk rule matched both `node_modules/three` and the application's
`src/three` wrapper, causing the supposedly dynamic renderer to be preloaded with
the entry. The rule now targets the actual dependency paths. Foundation/rendering
modules are independently cacheable and the scene application code is separate.
Source entry imports and removing the RoomEnvironment dependency also reduce the
combined lazy 3D code to 587.156 kB from 626.542 kB. Splitting does not make the
renderer free: capable visitors still download the 3D code when a scene loads.

Other business pages and the enquiry form remain route-lazy. The initial Spatial
wrapper/shared-router chunk is 52.502 kB. No Drei, postprocessing, GLB files or
high-resolution HDR environment is added. Tiny reflection maps are generated in
code. The Vite 500 kB warning is gone; its limit was not increased or suppressed.
Some runs emitted informational plugin-timing notices and Playwright's inherited
NO_COLOR/FORCE_COLOR notices; these are not hidden performance results.

Project media: Harvester Parts **65.192 kB**, Gloss Boss **97.962 kB**, VEYRATH
**49.560 kB**; total **212.714 kB**. Largest new asset is 97.962 kB. Existing local
fonts are unchanged. Captures load lazily and WebGL textures load around the active
project.

DPR caps: desktop 1.5; mobile/touch 1.15; adaptive reduction to 1 after sustained
slow samples. Mobile uses less geometry detail and no antialiasing. Scenes load near
the viewport, pause off-screen/hidden, and service/work/process rendering rests at
idle. Hero and fabric retain gentle continuous animation while visible. GPU
objects/textures, observers, listeners, pointer subscriptions and animation frames
are cleaned up on unmount. Context loss stops rendering and restores fallback.

Compromises: no costly real-time refraction or postprocessing; mobile does not use
the desktop work pin; route transitions use a reliable shared fade/resolve instead
of a fragile canvas-to-route morph. Smoothness is targeted, not a measured
physical-device 60fps guarantee. No Lighthouse, hosted Core Web Vitals or physical
phone benchmark is claimed.

## Validation

- TypeScript and lint passed.
- Production build passed; eleven complete routes plus the 404 page prerendered.
- All **70 existing unit tests** passed; the accepted enquiry implementation and
  inactive legacy regression fixtures remain intact.
- Full browser run: **20/20 passed** (original 14 plus six spatial scenarios).
- Separate targeted enquiry run: **7/7 passed** with synthetic Formspree responses.
- `git diff --check` and a separate tracked/untracked text-file whitespace scan
  passed; nothing was staged for verification.
- Six spatial scenarios passed: project sequence/selection/status CTAs, shared
  cursor and all scene families, touch/mobile WebGL and preview layout, context
  loss/route disposal, reduced motion/accessibility/no WebGL download, idle render
  and simulated document visibility pause/resume.
- Responsive regression passed across eleven routes at 320, 390, 768, 1024,
  1920 and 3840 px. Desktop checks also use 1440 × 1000; touch checks use 390 × 844.
- Existing axe checks plus the real-work page found no violations in tested
  WCAG 2 A/AA and 2.1 AA reduced-motion states. This is bounded automated evidence.
- Visual screenshots inspected for hero, work sequence, services, process and
  mobile hero/work. The in-app browser also checked the reduced-motion 320 px
  work presentation and real project links.
- Baseline comparison verifies the only StartProject.tsx change is its visual Core
  progress prop. Enquiry service, schema, draft and attribution files are unchanged.

All browser tests block Formspree outside synthetic fixtures. No real lead,
notification, provider acceptance or production-domain behavior was tested.

## Missing project information

VEYRATH: no supplied public URL or current website screenshot; its supplied artwork
and development status are retained. Article project: final name, URL, screenshot,
actual scope and technologies remain unknown. Project years and unknown technology
stacks are intentionally not invented. These are content follow-ups, not excuses
for blocking the implemented visual experience.

## Remaining launch blockers

Real Formspree form creation/public form ID, notification-recipient verification,
real submission/email confirmation and production-domain acceptance remain manual
external work. Configure the actual `VITE_SITE_URL` for canonical URLs/indexing and
perform an authorized release/hosted validation. No visual work completed above is
listed as a launch blocker.
