# WEBORA V2 — Phase 1 audit

Audit date: 10 October 2026, Asia/Calcutta. Scope: inspection and blueprint only. V1 is the approved production application at [webora.design](https://webora.design/).

Read alongside [Creative direction](WEBORA-V2-CREATIVE-DIRECTION.md), [Technical architecture](WEBORA-V2-TECHNICAL-ARCHITECTURE.md), and [Implementation plan](WEBORA-V2-IMPLEMENTATION-PLAN.md).

## 1. Evidence and confidence

- **SOURCE** means inspected current code, not proof of browser quality.
- **BROWSER** means observed in the actual public site in this phase using the in-app browser.
- **MEASURED** means values collected from the current build or public HTTP responses.
- **PRIOR VERIFICATION** means evidence from the completed custom-domain recovery earlier on 10 October; it was read, not rerun here.
- **PROPOSAL** means a future V2 decision, never a claim about existing behavior.

No application code, dependencies, production configuration, Git history, remote state, or hosted form settings were changed in this phase. Four new Markdown documents are the intended deliverables. Supporting measurements are in ignored `test-results/v2-phase1/`.

## 2. Working-tree and production safety

Verified before writing:

| Item                                                  | Current observation                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| Branch                                                | `master`                                                              |
| Local HEAD                                            | `3f57b43cb843058cbdb68b6cf5e1acf057e7d361`                            |
| Previous commit                                       | `f6e4067636c65636ded423174345e2e72b2316e1`                            |
| Remote                                                | `https://github.com/kiratveersinghralhan-hue/Webora.git`              |
| Remote heads, read via `git ls-remote --heads origin` | Only `master`, at the same recovery commit                            |
| Tracked modifications                                 | None                                                                  |
| Pre-existing untracked file                           | `PRODUCTION-VALIDATION.md`, preserved                                 |
| Local V2 branches/worktrees                           | None; only this checkout and local `master`                           |
| Deployment triggers                                   | Push to `master`, plus `workflow_dispatch`                            |
| Production environment                                | `github-pages`; build uses `/` and `https://webora.design` explicitly |

`video-output/` is excluded by `.git/info/exclude`, rather than tracked. It contains the final reel (11,109,363 bytes), long cut (13,403,694 bytes), 13 MP4 source clips, editing intermediates, helpers and reports. Preserve the entire directory. Do not use `git clean`, resets, blanket restores, or copy it into a release.

**Isolation decision:** these documents remain uncommitted in the requested repository. No visual experiment is performed here. Future implementation should use a separate worktree on `codex/webora-v2`, starting from the verified V1 commit; exact non-destructive preparation steps are in the implementation plan. Do not switch or reset this checkout to make V2. Do not copy its ignored local files into the new tree automatically. No worktree was needed or created for this documentation-only phase.

The existing `PRODUCTION-VALIDATION.md` describes the older github.io deployment and derives URLs from Pages metadata. Treat those deployment details as historical. The inspected current workflow and recovery evidence establish the custom-domain baseline; do not edit the historical report to make it appear current.

## 3. Existing architecture

| System             | SOURCE observation                                                                                                                                 | BROWSER / proof boundary                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| App/routes         | React 19.3, Vite 8.3.2, TS 6.0.3, React Router 7.18.4. Home eager; other main routes lazy through Suspense in `src/App.tsx`.                       | Home, Work, and booking rendered in this phase. Public recovery verified all 11 prerendered routes and refreshes.                     |
| Layout             | `src/layouts/Layout.tsx` owns navigation, mobile menu/focus handling, cursor, progress indicator, and View Transition interception.                | Mobile menu navigated to booking. Lazy route showed “Opening the studio…” before the form appeared.                                   |
| Progressive 3D     | `Spatial.tsx` lazily imports `engine.ts` near the viewport, catches initialization errors, and keeps HTML fallbacks.                               | Actual hero, work, services, fabric/process canvases mounted as sections were visited.                                                |
| Renderer ownership | Every `createScene()` creates a WebGLRenderer, Scene, PerspectiveCamera, lights and reflection cube.                                               | Five canvases remained mounted after traversing the homepage; Work route later had one.                                               |
| W/core             | Custom extruded W silhouette, beveled front sculpture, rear mesh, triangulated intro pieces, detached beams and brackets.                          | Real depth and W geometry visible on desktop/mobile; not a CSS-only spinning image.                                                   |
| Materials/light    | Standard metallic materials, small generated 64×64 cube faces, ambient, directional and blue/violet point lights; ACES tone mapping, exposure 1.3. | Clear blue/violet identity, but broad flat front faces and edge aliasing are visible. No liquid material is present.                  |
| Shader             | `fabric` has a custom displaced grid ShaderMaterial using time, pointer, velocity and scroll uniforms.                                             | Canvas mounted while traversing the section. This is a wire/grid surface, not demonstrated liquid refraction.                         |
| Scrolling          | One layout-owned Lenis instance, lerp .075, native touch (`syncTouch:false`), GSAP ticker → Lenis RAF → ScrollTrigger update.                      | Scroll to Discover reaches work; runtime reports one Lenis instance. Earlier recovery measured smooth inertia.                        |
| Motion             | Scoped GSAP context, route entry blur/translation, hero depth, section reveals; cleanup uses `context.revert()`.                                   | Hero exits and service/process transitions observed. No shared world/camera across sections.                                          |
| Carousel           | Four projects, native Three browser screens, continuous index, drag momentum, keys/Home/End, horizontal wheel and desktop-only ScrollTrigger pin.  | Gloss Boss selection changes metadata and image. Tablet has no pin. Transitions briefly overlap metadata; settled views are readable. |
| Services           | Six disclosures switch compositions of seven folded planes. Compact layout moves the model above the list.                                         | E-commerce disclosure and geometry state changed. Forms remain reachable through HTML CTAs.                                           |
| Process            | Six accessible tabs, scroll-driven active stage, tube/path/nodes and traveler.                                                                     | Launch tab updates copy and model state. Geometry looks more like a separate schematic than a continuation of the W.                  |
| Enquiry            | Six-step React form, Zod, optional local drafts, attribution, retry/pending/success, Formspree AJAX.                                               | Mobile page and fields render. Prior recovery exercised all six steps and review/edit without submitting.                             |
| SEO/hosting        | SSR prerender, metadata, sitemap/robots, Pages fallback, root base helpers.                                                                        | Live sampled documents/assets HTTP 200; sampled artifact bytes match local dist.                                                      |

The pinned gallery condition is **width ≥900, height ≥740, fine pointer**. The 1280×720 browser inspection therefore covered its unpinned desktop composition; the earlier 1440×1000 recovery covered the larger desktop behavior. Do not confuse width-only testing with pinned-gallery coverage.

## 4. Strengths worth preserving

1. The W is recognizable, original procedural geometry; its extruded depth, rear layer and common blue/violet lighting provide a coherent starting identity.
2. Intro and hero reuse the same canvas. Source triangulates the actual W, then moves the core from intro placement to hero using a 550 ms FLIP-style DOM animation. It is more considered than a separate loading video.
3. Content remains semantic HTML. Project links/status, service descriptions, process tabs and booking are not hidden inside a canvas-only interface.
4. Portfolio metadata is conservative: real live links, explicitly in-progress work, separately labeled concepts. Preserve this commercial credibility.
5. Shared pointer state, horizontal-intent touch handling, lifecycle cleanup, lazy route loading, and static fallbacks already exist. V2 should evolve these systems instead of replacing the app wholesale.
6. The restrained dark palette, crisp Space/DM typography and prominent Start a Project pathways work at mobile width. The business offer remains understandable before interacting with 3D.

## 5. Current limitations and consequences

| Finding                             | Evidence                                                                                                                                               | V2 implication                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separate visual islands             | Five scene kinds with separate cameras/renderers; hero fades out, other scenes appear in their own boxes.                                              | A shared stage and camera director are needed for continuous spatial storytelling.                                                                                                |
| W material feels machined/flat      | Visible broad front faces; StandardMaterial, inexpensive gradient cube, no actual transmission/refraction shader.                                      | Improve bevel normals, front/back detailing, controlled original environment and subtle material flow before adding spectacle.                                                    |
| Jagged bright edges                 | Renderer explicitly disables antialiasing; capped DPR, visible in browser.                                                                             | Choose MSAA at renderer creation by capability/benchmark; compare with modest shader AA, never fix by unbounded DPR.                                                              |
| Double gallery smoothing            | UI index eases at 135 ms, engine index again at 125 ms. React active project rounds the first index before mesh settles.                               | One authoritative continuous position; discrete metadata changes at a defined settle/crossfade point.                                                                             |
| Gallery reads as rectangular panels | Current screens lie on an offset depth line, with yaw/scale recession; they are not curved image ribbons.                                              | A shallow arc and gently curved preview surfaces can establish a stronger signature without warping screenshots heavily.                                                          |
| Visual transition overlap           | Browser capture during tablet selection showed outgoing/incoming text together before settling; CSS visibility/opacity transitions last .45 s.         | Limit metadata transition to one outgoing/incoming pair and a fixed-height HTML area; all inactive cards inert. This is a transition observation, not a persistent broken layout. |
| Generic secondary geometry          | Seven service beams, faceted process nodes/toruses, grid fabric.                                                                                       | Derive secondary forms from W segments and screen surfaces; eliminate decorative objects without a content role.                                                                  |
| Multiple clocks/layout reads        | Pointer RAF, per-scene RAF, gallery RAF, GSAP ticker, progress RAF. Engine reads host rect per rendered update and queries data attributes/ancestors.  | Centralize hot updates and batched layout measurement; retain independent DOM transition ownership only where needed.                                                             |
| Contexts persist offscreen          | IntersectionObserver pauses draw loops but does not release initialized scene contexts until unmount.                                                  | One renderer per active route experience, shared texture/cache ownership.                                                                                                         |
| Mobile idle cost                    | `continuous` hero condition also applies on real touch hardware when not software/adaptive; mobile hero frame counter kept advancing while stationary. | Touch/low power should settle to an on-demand still; continuous idle lighting must be optional. No thermal result was measured.                                                   |
| Adaptive heuristic is narrow        | First 30 frames; >18 gaps above30 ms drops quality; no long-window recovery.                                                                           | Use rolling sustained performance windows/hysteresis, separating shader startup from interaction sampling.                                                                        |
| Context restoration incomplete      | `webglcontextlost` hides canvas and activates fallback; no restore handler reinstates scene.                                                           | Recreate resources safely on recovery, or remain explicitly in fallback until opt-in retry.                                                                                       |
| Intro timer competes with readiness | 2.05 s mesh phase; Core limits opening to2.9 s and up to2.25 s after readiness; GPU speed may shorten displayed narrative.                             | Readiness-driven short choreography with hard safety timeout, never a minimum artificial wait.                                                                                    |
| Optional motion is one-way in UI    | “Enable 3D experience” exists for reduced motion; `enableMotion` sets session preference. No visible reverse toggle.                                   | Offer a reversible motion preference while preserving OS default.                                                                                                                 |
| Booking has a small decorative core | Source and browser show one canvas on booking; it is pointer-disabled.                                                                                 | V2 booking should use a quiet still or no WebGL, independent of marketing-scene failure.                                                                                          |

Cleanup is substantial: observers, listeners, pointer subscription, materials/geometries/textures, renderer and context are disposed on unmount. This is a strength, not proof of zero leaks. Partial initialization failures before a cleanup closure is returned, asynchronous asset callbacks, and persistent caches need explicit ownership in V2.

## 6. Portfolio and protected business facts

| Project                   | Existing status | Existing URL                         | Preview and behavior                                                    |
| ------------------------- | --------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| Harvester Parts           | LIVE            | `https://harvesterparts.in`          | Actual September 2026 website capture; case study and external link     |
| VEYRATH                   | IN PROGRESS     | None                                 | Portfolio artwork, not a live screenshot/payment claim; case study only |
| Gloss Boss                | LIVE            | `https://glossbossautomotive.online` | Actual September 2026 capture; case study and external link             |
| Article Project           | IN PROGRESS     | None                                 | Final name, scope and preview unconfirmed; no case-study link           |
| Form & Field / Off Script | CONCEPT         | None                                 | Two independent explorations in the separate archive                    |

These are current repository facts (`src/data/studio.ts`), not a fresh audit of the clients' entire businesses. Do not relabel VEYRATH or Article Project live. Do not invent a research brand, completed article screenshot, new URL, client testimonial, metric or commerce readiness. All four featured entries belong in the gallery; Article Project needs an honest original typographic placeholder.

Preserve existing contact data, privacy copy, six steps, storage key/expiry/consent reset, attribution and provider payload. `src/services/enquiries.ts` uses the existing `VITE_FORMSPREE_FORM_ID` build variable, JSON/Accept headers, `_gotcha`, 20 s timeout, omitted credentials and explicit429/failure behavior. Only provider-confirmed successful HTTP changes to success. Provider inbox delivery is a separate concern and was not tested.

## 7. Performance baseline and unavailable measurements

Current artifacts read without rebuilding; samples compared to the actual site. Decimal bytes, not KiB:

| Measurement                     | Result                                            | Method / limit                                                                                      |
| ------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| HTML initial/preloaded JS graph | 318,370 raw / 101,707 gzip                        | Existing `scripts/report-bundle.mjs`; includes modulepreloads; excludes subsequent dynamic imports  |
| Main JS chunk                   | 262,914 / 81,452 gzip                             | Local compression; public bytes match                                                               |
| Three foundation                | 200,133 / 55,031 gzip                             | Lazy chunk                                                                                          |
| Three renderer                  | 378,303 / 93,971 gzip                             | Lazy chunk; splitting does not eliminate its cost when activated                                    |
| Scene engine                    | 13,753 / 6,091 gzip                               | Lazy chunk                                                                                          |
| Motion vendor                   | 131,466 / 48,908 gzip                             | GSAP/Lenis vendor chunk; pageMotion wrapper separate                                                |
| Main CSS                        | 64,705 / 14,397 gzip                              | Existing build                                                                                      |
| Homepage HTML                   | 38,812 raw                                        | Public response matched local file                                                                  |
| Three project images            | 65,192 / 49,560 / 97,962 bytes                    | Harvester / VEYRATH / Gloss Boss compressed files; not GPU memory                                   |
| Public cache policy, sampled    | `max-age=600`                                     | HTML, JS and CSS responses; do not assume immutable year-long Pages caching                         |
| Canvas count                    | 5 after visiting home sections; 1 on Work/booking | Browser DOM; allocated contexts, not simultaneous active draws                                      |
| Viewports observed now          | 1280×720,768×1024,390×844                         | No positive horizontal overflow at DOM samples; mobile width is emulated, not physical-device proof |
| DPR observed                    | Desktop1.25; mobile approximately1.0              | Browser data attributes; source caps1.5 desktop/1.15 touch, with fill-rate budgets                  |

Evidence: `test-results/v2-phase1/bundle.json`, `baseline.json`. Sampled public root, main JS, both Three chunks and CSS all returned200 and matched local bytes.

Historical local `qa/performance-immersive.json` records120 frame samples, p50≈16.7 ms, p95≈33.4 ms, maxgap≈99.9 ms and one101 ms long task. It lacks a fresh controlled device/thermal baseline, so it is **not a new Phase1 benchmark or mobile FPS guarantee**.

Not measured in this phase: renderer draw calls/triangles, exact GPU timings or memory, CLS/LCP/INP field percentiles, thermal behavior, battery drain, physical iOS/Android behavior and cross-browser context restoration. `renderer` is private inside `createScene`; source exposes frame/DPR data, not `renderer.info`. Instrument locally in the isolated worktree before optimizing; do not invent these values or scrape hidden reference internals.

## 8. Browser coverage and regression evidence

This phase: reduced-motion initial experience (static visible content, opt-in3D), enabled3D hero, Scroll to Discover, Gloss Boss gallery selection, E-commerce disclosure/model, Launch process tab/model, tablet gallery, mobile hero/menu/booking layout, one-instance Lenis state and route canvas cleanup. Source provides fallback/touch contracts; viewport resizing here does not emulate physical touch physics.

Prior recovery evidence on the same unchanged commit: 9 live check groups passed,426 responses with0 HTTP failures/console-page errors and0 Formspree attempts; all11 routes refreshed;43 published files matched artifact; unit70/70, TS/build/cleanCI lint passed. Full normal-motion browser suite33/34, with an existing form test racing the90 ms step guard; isolated reduced-motion test passed. Preserved local video helper scripts have3 lint findings outside tracked application code. These are carried forward, not quietly marked resolved or rerun in Phase1.

The existing browser tests deliberately abort/mock Formspree. Do not run a production enquiry test that can reach a real endpoint. Context-loss and WebGL-disabled coverage exist in source tests, but no new forced context-loss experiment was performed on production here.

The local Pages harness is also historical: `scripts/pages-preview.mjs` and `playwright.pages.config.ts` default to `/Webora/`, and `tests/pages/production.spec.ts` contains hardcoded subpath assertions. Future V2 validation must parameterize the local harness and expectations together for the current root deployment. Changing only `WEBORA_TEST_URL` does not correct those assertions. This is a test-coverage limitation, not evidence of a current production-base failure; no harness/configuration was edited in this phase.

## 9. Missing input and review boundary

`abstract-liquid-effect-landing-page.zip` was not found in this repository, the accessible ChatGPT documents tree, supplied attachment folders or the Downloads top level. It needs to be supplied again for source/license inspection. The blueprint can proceed with original procedural geometry/shaders; it does not claim to have audited that ZIP or licensed any of its contents.

All five references were opened; reliable observations and limits are recorded in the creative-direction document. Batcloud's homepage is a minimal question interface in this environment; its supposed experimental WebGL was not verified. No reference assets/code were copied.

Phase1 ends with these documents. No V2 implementation, commit, push or deployment is authorized by this document.

## 10. Phase 1 closeout verification

All four requested documents exist, their cross-links resolve, code fences are balanced, and Markdown formatting was checked. The ten protected files captured in the Phase 1 baseline, including the historical report, deployment/build settings, enquiry/data files and both final videos, still match their SHA-256 hashes. Git reports no tracked diff; HEAD remains `3f57b43cb843058cbdb68b6cf5e1acf057e7d361` on `master`. The only new visible working-tree entries are the four documents; the pre-existing untracked report remains present.

Application TypeScript, lint, unit and browser suites were not rerun for this documentation-only phase. Their earlier recovery results and known limitations are explicitly labeled in section 8. The implementation plan lists future verification requirements without claiming they have passed.
