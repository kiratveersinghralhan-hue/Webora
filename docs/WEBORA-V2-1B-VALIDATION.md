# WEBORA V2.1B — cinematic identity and liquid alloy

11 October 2026, Asia/Calcutta. Local worktree: `C:\Users\ACER\Documents\ChatGPT\Webora V2`; branch `codex/webora-v2`; baseline commit `3f57b43cb843058cbdb68b6cf5e1acf057e7d361`.

This extends the completed, uncommitted V2.1A foundation. No commit, push, deployment, production configuration change, real enquiry or hosted Supabase operation was performed. The original checkout remains on `master` with no tracked changes. V2.2 is not implemented.

## Implementation and file map

Before editing, all 126 existing non-private source/report files were hashed and preserved in ignored `test-results/v2-1b/baseline-source/`, together with the existing production build in `baseline-dist/`. Comparable desktop/mobile V2.1A measurements and screenshots were captured before the identity changes. No dependencies were installed or upgraded.

The resumed `git status --short` contains 24 entries; directory entries expand to 38 paths (eight tracked modifications and thirty untracked paths, including the existing V2.1A files and approved reports). Compared with the frozen V2.1A snapshot, V2.1B updates twelve existing files and adds eight files. The exact V2.1B map follows; this is not a claim that all untracked files were created during this phase.

| Files | Change |
| --- | --- |
| `src/three/geometry/identityGeometry.ts` | Four forged strokes partition the canonical original W outline. Tiered rounded bevels, thick closed sidewalls, deliberate structural seams and a separate inset rear layer. The same vertex buffers assemble and remain in the hero; positions/normals return exactly to their rest arrays. |
| `src/three/materials/studioAlloy.ts` | Original opaque graphite alloy. Standard PBR for balanced/low; restrained physical clearcoat on high. Analytic normal/roughness flow on balanced/high, stable uniforms and cache keys, no displacement of silhouette vertices, transmission, raymarching, bloom or offscreen refraction. Permanent ordinary-alloy recovery for failed custom flow. |
| `src/three/scenes/CoreScene.ts` | Extends the V2.1A scene/controller: persistent W/rear, authored assembly, camera arc/settling, material pulses, filtered angular velocity, full yaw, bounded pitch, exact quarter-turn/reset and responsive fitting. No renderer or independent clock. |
| `src/three/runtime/IntroDirector.ts` | Pure idempotent request → preparing → playing → handoff → settled timeline, readiness gate, remaining-budget calculation, low-tier skip, mobile duration and request deadline. No timer/RAF ownership. |
| `src/three/IdentityCore.tsx`, `src/three/Core.tsx` | Route-exclusive V2 identity adapter and accessible Skip/rotation controls. Existing V1 component remains available. Uses the existing session key plus an in-memory fallback. Keeps navigation, text and primary CTA usable throughout preparation/playback. |
| `src/three/ExperienceStage.tsx` | Connects the director to the existing lazy runtime; first successful draw supplies readiness/tier. Handles actual route cleanup, failure/cancellation and discrete shared-cursor drag feedback. |
| `src/three/runtime/WorldRuntime.ts`, `types.ts` | Retains central renderer/camera/resources/clock/quality ownership. Adds bounded MSAA, monotonic timeline samples, ready-tier propagation and an ordinary-material retry for both eager compile and lazy first-draw linking failure. The existing 2.5-second asynchronous preparation deadline remains. |
| `src/three/runtime/studioEnvironment.ts` | Original generated 128×128 cubemap faces: dark studio walls, neutral softboxes and narrow blue/violet strips. Shared through the existing resource lease. No downloaded HDR or model. |
| `src/three/runtime/diagnostics.ts` | Development/local-only identity IDs, yaw/pitch, material count, progress and timing alongside existing render/resource counters. |
| `src/lib/pointer.ts` | Discrete label updates through existing subscribers; no new animation loop. |
| `src/styles/experience.css`, `src/components/ExperienceSwitcher.tsx` | Local V2.1B label, compact nonmodal intro controls and ultrawide/short-landscape composition rules. Existing copy, typography and enquiry layout are preserved. |
| `tests/identity.test.ts`, `tests/runtime.test.ts` | Identity timeline/geometry/material invariants plus eager/lazy shader recovery and the existing complete lifecycle suite. |
| `tests/v2-browser/identity.spec.ts`, `playwright.identity.config.ts` | Actual-browser identity, shader, intro, six-view, high-tier, storage, context, responsive and touch checks. |
| `tests/v2-browser/runtime.spec.ts` | Existing assertions retained. Updates the exact local label to V2.1B and delays the runtime import in the preparation-Skip fixture. Evidence destination can be supplied by environment so V2.1B checks do not overwrite V2.1A artifacts. |

The original `AssetRegistry`, `FrameGate`, `QualityPolicy`, ordered GSAP clock and route isolation are retained. No second renderer, Lenis instance, independent RAF loop or business state was introduced. Non-hero sections remain the earlier V2.1A HTML/SVG foundation; this is not the full shared-world migration.

## Sculpture and material behavior

The shape comes from `weboraOutline`, not a downloaded logo/model or generic primitive. Four closed forged sections keep the recognizable W, including from the rear. A slightly smaller rear panel layer exposes a machined perimeter and thickness. Low geometry retains at least two bevel segments; high uses the existing tier's four. Bevel normals are authored by extrusion; animated panel transforms rotate normals along with positions.

Balanced/high flow perturbs view-space normals by a small analytic field and roughness by at most 0.035. It never deforms silhouette vertices. Interaction and assembly trigger finite flow: at most 900 ms after the last high-tier input or 650 ms on balanced, fading over the final 300 ms. Low tier uses ordinary opaque alloy with no custom flow. Once settled, uniforms freeze and the existing draw gate stops GPU draws. GSAP may still tick for other page motion.

A custom shader failure is retried as ordinary alloy on the same renderer and material object. A failure of ordinary rendering then preserves SVG/HTML and retires the renderer. Context restoration does not replay the intro. Resource release remains owned by the existing leases, including partial initialization and late asynchronous completion.

## Intro and seamless handoff

The same W object, geometry buffers, materials, renderer and camera persist from preparation through hero. No intro-only replacement W or prerecorded video is used. The camera and material consume the same director progress sampled by the existing world tick.

Desktop playback requests 2,200 ms; phone/coarse playback requests at most 1,400 ms. The original request deadline is 2,900 ms. Actual playback is shortened to the remaining budget minus 50 ms; if fewer than 900 ms remain, the scene settles directly. Ordinary low-tier first visits skip cinematic playback; explicit local `intro=1` replay permits inspecting the lightweight assembly. No minimum loading delay is imposed.

At nominal desktop duration, the authored sequence is:

| Stage | Visible behavior |
| --- | --- |
| Initial / roughly 0–0.35 s | Near-black forged sections and restrained edge light; usable page and Skip already exist. |
| Roughly 0.35–1.05 s | Four matching W sections converge along staggered 3D paths, with bounded rotation and depth. Graphite surfaces brighten toward controlled studio reflections. |
| Roughly 1.05–1.65 s | The W resolves; blue/violet rear-edge sweep and the shallow camera arc reveal bevels and sidewalls. |
| Roughly 1.65–2.20 s | Camera and surfaces settle exactly into the hero pose; the local intro legend disappears. HTML remains readable throughout. |

These are authored target timings, not guaranteed hardware timings. Observed first-frame and intro measurements are recorded below. Cold or slow preparation can correctly skip playback. A synchronous driver call cannot be preempted by a JavaScript timeout.

Skip, wheel/touch/scroll intent, navigation, reduced motion, context loss or failure settle the director. The intro does not hide the site header, lock scrolling, trap focus or cover the primary CTA. The unchanged `webora-intro-v2` session key and an in-memory flag prevent same-session replay. Development replay uses `?experience=v2&intro=1`; it remains local-only.

## Problems corrected while validating

1. React StrictMode rehearsed effect cleanup was consuming the fresh intro before playback. Requests are now idempotent, effect rehearsal preserves a pending request, and actual unmount cleanup remains with the stage. A real fresh-session/revisit browser check and a focused unit test cover this.
2. Some drivers report shader linking failure only on the first draw. Ordinary-alloy recovery now covers that path as well as eager compilation, before announcing a useful frame. Both paths have unit coverage; an actual custom-shader fault was injected in Chromium.
3. Ordinary fallback could have been replaced by another patched material during a later quality rebuild. The scene remembers the failed-effect state for its lifetime.
4. Rear inset faces originally sat too close to the body cap. The rear layer is offset to expose its material/perimeter and avoid near-coplanar artifacts.
5. Material branch fixtures accidentally included the software-renderer keyword in a capability label, correctly selecting low quality. The fixture was corrected; actual SwiftShader remains the underlying backend. This was a test defect, not a reason to weaken the quality policy.
6. Remote polling and repeated PNG readbacks could miss or stall a short intro. Browser-side observations now record continuity without image readback; visual frames use one readback per separate replay. Captured images are not used as performance samples. Earlier failure evidence is retained.
7. The inherited page entrance translated the Skip button while the short intro was preparing. V2 identity pages now leave translation/blur to the 3D director, keeping Skip and the CTA still; other routes and V1 retain their page entrance. A trusted preparation-Skip check passes without forcing clicks or extending the deadline.
8. The inherited 700 ms SVG fade briefly showed a second W behind the already-presented sculpture. The V2 fallback now hides immediately after the first successful 3D presentation and returns immediately on failure; actual rendered frames and an opacity assertion check the handoff.
9. A React cursor attribute could overwrite the stage's DRAG label when intro settlement rerendered the adapter. The stage now exclusively owns its discrete drag label. A browser check holds the pointer down across settlement and checks DRAG, then EXPLORE on release.

Playback fixtures warm the actual scene, replace the existing local history entry with its replay URL, navigate to booking, then use browser Back. This reuses parsed ES modules rather than spending the short readiness budget reparsing a complete document. The application handles normal route entry, resource recreation and readiness; no director state, clock, deadline or renderer is injected. Cold/fresh navigation and deliberately delayed shader readiness remain separate tests. A missing `class` attribute is correctly checked with a negative class assertion; it is not an intro lock. The delayed-shader fixture first observes preparation before asserting its disappearance, avoiding a premature assertion against prerendered HTML.

The playback-Skip check uses the real software tier's ordinary alloy with explicit replay; flowing balanced/high materials are independently compiled and exercised. The held-drag check reads the actual rendered cursor text. An unversioned dynamic import after Vite HMR had inspected a different pointer module instance even though the trace showed DRAG on screen; the preview was restarted before final focused checks and equivalent measurements. Visual captures sample initial progress, mid-assembly and the completed surface in separate replays. The completed surface is captured at settlement rather than requiring a software driver to present one particular late-animation threshold.

## Validation commands and browser coverage

Reconciled at the start of the full-site transformation, 11 October 2026: TypeScript, lint, production build and all 105 unit tests passed. The 42-case broad browser sweep passed 40 cases and failed native capture plus held-drag assertions. The final five-case focused rerun passed continuity, native captures, held drag and denied storage, but timed out waiting for playback in the trusted-Skip case. Thus 42 of 43 unique cases have a passing latest result; **V2.1B does not have an unconditional browser acceptance pass**. Full evidence: `browser-final-full.json` and `browser-reconciled-focused.json`. There were no skipped tests.

The two resolved playback fixtures now use the actual software tier rather than forcing balanced shader compilation into the short input window; separate balanced/high shader checks retain their strict assertions. Trusted playback Skip previously passed in the broad run and in another focused run, but remains intermittent under software preparation pressure. Its final failure record shows a usable settled identity with zero playback duration. No application deadline was increased and no failed assertion was removed. This is a validation limitation to revisit during the later intro milestone, not a release pass.

The existing full unit suite passed with 105 tests in nine files. It uses local in-process PGlite fixtures only; no hosted Supabase activation occurred. TypeScript, lint and the production build passed. The build prerenders eleven routes. All automated browser contexts block Formspree before navigation; the enquiry test reaches review without pressing Send or making any provider request.

Browser coverage includes the original nine viewports: 1920×1080, 1440×1000, 1280×720, 1024×768, 768×1024, 430×932, 390×844, 360×800 and 320×568. Added: ultrawide 2560×1080, landscape 844×390 and 390×844/DPR-3 touch emulation.

Actual interactions include pointer lighting, drag/inertia/reset, cumulative yaw beyond a full turn, above/below pitch, accessible quarter-turn controls, native vertical touch scrolling from the same surface, Discover, keyboard navigation, booking/privacy refresh, local V1/V2 switching and twenty route cycles. Failure coverage includes missing WebGL, rejected/delayed imports, delayed shader readiness, custom-only shader failure with ordinary recovery, all-shader failure, reduced motion/toggling, unavailable storage, early scroll/navigation, actual context loss/restoration during playback and repeated context-loss fallback.

Separate trusted mouse checks activate Skip during playback and hold a drag through intro settlement. The preparation fixture and playback fixture retain strict assertions; no test is silently skipped and no production deadline was increased.

Screenshots are inspected as rendered images. The six directions show a recognizable W with bevels, layered rear geometry and controlled graphite/blue/violet reflections; headline/CTA safe zones remain separate. Small viewport captures intentionally scroll to the reserved scene; text above the fixed header is outside the current viewport, not deleted content. Low-tier images show the ordinary alloy, not an untested liquid shader. Balanced/high shader branches are explicitly forced by test hints on SwiftShader, not misrepresented as physical GPUs.

Evidence is retained under ignored `test-results/v2-1b/`: `baseline-source/`, `baseline-dist/`, both versioned bundle/runtime JSON files, `summary.json`, the complete browser JSON, preserved earlier failure JSON/traces, `six-views.json`, `intro-continuity.json`, `intro-context-loss.json`, `intro-capture-metadata.json`, `skip-playing.json`, `drag-handoff.json`, `liquid-balanced.json`, `liquid-high.json`, `regression/route-cycles.json` and `safety.json`. The screenshot families are `identity-front/right/rear/left/above/below.png`, `intro-frame-0/1/2.png`, `intro-hero-handoff.png`, `identity-liquid-balanced/high.png`, `identity-ordinary-recovery.png`, `identity-2560x1080.png`, `identity-844x390.png`, both `v2-1a`/`v2-1b` desktop/mobile captures, and the responsive/reduced/no-WebGL/enquiry captures in `regression/`.

Before/after visual references: [approved V1 desktop](../test-results/v2-1b/regression/v1-desktop.png), [V2.1A desktop](../test-results/v2-1b/v2-1a-1440.png), [V2.1B desktop](../test-results/v2-1b/v2-1b-1440.png), [fragment assembly](../test-results/v2-1b/intro-frame-1.png), [rear](../test-results/v2-1b/identity-rear.png), [reduced motion](../test-results/v2-1b/regression/v2-reduced.png).

## Performance comparison

The before/after capture uses the same Windows host, Chromium launch flags (`--use-angle=swiftshader`), dev server, 1440×1000 and 390×844 viewports at device DPR 1, intro marked seen, 25 pointer moves with 50 ms waits, the same input-settled boundary, 2.5-second settling wait and a 1.5-second idle window. Shader branches, intro readbacks and responsive tests are separate workloads. No physical-device FPS, battery, thermals, GPU timing or VRAM measurements are claimed.

Fresh final-foundation measurement completed before any homepage transformation. `v2-1b-runtime.json` is current; the strict all-browser-pass summarizer intentionally remains unsatisfied because of the Skip result above.

| Metric | Frozen V2.1A | Final V2.1B |
| --- | ---: | ---: |
| Desktop / mobile renderer owners and canvases | 1 / 1 | 1 / 1 |
| Hero draw calls | 25 | 9 |
| Triangles | 416 | 448 |
| Uploaded geometry / texture / program objects | 16 / 4 / 4 | 12 / 4 / 4 |
| Logical sculpture materials | 7 | 3 |
| Desktop / mobile presented frames | 52 / 98 | 61 / 82 |
| Desktop / mobile recorded gap samples | 42 / 96 | 58 / 79 |
| Desktop / mobile first useful DOM observation, ms | 1102.8 / 3453.4 | 923 / 877 |
| Desktop / mobile idle draws over 1.5 seconds | 0 / 0 | 0 / 0 |
| Initial/preloaded JS raw / gzip bytes | 322168 / 104051 | 327058 / 105468 |
| Three vendor raw / gzip bytes | 578436 / 149002 | 581794 / 149659 |

These observations do not establish an idle-rendering improvement or a physical-device speed gain. Both versions stopped idle draws, and the compositions differ. All raw gap arrays are retained, including startup limitations described below.

`renderer.info` geometry/texture/program counts include internal Three resources and are not live heap or GPU bytes. Logical sculpture materials are reported separately. Frame gaps are CPU draw-start intervals, filtered to positive values below 250 ms and capped at 1,200 samples; excluded long gaps must not be interpreted as a smooth frame rate. Shader `compileShader` call durations are CPU call timings, not total driver compilation/linking or GPU execution time. First useful frame is observed through the `.core-ready` DOM change after a successful draw, including React commit and startup/lazy-loading time. Mobile first-frame timing also includes scrolling the initially lower scene into view.

Both V2.1A and V2.1B stop idle draws. No idle improvement is claimed. The quieter W composition removes the former decorative fold/frame meshes; lower draw calls therefore do not establish an equal-feature GPU-speed improvement. MSAA, environment resolution, bevel profiles and material behavior also changed. Shared driver caches, test order and host contention limit causal timing comparisons.

## Safety, limitations and next phase

The five existing V2 reports (four approved blueprints plus V2.1A validation) remain byte-identical to the pre-change snapshot. Fourteen hosting/business/dependency files retain identical text and no Git changes. Cross-worktree raw hashes differ where the original uses LF and the worktree uses CRLF; those files were not rewritten. Original source/report/video hashes match the recorded baseline, and all 554 original video files remain present.

Remote read-only verification still reports only `master` at the original commit. A read-only production GET returns HTTP 200 and the existing V1 `/assets/index-CF_s-Fxu.js`. No remote mutation, workflow dispatch, deployment, domain change, enquiry submission or hosted backend operation was issued.

Physical-device performance/touch behavior, Safari and Firefox remain unverified. Browser evidence comes from actual Playwright Chromium interactions and inspected screenshots. High/balanced capability overrides exercise branches on a software renderer; they do not prove hardware frame budgets. Driver compilation can still block the main thread. No release or production-readiness claim is made.

Local review: `http://127.0.0.1:5175/?experience=v2`; replay: `http://127.0.0.1:5175/?experience=v2&intro=1`; V1 comparison: `http://127.0.0.1:5175/?experience=v1`. Public hosts always retain V1.

The next phase is V2.2, the curved spatial website carousel, after user review of this identity. Its starting work is a bounded original screen geometry and one authoritative gallery controller through the existing renderer, preserving real project data and HTML links. No V2.2 implementation is included here.
