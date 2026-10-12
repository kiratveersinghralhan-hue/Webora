# WEBORA V2 — Checkpoint A validation

12 October 2026, Asia/Calcutta. Worktree: `C:\Users\ACER\Documents\ChatGPT\Webora V2`. Branch: `codex/webora-v2`. HEAD remains `3f57b43cb843058cbdb68b6cf5e1acf057e7d361`. Local changes only; no commit, push, workflow dispatch or deployment.

## Status

**Checkpoint A is ready for owner visual review.** Services and Process are implemented and their desktop/mobile renders have been inspected. All 109 unit tests and 37 distinct browser cases pass across the recorded runs, with zero skipped cases. This is not a claim of one uninterrupted 37-case sweep or owner visual approval. Checkpoints B–E have not begun. This document concerns Checkpoint A, not production acceptance or completion of the whole V2 transformation.

## Interrupted state and preservation

The correction brief, four Phase 1 blueprints, V2.1A/V2.1B validation and Living Studio M1 report were read. The previous chat's last failed turn was inspected to resolve the interrupted state. It was stopped by the usage limit, not running alongside this work. The app inventory showed this as the active Webora chat; the previous chat was not loaded. No agents or parallel source editors were started.

Before editing, the V2 branch/worktree, complete tracked/untracked Git status and running Node processes were inspected. Existing V2.1A/V2.1B/M1 source, tests, reports and evidence were retained. No reset, clean, stash, branch switch or reconstruction was used.

`test-results/checkpoints/20261011-before-correction-A/` contains 143 source/report copies plus its HEAD, status, binary patch and SHA-256 manifest. All 143 hashes match. The existing checkpoint was not recreated or modified. The interrupted run had changed four existing files (`Services.tsx`, `StudioSections.tsx`, `ExperienceStage.tsx`, `WorldRuntime.ts`) and added seven files: `LivingSections.tsx`, `InstallationView.tsx`, `InstallationRouteStage.tsx`, `installationGeometry.ts`, `installationViews.ts`, `InstallationScene.ts`, `StudioScene.ts`. All eleven were inspected before editing.

Those eleven files already supplied the closed device profiles, basic forged billets, scene modules and canvas transfer. Missing work included section CSS, complete visual QA, screen surface placement/texture handling, reliable direct chapter entry, fallback recovery and Checkpoint A tests/reporting. Their geometry and runtime were extended in place.

A separate guarded resume snapshot at `test-results/checkpoints/20261012-resume-A/` preserves all 150 then-present Git-visible source/report files, including the seven untracked additions. Its 150 hashes also match. Previous checkpoints and all historical screenshot/test folders remain present. Machine-readable comparison: `test-results/checkpoint-a/summary.json`.

## Modeled objects and controls

### Services — responsive construction

One metallic exhibition platform carries three closed modeled devices:

- Desktop monitor: beveled titanium chassis, inset graphite bezel, actual Harvester Parts capture, raised rear W-derived spine, five rear vents, folded structural stand and machined foot.
- Laptop: closed graphite screen housing, actual Gloss Boss capture, titanium deck, cylindrical hinge, forty instanced keys and separate trackpad.
- Phone: rounded closed body, cobalt frame, screen inset/notch and rear camera enclosure with two lenses. Its image is explicitly a portrait crop of the existing Gloss Boss desktop capture, not a claimed fresh responsive-device screenshot.

The six existing service disclosures retain their exact descriptions, deliverables and enquiry links. Each selects a distinct composition of the same three devices: monitor-led business presence; centered landing-page focus; foreground laptop commerce arrangement; reversed portfolio composition; balanced redesign stack; and the articulated interactive arrangement. These are visual interpretations of the existing offer, not additional commercial promises.

The monitor/laptop/phone screen surfaces originally sat inside their beveled covers. Actual browser inspection found the resulting blank screens; the surfaces now sit beyond the front bevels. The portrait texture now loads its image reliably rather than cloning an unloaded texture. The whole laptop has a readable screen angle, while its deck retains its own modeled depth.

### Process — six forged stages

Discover → Direction → Design → Develop → Refine → Launch select six articulated, closed, chamfered billets. Each contains a machined aperture, visible internal wall, thick dark rear section, projecting rear rib, stage marks and a lower seam. Alternating graphite/alloy faces, sloping rails, folded brackets and a substantial exhibition plinth connect the assembly to the W's material and structural vocabulary.

The selected billet rises 0.56 scene units, pitches toward the viewer, changes face color and illuminates its rib/seam. Adjacent trims respond with a quieter light. The camera shifts slightly toward the selected stage while maintaining the complete assembly in frame. The sculpture settles after selection; it does not run an autonomous animation loop.

Both installations offer **Inspect the form**, rotating the existing assembly by 60 degrees per activation. Side and rear views expose designed surfaces; geometry is not replaced during inspection. This enhancement is hidden when 3D is unavailable so a static illustration does not present an ineffective rotation control.

### HTML and responsive composition

New editorial headings, restrained blue/graphite environments and aligned captions frame the installations. Desktop Services pairs the device installation with the disclosure list. Tablet/mobile stack the installation above that list. Process uses a wide sculpture with six stage tabs below, becoming a three-by-two control grid on small screens. Descriptive stage copy remains ordinary HTML below the controls; short screens use normal scrolling.

Every Process tab references an existing panel, with only the selected panel exposed. Arrow keys, Home and End retain roving focus. Service buttons retain expanded state and controlled disclosures. Reduced motion and failed WebGL show original static SVG counterparts that still reflect HTML selection. Service/process content and navigation remain available independently of WebGL.

## Shared scene architecture

`StudioScene` composes the existing W and lazily created installations under the existing `WorldRuntime`. A single canvas is transferred between visible HTML slots through `WorldRuntime.attach()`; scenes do not instantiate renderers. Only the selected chapter updates, and inactive chapter roots are hidden. The W geometry, materials and intro director were not rewritten.

The runtime continues to use the existing GSAP-driven ordered clock and draw gate. No independent RAF, renderer, observer-owned animation loop or second camera was introduced by an installation. Scene resources use the existing asset leases. Async image callbacks check scene lifetime. Route cleanup removes the observers/listeners/subscriber, releases resources, disposes the renderer and removes its canvas.

Homepage and standalone Services adapters observe every eligible scene slot, including direct `#services`/`#process` entry. They guard late imports after unmount. Context loss now emits a shared unavailable event, restoring static artwork immediately; a successful restored presentation replaces it. Repeated loss disposes the world and leaves HTML/static artwork usable.

## Exact Checkpoint A file set

Relative to the verified pre-correction snapshot, **18 source/test/report files** belong to Checkpoint A. This is distinct from the larger uncommitted branch diff containing earlier legitimate V2 work.

| File | Checkpoint A responsibility |
| --- | --- |
| `src/pages/Services.tsx` | Standalone route adapter, preserving existing business page content. |
| `src/sections/StudioSections.tsx` | V2 Services/Process delegation, retaining V1 and existing selection owners. |
| `src/sections/LivingSections.tsx` | New section composition, disclosures, tabs and persistent accessible panels. |
| `src/styles/living.css` | Scoped installation layout, screen slots, typography, responsive tabs and fallback visibility. |
| `src/three/ExperienceStage.tsx` | Existing hero runtime adapter extended to shared chapters and direct chapter entry. |
| `src/three/InstallationRouteStage.tsx` | Lazy standalone marketing-route lifetime through the same runtime. |
| `src/three/InstallationView.tsx` | Static SVG counterparts, semantic captions and enhanced inspection control. |
| `src/three/geometry/installationGeometry.ts` | Reused closed slabs/brackets/billets, with machined Process apertures. |
| `src/three/runtime/installationViews.ts` | Visible-slot selection, state synchronization and availability/cleanup. |
| `src/three/runtime/WorldRuntime.ts` | Existing canvas transfer and presentation events; context-loss fallback notification. |
| `src/three/scenes/InstallationScene.ts` | Device and Process assembly, textures, poses, materials, framing and resource lifetime. |
| `src/three/scenes/StudioScene.ts` | Lazy chapter ownership and exclusive updates/render visibility. |
| `tests/installations.test.ts` | Real vertex/depth/framing, distinct selection, chapter reuse and exactly-once release checks. |
| `tests/runtime.test.ts` | Observer/host fixtures updated for real target-aware canvas transfer events. |
| `tests/v2-browser/checkpoint-a.spec.ts` | New rendered selection, depth, responsive, fallback, accessibility and lifecycle coverage. |
| `tests/v2-browser/runtime.spec.ts` | Offscreen check now uses an editorial interval because Process is an active shared scene. |
| `playwright.checkpoint-a.config.ts` | Isolated Checkpoint A evidence and existing runtime regression. |
| `docs/WEBORA-V2-CHECKPOINT-A-VALIDATION.md` | This report. |

Some resumed files only needed formatting because the interrupted implementation already supplied their behavior. No public assets, dependencies, verified project facts, enquiry/provider logic, deployment settings or videos changed. Ignored capture/audit helpers and evidence are under `test-results/checkpoint-a/`, with the original checkpoint and separate resume snapshot under `test-results/checkpoints/`.

## Rendered visual evidence

The two rejected captures were inspected: `test-results/living-m1/services-viewport.png` (translucent stacked rectangles) and `process-viewport.png` (zigzag line/dots). The replacements were reviewed as actual browser images. The devices have opaque bodies, framed screenshot surfaces, modeled decks/stands and rear chassis; Process has solid articulated bodies, apertures, rails and rear ribs. Neither main V2 visual retains the rejected diagram.

Representative local images:

| View | Evidence |
| --- | --- |
| Services desktop, complete six-item layout | [Services desktop](../test-results/checkpoint-a/services-1440.png) |
| Services mobile | [Services mobile](../test-results/checkpoint-a/services-390.png) |
| Process desktop | [Process desktop](../test-results/checkpoint-a/process-1440.png) |
| Process mobile | [Process mobile](../test-results/checkpoint-a/process-390.png) |
| Services rear chassis | [Rear view](../test-results/checkpoint-a/services-1440-depth-3.png) |
| Process rear ribs | [Rear view](../test-results/checkpoint-a/process-1440-depth-3.png) |
| Hardware-rendered Services / Process | [Services](../test-results/checkpoint-a/services-1440-native-model.png), [Process](../test-results/checkpoint-a/process-1440-native-model.png) |
| Static reduced-motion counterparts | [Services](../test-results/checkpoint-a/reduce-services.png), [Process](../test-results/checkpoint-a/reduce-process.png) |

All six Services selections: `services-{1440,390}-selection-{1..6}.png`. All six Process stages: `process-{1440,390}-stage-{1..6}.png`. Three intermediate/side/rear views per installation and viewport: `{services,process}-{1440,390}-depth-{1..3}.png`. These are rendered captures, not generated mockups. The summary JSON inventories exact filenames.

Responsive browser sizes: 1920×1080, 1440×1000, 1280×720, 768×1024, 430×932, 390×844, 360×800 and 320×568. All installation cases report zero horizontal overflow. Narrow/short screens scroll to controls and copy normally. Native Chrome supplementary captures cover 1440×1000 and 390×844; the latter is viewport emulation on a desktop GPU, not a physical phone.

## Validation

All browser contexts block `https://formspree.io/**` before navigation. No real enquiry is sent.

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS. |
| `npm test -- --maxWorkers 1 --no-file-parallelism --hookTimeout 120000` | PASS: 11 files, 109 tests; final run 32.98 seconds on the busy host. |
| Production build with root base, `https://webora.design` canonical, blank local Formspree ID | PASS: 2,455 modules; 11 prerendered routes; Vite build 2.34 seconds. |
| New 13-case Checkpoint A browser sweep | 12 passed in 8.5 minutes; one test-fixture error retrieving an extension after deliberate context loss. Original failed trace/report retained. |
| Corrected context-loss test | PASS: retained the extension handle before loss; static fallback, restoration, one canvas and repeated-loss disposal assertions unchanged. |
| Inherited runtime regression plus corrected installation recovery | PASS: 24 cases in 5.1 minutes, comprising 23 inherited checks and the corrected installation context-loss check. |
| Focused DPR-3 mobile controls | PASS: the remaining inherited touch/pixel-cap case, 9.3 seconds including server startup. |
| Strict combined browser summary | PASS: 37 distinct latest results, zero failures/skips; `summary.json` combines `browser-checkpoint-full.json`, `browser-runtime-final.json` and `browser-touch-final.json` without hiding the earlier failed attempt. |
| Scoped Axe checks under reduced motion and unavailable WebGL | PASS: zero violations in Services/Process. This is not a whole-site accessibility certification. |
| Installed Chrome, no backend/capability override | PASS: Intel UHD Graphics / D3D11, high tier, desktop and mobile viewport, both installations, zero page errors. |
| Asset-path / protected-file audit | PASS: 108 built local references across 12 HTML documents resolve; no stale `/Webora/assets/` base; protected originals match. |
| Checkpoint integrity | PASS: 143 original and 150 resume copies verified, zero hash failures. |
| `git diff --check` | PASS; expected Windows line-ending notices only. |

Earlier corrective failures are retained explicitly: a real Services full-turn projection clipped just outside the viewport and was fixed by camera clearance; observer unit fixtures needed real `target`/event behavior; millions of individual vertex assertions exceeded a 30-second test budget under concurrent software rendering. The framing test now computes extrema over the same complete vertex set and asserts the same strict bounds once, avoiding assertion overhead without reducing coverage. Final unit assertions pass. The context-restoration fixture now retains its native extension handle rather than requesting an extension from a lost context.

## Resource measurements and performance limits

Chromium with explicit SwiftShader, seen intro, low tier, development diagnostics, device DPR 1. Measurements are from the six selection captures. Counts are renderer-uploaded objects retained by the shared route, **not per-scene exclusive allocations or VRAM bytes**. Services was visited first, Process second, so Process totals include earlier uploaded resources. Direct hash entry can leave the W's geometry unuploaded until the hero is visited.

| Scene / viewport | Calls | Triangles | Uploaded geometries / textures / programs | Drawing DPR |
| --- | ---: | ---: | --- | ---: |
| Services, 1440×1000 | 27 | 14,070 | 32 / 7 / 6 | 0.961 |
| Process, 1440×1000 | 56 | 11,536 | 71 / 7 / 6 | 0.817 |
| Services, 390×844 | 27 | 14,070 | 32 / 7 / 6 | 1.0 |
| Process, 390×844 | 56 | 11,536 | 71 / 7 / 6 | 1.0 |

All selection samples retain one active renderer and one canvas. Services reports three loaded screen textures, zero texture failures. Process adds no screenshot texture. Switching among six selections does not allocate another scene. The five installation/home/booking route cycles record uploaded geometry counts of **75, 75, 75, 75, 75**, including the initially rendered W; booking releases the canvas/active owner. The separate twenty inherited home/booking cycles stay at 14 uploaded geometries each. After Process settles, both viewport cases record **zero additional draws over 1.5 seconds**. This does not claim an improvement over earlier V2/V1, which also stopped at idle.

Filtered CPU draw-start gap medians/p95 during the capture workload: desktop Services 139.5/190.4 ms, Process 99.3/189.2 ms; mobile viewport Services 79.0/194.4 ms, Process 61.8/182.3 ms. Arrays include accumulated earlier chapter/startup/input samples; repeated snapshots overlap, gaps ≥250 ms are excluded by existing diagnostics, and the host also ran checks. These numbers are **not a benchmark, GPU timing, presented FPS, or evidence of physical-mobile smoothness**. SwiftShader interaction is visibly slower than the installed Intel GPU. The supplemental Intel run confirms real hardware rendering and correct quality selection, not sustained thermal/battery or mobile performance budgets.

No reflection render pass, postprocessing pipeline, downloaded model pack or continuous installation animation was added. The forty laptop keys share an instanced draw. Shadows are a restrained CSS/environment treatment, not a physical ray-traced/shadow-map simulation. Process's 56 calls remain a profiling consideration for a later performance checkpoint; the responsive captures and settled draw gate do not establish a 60 FPS guarantee.

Final build report: initial/preloaded JS **337,508 raw / 107,498 gzip bytes**; the two lazy Three.js vendor chunks total **586,543 raw bytes**. The installation's shared scene chunk is 9,439 raw bytes. There was no build chunk-size warning. See `bundle-console.txt`; these are bundle sizes, not measured page-interaction speed.

## Safety, remaining work and preview

The master checkout remains on `master` at the baseline SHA with no tracked diff. Its existing untracked production report/blueprints and all 554 video-output files remain. Protected hosting, dependencies, enquiry, attribution/drafts, business/SEO data and privacy files match the original text/hashes as applicable. Four blueprints and both V2.1A/V2.1B reports remain unchanged. Read-only remote inspection still reports only baseline `master`; read-only production GET returns HTTP 200 and the original V1 `/assets/index-CF_s-Fxu.js`.

Remaining limitations: owner visual approval is still required; physical iOS/Android touch/performance, Safari, Firefox, battery/thermal and production-hosted V2 remain unverified. The earlier V2.1B software playback-Skip intermittency remains documented in its original report; Checkpoint A does not redesign the intro or claim that advanced suite has newly passed. B's curved gallery, C's intro redesign and D/E's connected choreography/full-site polish remain pending.

Local preview is already served on loopback port 5175:

- Services: `http://127.0.0.1:5175/?experience=v2#services`
- Process: `http://127.0.0.1:5175/?experience=v2#process`
- Standalone Services: `http://127.0.0.1:5175/services?experience=v2#services`
- Preserved V1 comparison: `http://127.0.0.1:5175/?experience=v1`

If the preview has stopped, run `npm run dev -- --port 5175 --strictPort` inside the V2 worktree. Add `&diagnostics=1` before the hash only for local development counters. Public hosts continue to select V1. Stop at Checkpoint A for visual feedback; no commit, push or deploy is authorized/performed.
