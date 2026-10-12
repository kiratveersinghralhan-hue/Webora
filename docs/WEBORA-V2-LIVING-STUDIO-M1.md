# WEBORA — Living Digital Studio, Milestone 1

11 October 2026. Local worktree `C:\Users\ACER\Documents\ChatGPT\Webora V2`, branch `codex/webora-v2`. Baseline SHA `3f57b43cb843058cbdb68b6cf5e1acf057e7d361`. This is the first visual review checkpoint requested by the latest transformation brief. It is not the completed six-milestone website or an approved release.

## Preserved foundation and reconciliation

All four Phase 1 blueprints and the V2.1A/V2.1B reports were reviewed before the visual work. Existing GSAP clock, shared renderer, quality policy, leases, geometry, materials, input controller, fallbacks and route cleanup were extended in place. The original master checkout was not edited. The only existing Webora V2 Vite process was this task's preview; it was reused, then restarted through its own command session after edits. An unrelated portfolio project's server on port 5173 was left alone.

A recoverable non-Git checkpoint is saved at `test-results/checkpoints/20261011-foundation/`: 136 source/report files, `sha256.json`, baseline HEAD, full status and binary working-tree patch. It includes existing untracked foundation files. No private environment, dependencies or videos were copied or removed. This satisfies the checkpoint requirement without a commit, stash, push or deployment. The earlier ignored screenshots, traces and measurements remain in their existing folders.

Final verification rehashed all 136 checkpoint copies and confirmed all corresponding working files still exist: zero preservation failures. The master checkout remains at `3f57b43cb843058cbdb68b6cf5e1acf057e7d361` with no tracked diff; the remote still reports only master at that SHA. All 554 original video-output files remain, with protected baseline hashes intact. Four approved blueprints and the 1A report remain unchanged.

The interrupted V2.1B verification was reconciled explicitly in [its report](WEBORA-V2-1B-VALIDATION.md). The final five-case focused rerun passed four checks, including native assembly captures and held-drag continuity. Playback Skip remains intermittent when software preparation consumes its short readiness window; it previously passed the broad run, but the latest focused attempt did not observe playback. Consequently V2.1B is not described as an unconditional acceptance pass. The 2.9-second application deadline and strict assertions remain unchanged. That limitation carries into the later cinematic-intro milestone.

## Implemented visual direction

- A centered two-line editorial hero, replacing the old left-copy/right-logo grid and giant bottom wordmark. Existing DM/Space font assets are retained; a system serif italic supplies contrast without adding a remote font dependency.
- An original folded architectural setting around the existing forged W: two recessed solid apertures and a four-slope display landscape. These use closed beveled procedural geometry, the existing lighting/environment and the same renderer/camera. The setting stays grounded while the W turns; pointer response is bounded and settles through the existing draw gate.
- Dark graphite and midnight-blue atmosphere, ultraviolet material highlights, quieter capsule navigation, rounded enquiry controls and an explicit business offer. The heading, business description and enquiry actions remain independent semantic HTML.
- A pale blue editorial interval between the hero and selected work, a new work-section heading/composition, shared typography, section rhythm, service surfaces and footer treatment.
- Intentional stacked tablet/mobile ordering: heading, business explanation and enquiry before the scene. Short screens scroll naturally. No new scroll lock or pinning.
- The inherited hero text fly-away/fade timeline is excluded from the new composition; normal section reveals and the one layout-owned Lenis remain. A full shared chapter/camera director is pending Milestone 4.

The recognizable W and its V2.1B flow/intro systems are preserved. This milestone does not redo the logo, add a second renderer, fetch external models, introduce a framework or activate any backend.

## References and originality

The supplied pages were reopened, and the earlier detailed visual audit was retained. [Felix Rieseberg](https://www.landing.love/sites/felixrieseberg/) informs an identity placed in a purposeful environment; [Superlocal](https://www.superlocaldesign.com/) informs a cohesive spatial arrangement; [Ricardo Chance](https://www.ricardochance.com/) informs editorial contrast and a clear commercial offer; [Kenichi Aikawa](https://aikawakenichi.com/) remains the priority for the future curved gallery; [Batcloud](https://batcloud.art/) informs restraint. Current browser screenshots confirmed Felix's monitor entry, Superlocal's arranged circular composition, Ricardo's dramatic type/lighting and Batcloud's sparse question interface. Kenichi's current revisit showed its loading/entry composition; the prior documented gallery interaction remains the detailed reference evidence. No new claim about private engine technology, physical simulation or performance is made. No reference assets, code, client images or fonts were copied.

## File map

| File | Milestone contribution |
| --- | --- |
| `src/pages/LivingHome.tsx` | New local V2 hero, manifesto, work heading and retained editorial chapters. |
| `src/pages/Home.tsx` | Local-only V2 branch; V1 remains the SSR/public default. |
| `src/styles/living.css`, `src/main.tsx` | Scoped visual system and responsive compositions. |
| `src/layouts/Layout.tsx` | V2 styling scope around existing navigation/menu/booking/footer owners. |
| `src/three/geometry/studioArchitecture.ts` | Original closed folded portal and landscape geometry. |
| `src/three/scenes/CoreScene.ts` | Optional studio setting, leased resources, framing, discrete diagnostics and cleanup. |
| `src/three/IdentityCore.tsx`, `src/three/ExperienceStage.tsx` | Pass the optional studio composition into the existing runtime. |
| `src/lib/pageMotion.ts` | Preserve readable new hero; exclude the inherited V1 hero exit animation. |
| `src/components/ExperienceSwitcher.tsx` | Accurate local milestone label. |
| `tests/studio.test.ts` | Geometry finiteness, same identity through full turns, bounded quality rebuilds and complete/idempotent cleanup. |
| `tests/v2-browser/living.spec.ts`, `playwright.living.config.ts` | Targeted visual/input/content checks plus existing 24-case foundation regression. |
| `tests/v2-browser/runtime.spec.ts` | Update two old UI-label expectations to the real new labels; preserve behavioral assertions. |
| `tests/v2-browser/identity.spec.ts` | Count the two added studio finishes alongside the original three W materials; allow a separate evidence output folder so new checks preserve historical 1B artifacts. |

No modifications to Formspree, the six-step form, project/contact facts, privacy, metadata/sitemap generation, deployment workflow, domain, dependencies or original video files.

## Validation and evidence

All automated contexts abort Formspree requests before navigation. The form is exercised through review without Send. Evidence lives under ignored `test-results/living-m1/`, separated from the preserved V2.1A/V2.1B artifacts.

| Command / check | Result |
| --- | --- |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm test -- --maxWorkers 1 --no-file-parallelism --hookTimeout 120000` | 106 tests in ten files passed, none skipped; final full run 11.63 seconds. |
| `npm run build` with `VITE_BASE_PATH=/`, `VITE_SITE_URL=https://webora.design` and blank local Formspree environment | Passed: 2,448 modules, 11 prerendered routes; final Vite build 1.60 seconds. No hosting file or provider setting changed. |
| `npx playwright test --config playwright.living.config.ts` | Full 28-case run: 26 passed, two new fixture failures. All 24 inherited foundation cases passed. Failures were the heading's rendered whitespace and a short-landscape scene below the viewport, both corrected in the test fixtures. |
| Same config, focused six living-studio cases plus production hydration | Seven passed in 98.77 seconds. |
| Same config, final full-turn/CTA/capture and production-hydration polish checks | Two passed in 35.27 seconds after the final contrast CSS correction. |
| `node test-results/living-m1/summarize.mjs` | Strict latest-result merge: 30 unique cases passed across the full and focused runs, zero skips. This is not presented as one clean 30-case sweep. |
| `npx playwright test --config playwright.identity.config.ts --grep 'actual liquid shader\|high-tier clearcoat' --reporter=list,json --output test-results/living-m1/material-checks` with isolated JSON/artifact output environment | Both strict balanced/high material checks passed in 12.51 seconds. Capability hints exercise these branches on SwiftShader; they are not physical-device performance measurements. |
| `node test-results/living-m1/measure.mjs` | Equivalent-condition desktop/mobile runtime measurements completed without page errors. |
| `node test-results/living-m1/normal-browser.mjs` | Installed Chrome using the actual Intel GPU selected high tier and completed intro playback/handoff; no capability override or page errors. |
| `node test-results/living-capture.mjs` | Eleven responsive capture sizes, all zero horizontal overflow and zero page errors. |
| `node test-results/living-m1/final-surfaces.mjs` | Fresh services/process viewport captures and reduced-motion/no-WebGL surfaces; zero errors, both fallback cases zero canvases. |
| `node test-results/v2-1b/audit.mjs` | 108 local asset references across 12 HTML files resolve; root canonicals and protected file/video/master/remote invariants pass. Read-only production GET still returns existing V1. |
| `git diff --check` | Passed; checkout LF/CRLF notices only. |

The inherited browser coverage includes one-renderer ownership, first-frame readiness, offscreen/hidden suspension, keyboard controls, context loss/restoration/repeated-loss fallback, shader/import failures and cancellation, reduced-motion toggling, route refresh, V1/V2 exclusive selection and production diagnostics exclusion. Twenty home/booking cycles hold uploaded geometry counts at 14 each time and release the canvas/active owner on booking. Existing business tests cover all six form steps through review with zero provider submissions. Unit database tests remain local in-process tests, not hosted backend verification.

Actual interactions inspected include full-turn drag with unchanged W/geometry IDs, keyboard reset, work-anchor scroll, enquiry CTA, all six service disclosures, process Home/End keys and preserved project statuses/real links. Chromium touch emulation at 390×844/DPR 3 rotates horizontally and allows a vertical native swipe; this is not a physical phone result.

Responsive captures cover 1920×1080, 1440×1000, 1280×720, 1024×768, 768×1024, 430×932, 390×844, 360×800, 320×568, 2560×1080 and 844×390. Representative final desktop, tablet, narrow-mobile, short-landscape, work, manifesto, service/process and fallback images were visually inspected. On short viewports the scene and remaining content are reached by ordinary scrolling. At 320 pixels the italic title intentionally wraps further; the content does not overflow horizontally.

Primary images: `normal-browser-desktop.png` (actual Intel high tier), `hero-1440.png`, `hero-full-390.png`, `hero-320.png`, `hero-768.png`, `work-entry.png`, `manifesto.png`, `services-viewport.png`, `process-viewport.png`, `reduce-final.png` and `no-webgl-final.png`. Historical full-run screenshots remain alongside the refreshed final captures, with their corresponding JSON reports. Element screenshots taken while native/Lenis scroll was settling were replaced for review by settled viewport captures; the final service/process captures record the header at y=0, height=100.

Visual corrections made during this milestone: the pale manifesto initially inherited the dark-theme muted paragraph color; it now has explicit navy text. The local comparison label moved above the header so it does not overlap the business offer or scroll cue. The folded setting was refined into a continuous asymmetric aperture rather than loose planks. No business/hosting behavior was changed to address these issues.

## Measured performance and limits

Frozen V2.1A, reconciled V2.1B and M1 were measured with the same Chromium/SwiftShader helper, 1440×1000 and 390×844 at deviceScaleFactor 1, seen intro, 25 pointer moves at 50 ms, the same pointer-settled boundary, 2.5 seconds settling and a 1.5-second idle sample. This excludes screenshot/shader-branch/native-Chrome checks. All use low tier.

| Metric | Frozen V2.1A | Reconciled V2.1B | Living studio M1 |
| --- | --- | --- | --- |
| Active owners / canvases | 1 / 1 | 1 / 1 | 1 / 1 |
| Hero draw calls / triangles | 25 / 416 | 9 / 448 | 12 / 620 |
| Uploaded geometries / textures / programs | 16 / 4 / 4 | 12 / 4 / 4 | 14 / 4 / 4 |
| Logical material instances | 7 | 3 | 5 |
| Desktop cumulative draws / filtered gap samples | 52 / 42 | 61 / 58 | 75 / 72 |
| Mobile cumulative draws / filtered gap samples | 98 / 96 | 82 / 79 | 89 / 86 |
| Desktop median / p95 draw-start gap, ms | 68.5 / 230.3 | 61.4 / 229.4 | 49.3 / 95.1 |
| Mobile median / p95 draw-start gap, ms | 34.5 / 106.6 | 34.4 / 49.4 | 35.6 / 50.3 |
| First useful desktop / mobile, ms | 1102.8 / 3453.4 | 923 / 877 | 915 / 900.8 |
| Desktop drawing DPR / mobile DPR | 0.9681 / 1 | 0.9681 / 1 | 0.8248 / 1 |
| Desktop / mobile idle draws | 0 / 0 | 0 / 0 | 0 / 0 |
| Initial/preloaded JS raw / gzip, bytes | 322,168 / 104,051 | 327,058 / 105,468 | 330,356 / 106,065 |
| Three.js chunk raw / gzip, bytes | 578,436 / 149,002 | 581,794 / 149,659 | 581,794 / 149,659 |

The studio adds three draw calls, two uploaded geometries and two material instances to 1B; no second renderer, texture or program. Initial JS adds 3,298 raw / 597 gzip bytes; Three.js size is unchanged from 1B. The proposed 115,000-byte initial gzip and 600,000-byte Three.js raw limits are met. These are scoped bundle checks, not an overall performance-budget acceptance.

For context, the retained V1 baseline reproduced five live owners/canvases after section traversal versus one in V2. Its historical hero sample had 25 calls, 520 triangles and zero idle draws; the fresh M1 regression again exercises the V1 comparison without enabling it beside V2. Original initial/preloaded JS was 318,354 raw / 101,700 gzip bytes and Three.js 578,436 / 149,002. The original baseline and all V2 samples already stop drawing at idle: **no idle-rendering improvement is claimed**. The comparison does not imply that migrating the remaining section worlds is complete.

Draw gaps are CPU draw-start intervals filtered below 250 ms, not GPU timing or presented FPS. Host contention, shader caches, different visuals/framing/antialiasing and the larger desktop scene slot (same 350k pixel cap, hence different DPR) limit causal speed comparisons. First-useful DOM timing includes loading, React, intersection and scroll. Resource counts are object counts rather than exact VRAM/heap reclamation.

Separately, installed Chrome 153 on Windows used `ANGLE (Intel, Intel(R) UHD Graphics (0x00009BC4) Direct3D11 vs_5_0 ps_5_0, D3D11)` without driver/capability override. It selected high tier, rendered one owner/canvas at 12 calls, 1,132 triangles, 14 geometries, four textures/programs and five materials. Observed phases progressed preparing → playing → handoff → settled, approximately 2,689.5 ms from preparing to settled; requested playback was 1,265 ms. This supplementary actual desktop-backend check is not the equivalent SwiftShader benchmark, a physical-phone/thermal result, or a resolution of the separate intermittent trusted playback-Skip check.

The complete advanced 1B identity suite has not been newly accepted for this milestone. Its two material checks were maintained and rerun, but the previously reconciled playback-Skip limitation remains explicit. No assertion or application deadline was weakened to manufacture a pass.

## Milestone status and review boundary

| Milestone | Status |
| --- | --- |
| 1. Art direction and homepage composition | Implemented for visual review. |
| 2. Curved spatial portfolio | Pending. Current honest HTML project presentation remains; it is not called the finished spatial gallery. |
| 3. Services/process worlds | Pending. Existing disclosures/tabs/content and semantic fallbacks retained with the new visual treatment. |
| 4. Connected camera/scroll choreography | Pending. One renderer/camera foundation retained; no claim of a full chapter director. |
| 5. Cinematic intro refinement | Pending. Existing V2.1B intro retained, including the software playback-Skip validation limitation. |
| 6. Full-site polish and performance | Pending; checkpoint-specific responsive and lifecycle checks performed here. |

Stop after this milestone for the user's visual approval. Physical iOS/Android devices, thermal/battery behavior, Safari/Firefox and hardware GPU frame budgets remain unverified. No overall production-ready or complete-transformation claim is made.

Local review: `http://127.0.0.1:5175/?experience=v2`. V1 comparison: `http://127.0.0.1:5175/?experience=v1`. Public hosts always select V1. No commit, push, workflow dispatch, deploy, DNS/HTTPS change, Formspree enquiry or Supabase activation was performed.
