# WEBORA V2.1A — resumed implementation and local validation

11 October 2026, Asia/Calcutta. Experimental worktree: `C:\Users\ACER\Documents\ChatGPT\Webora V2`, branch `codex/webora-v2`. Baseline: `3f57b43cb843058cbdb68b6cf5e1acf057e7d361`.

This continues the interrupted implementation. It preserves the existing runtime and the four approved Phase 1 documents. It implements the hero foundation only; it does not complete the shared-world gallery/services/process migration. All changes remain uncommitted. No push, workflow dispatch, deployment, hosted configuration change, Formspree submission or Supabase activation was performed.

The resumed checkout already contained the isolated worktree, renderer runtime, ordered clock, leases, diagnostics, quality policy, W module and partial validation. The outstanding work was responsive framing, first useful frame, failure/cleanup coverage and browser measurements. Those modules were retained and corrected in place; the baseline and implementation were not recreated.

## Runtime implementation

| Files | Responsibility |
| --- | --- |
| `src/lib/experience.ts`, `src/components/ExperienceSwitcher.tsx` | Explicit local V1/V2 selection and optional session persistence. Public hosts and SSR retain V1. Switching reloads the document so route interception cannot retain the old runtime selection. |
| `src/lib/frameClock.ts`, `src/lib/pageMotion.ts`, `src/lib/pointer.ts` | Reuse the existing GSAP ticker. Order scroll/ScrollTrigger, pointer, then world updates. One layout-owned Lenis instance; V2 introduces no separate RAF loop. Pointer damping snaps when settled. V1 retains its original pointer scheduler for comparison. |
| `src/three/ExperienceStage.tsx` | React adapter, intersection-triggered lazy loading, reduced-motion subscription, input registration and unconditional route cleanup. Rejects late imports after unmount. |
| `src/three/runtime/WorldRuntime.ts` | Route-owned renderer, scene, perspective camera, module registry, lights/environment, readiness, resize/visibility, draw scheduling, compile deadline/cancellation, context restoration and teardown. |
| `src/three/runtime/types.ts` | Typed mount/prepare/update/resize/quality/suspend/resume/dispose contract. Modules do not own renderers or global loops. |
| `src/three/runtime/AssetRegistry.ts` | Keyed resource leases, reference counting, duplicate allocation prevention, exactly-once disposal, rejection after registry disposal, and teardown continuation after a throwing resource. |
| `src/three/runtime/FrameGate.ts` | Dirty/moving/readiness/visibility/document-hidden/context-loss/disposal gates and tier-specific draw frequency. A running GSAP ticker does not imply a GPU draw. |
| `src/three/runtime/QualityPolicy.ts` | Capability hints, conservative unknown-hardware defaults, low/balanced/high tiers, DPR and total-pixel caps, bevel segments and sustained-window downgrade hysteresis. No automatic upgrade oscillation. |
| `src/three/runtime/studioEnvironment.ts` | Original generated studio reflection cube, leased once per runtime. No downloaded environment/model dependency. |
| `src/three/runtime/diagnostics.ts`, `src/three/engine.ts` | Opt-in development/local diagnostic records for V1 and V2: renderer ownership, draws, calls/triangles, uploaded resources, DPR/tier, frame gaps and lifecycle events. Production exposes no diagnostic API; new V2 DOM counters are development-only too. V1 changes are instrumentation only. |
| `src/three/geometry/weboraW.ts`, `src/three/scenes/CoreScene.ts` | Original W outline and extrusion, rear/edges/fold family, tiered bevel, original blue/violet lighting/material family, assembly, unwrapped yaw, constrained pitch, inertia, exact turn/reset and responsive camera framing. No liquid shader or final intro choreography. |
| `src/three/Core.tsx`, `src/three/Spatial.tsx`, `src/components/Projects.tsx` | Route-exclusive V2 adapter. Only the main W uses V2 WebGL; small booking decoration and non-migrated sections retain HTML/SVG. V1 engines/gallery smoothing cannot initialize alongside V2. |
| `src/layouts/Layout.tsx`, `src/styles/experience.css` | Local comparison control and reserved stage styling. The local label is absent on public hosts. |
| `tests/runtime.test.ts`, `tests/experience.test.ts` | Lifecycle, ownership, cleanup, frame gate, quality, geometry/framing and local/public selection tests. |
| `tests/v2-browser/runtime.spec.ts`, `playwright.v2.config.ts` | Dedicated local Chromium browser validation and comparable V1/V2 measurements. All Formspree requests are blocked before navigation. |

## Defects corrected during the resume

1. A temporarily zero-width slot could stay invisible after resize without a new intersection event. Resize now restores visibility from the independent intersection state and resumes suspended modules.
2. An obsolete compile rejection could dispose a newer restored context. Initialization and restoration completion/failure are guarded by generation and disposal/loss state.
3. A throwing scene/resource disposer could stop teardown before other resources, observers or the renderer were released. Cleanup now attempts every owner independently and remains idempotent.
4. The local comparison link could be intercepted as an SPA route update while the runtime selection remained memoized. It now performs a same-tab document reload; a real V2 → V1 → V2 interaction verifies exclusive ownership.
5. Camera distance could clip the W/rear during quarter turns or in narrow portrait slots. Distance now uses the limiting horizontal/vertical field of view, sculpture scale and depth allowance. The geometry test projects actual vertices across narrow slots and quarter turns. Decorative surrounding frames may intentionally bleed at slot edges.
6. Browser output cleanup could remove bundle evidence. Playwright scratch output and durable ignored comparison evidence now use separate directories.
7. V1 diagnostic gaps originally used a clamped simulation delta. Both versions now record monotonic CPU draw-start intervals. A fixed two-second sleep could sample unfinished pointer damping under CPU contention; both versions now wait for the same input-settled boundary before sampling idle draws.
8. Captured failure diagnostics confirmed premature preparation timeout with no parallel shader extension. Installed Three.js `compileAsync` first calls synchronous `compile`, then schedules its non-parallel readiness check on a timer. A slow completed compilation could therefore lose to the already-expired preparation timer and dispose a valid renderer. The runtime now uses `compileAsync` only when `KHR_parallel_shader_compile` exists and direct `compile` otherwise. The asynchronous deadline, cancellation guards, first-draw readiness and intro deadline remain intact. Dedicated tests cover the synchronous branch's success and failure.
9. The local-only comparison badge could cover sculpture controls at narrow widths. Its mobile layout now stacks into a smaller footprint, retaining the experimental label and comparison link.
10. New V2 DOM diagnostic counters were still written in the local production build. They are now development-only, and the production-preview test explicitly checks that the API and all three new counter attributes are absent.

## Validation record

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS, final source. |
| `npm run lint` | PASS, final source. |
| `npx vitest run tests/runtime.test.ts` | Initial resumed lifecycle tests passed; framing regression was subsequently added, reproduced clipping, and passed after the camera correction. Final full suite includes all 21 runtime tests. |
| `npm test -- --maxWorkers 1 --no-file-parallelism --hookTimeout 120000` | PASS: 8 files, 94 tests, none skipped. Final serial run: 15.93 seconds. Timeout accommodation changes setup budget only, not assertions or fixture code. |
| `npm run build` with explicit `/` base, `https://webora.design` canonical and blank local Formspree ID | PASS: 2,441 modules, 11 prerendered routes. Final Vite build: 1.84 seconds. |
| `node scripts/report-bundle.mjs` | PASS; raw/gzip bundle evidence saved separately from Playwright scratch output. |
| `node node_modules/@playwright/test/cli.js test --config playwright.v2.config.ts --output test-results/v2-final` | 23 passed; the twenty-route workload reached its final healthy scene but exceeded the overall 180-second test budget. Full run: 9.4 minutes. |
| `node node_modules/@playwright/test/cli.js test --config playwright.v2.config.ts --output test-results/v2-final-targeted --grep 'twenty route cycles\|production-build'` | PASS: 2 tests in 2.6 minutes. Twenty cycles completed in 2.3 minutes with a 300-second workload budget and unchanged assertions. Production diagnostics-absence assertions passed after the final development guard. |
| `node test-results/v2-1a/summarize.mjs` | PASS: verifies all 24 unique browser cases across the full run and focused rerun, freshness of both measurements, and twenty fresh route-cycle geometry counts, all 16. |
| `node test-results/v2-1a/audit-safety.mjs` | PASS: protected original hashes, normalized text across worktrees, blueprint hashes, remote baseline and production read-only response. All 108 local asset references across 12 HTML documents resolve; no `/Webora/assets/` base. |
| `git diff --check` | PASS. Git prints expected LF/CRLF checkout warnings, with no whitespace errors. |

All 24 unique targeted browser cases passed across the full run and focused rerun; none were skipped. This is not a claim that the 24-case sweep passed in one uninterrupted run. Machine-readable evidence is in ignored `test-results/v2-1a/`: `browser-final-full.json`, `browser-final-focused.json`, `route-cycles.json` and `summary.json`. Earlier failed runs and their diagnostic snapshots/traces were retained, including `browser-full.json` and `browser-before-compile-fix.json`.

The first broad unit run encountered the existing local PGlite fixture's 30-second setup timeout. Serial execution passed without changing database code or assertions. That fixture runs only an in-process local database; it does not contact or activate hosted Supabase.

Earlier browser sweeps encountered server-startup/workload timeouts on this busy Windows host and an idle sample taken before pointer settling. Readiness failures persisted even with a longer browser wait; captured runtime state identified the actual non-parallel compilation timeout race described above. The final runtime fixes that race rather than extending the scene preparation or intro deadline. The test configuration allows startup time, keeps one worker, uses a longer budget for the two multi-stage measurement tests, and explicitly selects SwiftShader for both versions. Behavioral assertions remain strict. One newly added enquiry assertion initially matched only the name, whereas the existing review combines name and business; the locator now matches the actual combined review text.

## Browser coverage and visual inspection

Requested viewports: 1920×1080, 1440×1000, 1280×720, 1024×768, 768×1024, 430×932, 390×844, 360×800, 320×568. Additional emulation: 390×844, DPR 3, coarse/touch input.

Screenshots are actual Chromium renders and are inspected as images, not inferred from passing assertions. The identity retains the original W silhouette, dimensional extrusion and blue/violet lighting. The reserved scene slot keeps the W separate from the headline and CTAs; small screens scroll normally to the lower scene. The responsive camera adjustment intentionally adds breathing room. This is brand/geometry preservation, not a claim of pixel-identical camera composition.

Interactions cover pointer movement, mouse drag, quarter-turn controls, touch control tap, Discover anchor, section traversal, keyboard Enter navigation, booking exit/back, twenty repeated route cycles, local V1/V2 switching, direct/refresh quiet routes and the six-step form through review without pressing Send.

Failure checks cover initial reduced motion and live preference changes, blocked WebGL creation, injected shader compilation failure, rejected/delayed runtime import during route exit, actual `WEBGL_lose_context` loss/restoration, repeated loss fallback, offscreen suspension, first useful frame and settled idle. Hidden-document state is covered by lifecycle unit tests, not a claimed physical background-tab measurement.

The Codex in-app browser control could not attach to a new review tab. The browser evidence comes from the dedicated Playwright Chromium suite, including actual interactions and inspected screenshots. No claim of a successful separate manual in-app-browser session is made.

## Performance method and limits

Measured results from the final full browser sweep; bundle bytes come from the final production builds. Raw/gzip sizes are bytes, with gzip calculated consistently by the existing Node bundle-report script.

| Metric | V1 baseline | V2.1A |
| --- | ---: | ---: |
| Live renderer owners after section traversal | 5 | 1 |
| DOM canvases after section traversal | 5 | 1 |
| Visible owners at traversal endpoint | 1 | 0 (hero offscreen) |
| Hero draw calls per sampled frame | 25 | 25 |
| Hero triangles per sampled frame | 520 | 416 |
| Hero output DPR (device DPR 1) | 1 | 0.9681 (pixel cap) |
| Hero uploaded geometries / textures / programs | 16 / 4 / 4 | 16 / 4 / 4 |
| Sum of uploaded geometry / texture / program objects across live owners | 75 / 19 / 17 | 16 / 4 / 4 |
| Filtered hero gap samples | 388 | 144 |
| Filtered gap median / p95 (ms) | 111.2 / 235.4 | 76.6 / 149.0 |
| Desktop idle draws over 1.5 seconds | 0 | 0 |
| Mobile viewport idle draws over 1.5 seconds | 0 | 0 |
| Initial/preloaded JS raw / gzip | 318,354 / 101,700 | 322,168 / 104,051 |
| Three.js chunks raw / gzip | 578,436 / 149,002 | 578,436 / 149,002 |
| Motion chunk raw / gzip | 131,466 / 48,908 | 131,466 / 48,908 |

The experimental selector/adapter adds 2,351 gzipped initial/preloaded bytes (about 2.3%). Initial JS increased; it did not improve in this slice. Three.js and motion chunk contents are unchanged. The V2 hero uses the software/low tier (one bevel segment); V1 uses two bevel segments, explaining the different triangle count. These filtered gap values are observations, not a demonstrated physical-device speed improvement.

Both runtime measurements identify exactly the same backend: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`, Chromium `153.0.8010.12` on Windows. Relevant evidence: `test-results/v2-1a/v1-runtime.json`, `v2-runtime.json`, `v1-bundle.json`, `v2-bundle.json` and `summary.json`.

Same local development server/build, Windows host, explicit SwiftShader Chromium launch flags, 1440×1000/DPR 1 desktop and 390×844/DPR 1 viewport, no-preference motion, intro marked seen, pointer workload (25 moves with 50 ms waits), input-settled boundary and 1.5-second idle windows for V1/V2. Intro behavior is tested separately. Section traversal follows the idle sample and waits for each V1 scene to render. Production-build bundle measurements are separate from dev runtime measurements. Neither emulated viewport is a physical phone.

The runtime comparison selects the preserved V1 engine inside the isolated preview, with diagnostics and the common scroll-clock adapter. The V1 production bundle measurement comes from the untouched original checkout's fresh build. This is not a causal comparison of every V1/V2 code path. The five-to-one renderer reduction also reflects that only the V2 hero has been connected; the other experimental sections use HTML/SVG, not finished equivalent shared-world scenes. It must not be advertised as a completed whole-site migration or an equal-feature GPU-speed improvement.

`renderer.info` counts are uploaded geometry/texture/program objects, not exact VRAM, live heap size or proof of driver reclamation. Scene assembly timing affects whether fragment geometries have been uploaded. Route-cycle stability and explicit resource-release tests provide separate cleanup evidence. Historical diagnostic records remain in development for inspection; inactive records are not live renderers.

Frame gaps are monotonic CPU intervals between draw starts, filtered to positive values below 250 ms, capped at the latest 1,200 entries per renderer. They include animation/setup/input activity and are not GPU timings, measured screen presentations or whole-page FPS. Animation retains the GSAP clock. Deliberate idle and long gaps are excluded by the diagnostic filter; startup draws can contribute shorter samples. Shared shader caches, test order and host contention preclude a reliable hardware-speed comparison. No physical-device, battery, thermal, Safari, Firefox or high-tier GPU results are claimed.

The V1 baseline already stopped drawing in the measured idle sample. A zero-draw V2 idle sample proves the V2 gate works; it does not demonstrate an idle-rendering improvement over V1. Synchronous driver compilation without the parallel extension can still block the browser thread; a JavaScript timeout cannot preempt that driver call. This change avoids falsely disposing a successfully compiled scene but is not proof of fast startup on a physical low-end device.

## Repository and production safety

Original checkout stays on `master` at the baseline commit with no tracked diff. Its existing `PRODUCTION-VALIDATION.md` and four Phase 1 docs remain present. All V2 source/test/report changes are inside the isolated worktree; no new commit exists.

Hash checks against the recorded original baseline match the protected source files, historical report and two final video exports. The original `video-output/` still contains 554 files, including the legitimate working outputs; it was not copied, cleaned or edited. The four blueprint documents are byte-identical across worktrees.

Fourteen business/hosting/dependency files have identical text across the checkouts and no Git changes: workflow, Vite config, index, prerender script, package/lockfile, enquiry page/schema/provider/draft/attribution, studio/SEO data and privacy. Raw file hashes differ between worktrees solely because the original files use LF and the Git worktree checkout uses CRLF; these files were not rewritten to conceal that difference.

Read-only remote verification still reports only `master` at the baseline SHA. A read-only public GET returns HTTP 200 and the existing V1 `/assets/index-CF_s-Fxu.js`; no experimental label appears in production HTML. No remote write or deployment action was issued. Hosting/domain configuration, real website URLs, contact facts and provider integration are unchanged.

## Local review and next phase

Run inside the V2 worktree:

```powershell
npm run dev -- --port 5175 --strictPort
```

Local V2: `http://127.0.0.1:5175/?experience=v2`

Local V1 comparison: `http://127.0.0.1:5175/?experience=v1`

Add `&diagnostics=1` only to a development preview to inspect runtime records. Production-build local preview can also opt into V2 by query, but does not expose diagnostics. Public hosts always retain V1.

The development preview was restarted on loopback port 5175 after validation and its HTTP response verified. The V2 label/selector appears only after local browser hydration, not in prerendered public HTML.

**V2.1A passes its scoped local foundation acceptance criteria and is ready for user review before V2.1B.** Isolation, single-renderer W, first-frame readiness, settled idle gate, cleanup, fallback, responsive composition, unchanged business/hosting files, passing focused validation, measured comparison and working local preview are covered by the evidence above. No unresolved implementation defect was observed in these checks. Physical-device touch/thermal/driver behavior and additional browser engines remain unverified; the full shared-world migration and finished cinematic intro remain future work.

V2.1B is not implemented. After the user reviews this foundation, its scoped starting task is the original W's alloy/liquid material family, with low-tier fallback and measured shader costs, followed by readiness-driven cinematic intro work. Full gallery/service/process compositions and camera choreography remain later phases.
