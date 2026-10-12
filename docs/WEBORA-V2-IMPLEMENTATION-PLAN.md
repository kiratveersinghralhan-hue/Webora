# WEBORA V2 — Implementation plan

10 October 2026. **Future work, subject to review of this blueprint. None of the implementation steps below has been executed.** Phase 1 ends with documentation; there is no permission to implement, commit, push or deploy in this phase.

Read the [audit](WEBORA-V2-AUDIT.md), [creative direction](WEBORA-V2-CREATIVE-DIRECTION.md) and [technical architecture](WEBORA-V2-TECHNICAL-ARCHITECTURE.md) first. The audited V1 baseline is `3f57b43cb843058cbdb68b6cf5e1acf057e7d361` on `master`.

## 1. Isolation and protected baseline

The current checkout has no tracked changes, one pre-existing untracked report, ignored video deliverables, and these four new documents. Do not switch its branch, reset it, clean it, stash everything, or copy it wholesale. The workflow deploys `master` and accepts manual dispatch; neither action is part of V2 experimentation.

After the user approves implementation, first repeat these read-only checks in PowerShell:

```powershell
git -C "C:\Users\ACER\Documents\ChatGPT\Webora Website" status --short -uall
git -C "C:\Users\ACER\Documents\ChatGPT\Webora Website" rev-parse HEAD
git -C "C:\Users\ACER\Documents\ChatGPT\Webora Website" branch --all
git -C "C:\Users\ACER\Documents\ChatGPT\Webora Website" worktree list --porcelain
git -C "C:\Users\ACER\Documents\ChatGPT\Webora Website" ls-remote --heads origin
Test-Path -LiteralPath "C:\Users\ACER\Documents\ChatGPT\Webora V2"
```

If the baseline is still correct, the proposed branch does not exist, and the destination is absent, create an isolated local worktree:

```powershell
git -C "C:\Users\ACER\Documents\ChatGPT\Webora Website" worktree add -b codex/webora-v2 "C:\Users\ACER\Documents\ChatGPT\Webora V2" 3f57b43cb843058cbdb68b6cf5e1acf057e7d361
```

If it exists, inspect and reuse only a suitable V2 worktree; do not overwrite it or run the creation command blindly. If production advanced, compare the intervening commits and explicitly establish the new baseline before work. This SHA is a verified starting point, not a rule to ignore later recovery fixes. Managed Codex worktrees may be used instead when available; use the returned path rather than assuming the example destination.

Install the existing lockfile with `npm ci` inside the new worktree. Do not upgrade dependencies. The ignored video directory, private local environments and untracked historical reports are not copied automatically. Read these docs from the original directory or copy only the four Markdown files if needed. No branch/worktree was created during Phase 1.

Record hashes/file lists for the following invariants before implementation, and compare after each stage:

| Protected area        | Files / invariant                                                                                                                                                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting               | `.github/workflows/pages.yml`, `vite.config.ts`, `index.html`, `scripts/prerender.mjs`; `/` base, `https://webora.design` canonical, existing domain/HTTPS/Pages environment. No source `CNAME` file was found; do not invent or replace the existing Pages domain configuration. |
| Enquiry               | `src/pages/StartProject.tsx`, `shared/enquiry.ts`, `src/services/enquiries.ts`, `src/lib/draft.ts`, `src/lib/attribution.ts`; provider variable, payload, six steps and validation remain intact                                                                                  |
| Business facts        | `src/data/studio.ts`, `src/data/seo.ts`, `src/pages/Privacy.tsx`, public project assets; factual text/status/URLs/contact information remain intact                                                                                                                               |
| Local legitimate work | Original checkout's `PRODUCTION-VALIDATION.md` and entire `video-output/`, including two final cuts and 13 source clips                                                                                                                                                           |

Shared layout, styles and scene adapters will change in V2; invariant means their behavior is retested. The frozen business/hosting files should remain byte-identical unless a later explicitly scoped change is justified. Do not add a new backend or activate the legacy `supabase/` tree.

Use an explicit local V1/V2 selector during migration, with consistent prerender and browser selection. It must mount only one experience for a route, default safely to the V1 comparison until the slice is ready, and never require workflow changes. Do not inject an extra canvas into the V1 hero. Local builds may keep production canonical metadata for validation without publishing them. Keep the local Formspree setting blank/mock and intercept provider requests before any automated navigation; never log private environment values.

## 2. Delivery rules and gates

- Implement one stage at a time in the isolated tree. Each stage produces a small reviewable local diff, screenshots, test evidence and unresolved issues. No automatic commit, push or deploy is implied by this plan.
- Confirm semantic fallback before visual enhancement. Build, direct routes, menu, anchors and booking must continue working when the scene fails.
- Start instrumentation in V2.1, not after expensive effects are complete. Budgets are the proposed gates in architecture section 12; report measured results separately.
- Keep one renderer, one continuous gallery index and one owner of each camera/scroll/input value. Remove obsolete subscriptions as their replacements take ownership.
- Preserve source-backed facts and original assets. The missing liquid ZIP requires resupply/license review; original procedural work can proceed without it.
- Future acceptance requires both visual review and functional checks. A screenshot alone does not prove physics, cleanup, keyboard behavior or mobile performance.

## 3. V2.1 — Intro and 3D identity

**Outcome:** one finished original W, restrained alloy/liquid surface, short readiness-driven intro and seamless hero handoff. Existing content and conversion paths remain present.

**Dependencies:** approved direction and isolated baseline. No new runtime package required. The missing ZIP is not a dependency for original shaders.

**Files:** add `src/three/ExperienceStage.tsx`, `src/three/runtime/WorldRuntime.ts`, `types.ts`, `AssetRegistry.ts`, `QualityPolicy.ts`, `src/three/scenes/CoreScene.ts`, `src/three/geometry/weboraW.ts`, `src/three/materials/studioAlloy.ts`, `liquidSurface.ts`. Adapt `src/layouts/Layout.tsx`, `src/pages/Home.tsx`, `src/three/Core.tsx`, `src/three/Spatial.tsx`, `src/hooks/useMotion.ts`, `src/lib/motionPreference.ts`, and relevant existing `src/styles/experience.css`/`immersive.css`/`spatial.css`. Retain `engine.ts` only for route-exclusive V1 comparison while needed. Add focused controller/lifecycle tests and `tests/browser/v2-identity.spec.ts` in the future stage.

**Order:**

1. Record local V1 screenshots/timings with device/browser settings. Add opt-in local counters for renderer count, draws/triangles, resources, subscribers, frame gaps and estimated allocations; keep diagnostics out of public UI.
2. Establish stage/runtime contracts, one coordinator subscriber and unconditional cleanup, including failure halfway through initialization. Keep HTML fallback visible until useful rendering succeeds.
3. Extract the canonical W outline; build back/side detailing and tiered bevels. Review front, rear, both sides, above and below with ordinary material first.
4. Add original generated environment and subtle surface flow; compile variants once. Add optional high-tier refraction only after opaque alloy meets budgets.
5. Implement intro state machine, readiness/deadline, skip/session policy, same-instance handoff, reversible motion preference and complete fallback paths.
6. Integrate basic full-turn controller: unwrapped yaw, constrained pitch, timestamped velocity, inertia, exact quarter-turn buttons and reset. Defer secondary attraction refinements to V2.4.

**Technical challenges:** consistent displaced normals; bevel aliasing without excessive fill rate; startup compile latency; SSR without browser access at import; keeping focus/scroll usable under an intro; preventing V1/V2 double ownership.

**Acceptance:** playback ≤2.4 s once ready, ≤3 s request deadline, mobile ≤1.5 s or skipped; Skip removes veil/lock within one rendered frame; no artificial minimum load. Session revisit does not replay; storage-denied and deep-link entry work. One canvas on the enabled hero, none required for booking/reduced fallback. Cumulative drag yaw exceeds a full turn; six views are finished; CTA stays legible/clickable; no persistent idle drawing on touch/low tier. No business/hosting diff.

**Browser tests:** fresh/revisited session, slow imports, rejected shader/module, blocked WebGL, reduced motion before/after mount, opt-in/opt-out, skip at each intro state, early scroll/navigation, route exit during prepare, lost pointer capture, horizontal versus vertical touch intent, resize during intro, context loss/restore once, repeated loss fallback. Use actual touch input on a physical device before calling touch acceptance passed.

**Regression risks:** stuck overlay, replay loop, invisible initial content, duplicate renderer, gesture stealing, GPU startup spike. Gate V2.2 on identity review and the failure-path checks, not refraction sophistication.

## 4. V2.2 — Spatial portfolio

**Outcome:** a Webora-specific curved website gallery with readable previews, one physics state and atomic metadata/navigation.

**Dependencies:** V2.1 stage/resources/fallback and input ownership; current `featuredProjects` data is authoritative. No new photo/model library.

**Files:** add `src/three/scenes/GalleryScene.ts`, `src/lib/galleryController.ts`; adapt `src/components/Projects.tsx`, `ProjectVisual.tsx`, `src/pages/Work.tsx`, `CaseStudy.tsx`, and `src/styles/spatial.css`/`immersive.css`. Read `src/data/studio.ts` and `src/lib/site.ts` without rewriting facts/base logic. Extend existing spatial/browser coverage; add `tests/galleryController.test.ts` and `tests/browser/v2-gallery.spec.ts` for meaningful physics/ownership behavior.

**Order:**

1. Build shallow curved screen geometry, correct aspect/top crop, stable original frames, active±1 cache and honest Article Project placeholder.
2. Implement one continuous bounded index, direct drag and velocity estimate, release projection and critically damped settling. Render from that index directly; remove the second engine filter.
3. Connect deterministic buttons, focused keyboard commands and optional horizontal wheel. Ordinary vertical wheel/touch scroll always yields to the page; default is unpinned.
4. Replace overlapping cards with a reserved metadata block, one transition pair, discrete active-state event, inert inactive content and one settled announcement.
5. Add restrained case-entry transition with immediate router fallback; dispose/release stale assets and input on exit. Preserve existing case studies and separate concept archive.

**Technical challenges:** curved UV clarity; transparent edges/tone mapping; texture lifetime during rapid selection; metadata/link consistency mid-settle; boundary momentum without unwanted wrap; making a selected screenshot readable at mobile width.

**Acceptance:** four accurate entries in the existing order/status; Harvester/Gloss Boss retain live links, VEYRATH retains in-progress case study, Article Project has no invented URL/case study. Active preview, title, status and CTAs agree; keyboard-selected project is the link destination. At most three world previews visible; active±1 assets bounded. No vertical wheel trap, no route activation after a drag, no stale project on browser Back. Tablet/mobile remain unpinned. Static fallback exposes all legitimate content/links.

**Browser tests:** rapid next/previous and number selection, reverse drag at both bounds, canceled drag, drag ending over link, focused Arrow/Home/End, Tab/Enter, vertical wheel, touch swipe and ordinary vertical scroll, texture delay/failure, repeated Work↔case-study cycles, direct case-study refresh, unknown slug, reduced motion, Article placeholder and screen crop screenshots at each target width.

**Regression risks:** wrong active case URL, screen stretching, stale resources, inaccessible inactive links, public-work fabrication. Gate V2.3 on gallery physics, content and keyboard review.

## 5. V2.3 — Scroll and camera choreography

**Outcome:** one reversible spatial narrative from hero through work/services/process/final CTA, aligned to real HTML sections.

**Dependencies:** V2.1 identity and V2.2 gallery; service/process scene shells may be static until V2.4. Existing editorial sections stay present.

**Files:** add `src/three/runtime/ChapterDirector.ts`; adapt `WorldRuntime.ts`, `ExperienceStage.tsx`, `src/pages/Home.tsx`, `src/lib/pageMotion.ts`, `src/lib/scroll.ts`, `src/layouts/Layout.tsx`, `src/sections/StudioSections.tsx` and existing motion styles. Extend `tests/browser/immersive.spec.ts` and add `tests/browser/v2-chapters.spec.ts` where V2-specific coverage is needed.

**Order:**

1. Define measured section intervals, text-safe rectangles and breakpoint camera poses; cache on resize/font/content readiness, not per frame.
2. Connect existing Lenis/GSAP clock to normalized chapter state and one camera owner. Test global lag-smoothing behavior before changing it.
3. Author hero→gallery, gallery→folds, quiet editorial intervals, process and final W transitions. Keep camera movement bounded and preserve independent readable DOM.
4. Implement anchor readiness/cancel behavior, reverse scroll and instant jumps. Gallery index stays user-owned while scroll positions its world.
5. Tear down route contexts/pins/input before activating the next route. Ensure no old/new WebGL duplication during View Transitions.

**Technical challenges:** dynamic disclosure heights; fitting wide/short screens; determinism after fast scroll and tab resume; one state being accidentally smoothed twice; canvas under DOM route snapshots.

**Acceptance:** forward/backward scroll at equal section progress reaches the same base pose; instant jump never leaves intermediate camera travel running. Scroll to Discover and header anchors reach content below the header. User input cancels pending anchor corrections. No forced scroll or multi-section pin sequence; proposed default gallery has no pin. One Lenis instance; one camera owner; menu/booking input exceptions retained. No model crosses the main text safe area.

**Browser tests:** slow/fast/reverse scroll, Home/End/PageDown, hash on initial load and later navigation, route Back/Forward, disclosure opening near a boundary, resize/orientation midway, browser hidden/resumed, short landscape, reduced motion, menu opening during camera travel and booking navigation from every chapter.

**Regression risks:** camera oscillation, stale anchors, unwanted page jumps, duplicate ScrollTriggers, frozen scroll. Gate V2.4 on coherent camera review and anchor/navigation parity.

## 6. V2.4 — Interaction systems

**Outcome:** one pointer/physics system supporting contextual cursor, W-derived service/process objects and controlled route transitions.

**Dependencies:** chapter director and working gallery/rotation controllers. Keep event ownership established in prior stages.

**Files:** add `src/three/scenes/ServicesScene.ts`, `ProcessScene.ts`; adapt `src/lib/pointer.ts`, `gesture.ts`, `pageMotion.ts`, `src/components/Cursor.tsx`, `src/sections/StudioSections.tsx`, `src/pages/Services.tsx`, `Studio.tsx`, `src/layouts/Layout.tsx`, relevant styles and scene/runtime subscribers. Extend browser interaction tests; test velocity/controller math where it has independent invariants.

**Order:**

1. Move shared pointer smoothing to coordinator ticks; use true timestamped velocity, context/focus events and cached hit rects. Remove superseded RAF subscriptions.
2. Connect bounded light/shader influence and fine-pointer magnetism; drag state controls feedback. Keep cursor out of the React frame loop.
3. Build service fold compositions for the existing six disclosures; only active state animates, no six concurrent models.
4. Build six-stage process structure from W geometry; focus/tab selection outranks incidental scroll updates and remains stable for reading.
5. Finish route entry/exit motion, preserving native modified/external links, keyboard focus, cancellation and booking independence.

**Technical challenges:** nested pointer regions; focus without pointer movement; mixing process scroll and keyboard selection; canceling transitions with navigation; layout measurements causing frame work.

**Acceptance:** contextual labels change immediately on semantic context/focus; coarse pointer/reduced motion do not require custom cursor or magnetism. Magnetic translation ≤6 px and no form-field attraction. Service/model and process/copy agree. Keyboard focus is never stolen by camera state. Repeated route changes leave no stale input, drag state, listeners or animations. No per-frame React renders from pointer/camera.

**Browser tests:** pointer enter/leave, focus-only use, touch then mouse, lost capture, menu over scene, service collapse/reopen, all process tabs with keys and scroll, fast booking entry/exit, modified external click, no View Transition API, reduced-motion switch mid-transition, twenty repeated route cycles.

**Regression risks:** duplicate pointer loops, mislabelled cursor, inaccessible tabs, stale transition promise, motion leaking into form. Gate V2.5 on interaction and lifecycle parity.

## 7. V2.5 — Responsive, accessibility and performance

**Outcome:** capability-aware visuals that fit varied dimensions, settle when idle and preserve accessible content on lower-power devices.

**Dependencies:** representative V2.1–V2.4 experience with diagnostics. Performance work begins earlier; this stage consolidates measured tuning.

**Files:** `src/three/runtime/QualityPolicy.ts`, `AssetRegistry.ts`, `WorldRuntime.ts`, `ChapterDirector.ts`, geometry/material/scene modules, `src/lib/motionPreference.ts`, `src/components/Projects.tsx`, `Cursor.tsx`, responsive styles. Extend existing `scripts/report-bundle.mjs` only if required for comparable world totals; add focused local performance capture support/tests without changing hosting configuration.

**Order:**

1. Run the viewport/input matrix below; fix composition, overflow, touch targets and safe text rectangles before lowering visual quality.
2. Measure cold/warm loading, frame gaps, draws, triangles, decoded textures, estimated allocations and route-cycle plateau. Diagnose bottlenecks instead of assuming polygon count is the only cost.
3. Tune DPR/pixel caps, geometry, texture dimensions, antialiasing choice and effect variants. Disable high-tier refraction before degrading content clarity.
4. Implement rolling quality windows/hysteresis and on-demand idle draws; test missing capability hints, software rendering and reduced motion.
5. Validate keyboard/screen reader/contrast, reversible motion preference, 200% zoom and physical-device thermal behavior. Record unavailable devices as a limitation, not a pass.

**Technical challenges:** some capabilities are only hints; shader startup distorts frame sampling; memory object counts are not VRAM; browser emulation does not prove physical thermal/touch behavior; AA choice may require renderer recreation.

**Acceptance:** meet architecture section 12 budgets or document an explicit reviewable exception. No positive horizontal overflow, clipped actions or unreadable screenshots. Idle high tier stops GPU draws within2 s, balanced/low within1 s; hidden/offscreen draws stop. One renderer maximum, zero required on booking/reduced fallback, stable resource plateau after twenty route cycles. No serious/critical automated accessibility findings and manual focus/contrast/reading-order review. Named physical mobile device sustains its declared frame budget without visibly degrading over a several-minute run.

**Browser tests:** Chrome/Firefox/Safari where available; named Android/iOS device runs; coarse/fine input; slow network/CPU; Save-Data/missing hints; high DPR/retina; orientation/address-bar resize; 200% zoom; WebGL failure/context loss; hidden tab and resume; idle counters and route-cycle resource trend. Compare identical workload/settings to V1. Never report simulated frame timing as actual GPU execution time.

**Regression risks:** quality oscillation, blurry project previews, overheating, memory growth, low-tier content loss. Gate V2.6 on recorded results and candid device coverage.

## 8. V2.6 — Final validation and readiness audit

**Outcome:** reviewable local V2 candidate with complete evidence and explicit release blockers. This stage is not an instruction to deploy.

**Dependencies:** earlier stage gates and creative review. No new design scope.

**Files:** existing tests under `tests/`, `tests/browser/` and `tests/pages/`; V2-specific controller/browser tests; `playwright.pages.config.ts` and `scripts/pages-preview.mjs` only for the local root-domain test harness; final validation report under `docs/`. Application fixes are limited to demonstrated regressions. Preserve production workflow/base/domain settings.

**Order:**

1. Run static/unit/build checks and the bundle/asset audit. Compare frozen files, project facts and route list to V1.
2. Run full local browser regression, failure modes, form mocks and the responsive matrix. Existing V1-only selector/timing expectations may need adaptation; do not weaken behavioral assertions to make V2 pass.
3. Correct the known form test race by waiting for each actual step transition rather than clicking five times through the90 ms guard. This is a test synchronization repair; do not remove the production duplicate/transition guard.
4. Make the local Pages simulator test the root base. It currently hardcodes `/Webora/`, and the Pages suite includes hardcoded URL assertions; simply setting `WEBORA_TEST_URL` is insufficient. Parameterize test expectations and the simulator together; retain separate optional subpath coverage only when built for that base. This does not require changing production configuration.
5. Capture visual states and network/console evidence from the local production build, run resource/performance checks, compare to budgets and record outstanding blockers.
6. Deliver a readiness report with actual commit/baseline identity, file scope, tests run/not run, screenshots, device details, issues and rollback strategy for a separately authorized release. No merge/push/workflow dispatch occurs automatically.

**Technical challenges:** distinguishing test assumptions from real regressions; hydration/prerender parity; 404 recovery versus dev-server SPA fallback; reproducible measurements; retaining honest provider-proof limits.

**Acceptance:** TS/lint/unit/build pass in the isolated clean tree; all intended routes prerender and refresh; root assets resolve; browser suites pass with explained test changes; no unexpected console/network failures; form behavior passes mocked cases; visual/physical-device review complete or explicitly blocked. No unresolved critical accessibility, booking, route, production-base, memory or gesture defect. No invented external success/inbox delivery claim.

**Browser tests:** the complete matrix in section 9 plus context-loss/recovery, denied storage, error boundaries, failed texture and late import, direct refresh/404, keyboard menu/focus, project-link correctness, form mocks and twenty route cycles.

**Regression risks:** release from wrong branch, subpath-only test false confidence, unintended form request, hidden local files in a release, attractive screenshots hiding functional faults. Final gate is a user review of the concrete candidate and evidence; release is a later task.

## 9. Verification matrix and commands

These are future checks, not Phase 1 results. Execute inside the isolated tree after changes, retaining logs under ignored `test-results/`:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
node scripts/report-bundle.mjs
npm run test:e2e
```

Build environment remains explicitly `/` and `https://webora.design` as in V1. Use a blank/mock local Formspree value; network interception is still mandatory because configuration alone is not protection against an accidentally inherited value. Start local preview separately for manual browser QA. Before running the Pages suite, repair its local harness as described above, then run `npx playwright test --config playwright.pages.config.ts` against that local root simulator. Do not aim automated form tests at production.

| Coverage              | Required checks                                                                                                                                                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop               | 1440×1000 wide/tall;1280×720 short;1920×1080; ultrawide2560×1080. Readability, camera fitting, no unnecessary pin, pointer/keyboard                                                                                                                                                                              |
| Tablet                | 768×1024 and1024×768; both touch/coarse and mouse where available. One preview/neighbor, disclosures, rotation, anchors                                                                                                                                                                                          |
| Mobile                | 320×568,390×844,430×932; landscape844×390. Menu, safe areas, visible buttons, scroll/drag intent, screenshots, form                                                                                                                                                                                              |
| Physical devices      | At least representative Android Chrome and iOS Safari when available; report model/OS/browser/DPR, thermal run duration and quality tier                                                                                                                                                                         |
| Accessibility         | Reduced motion initially and toggled; keyboard only; screen reader reading/announcements; zoom200%; contrast/focus; fallback without WebGL                                                                                                                                                                       |
| Routes                | `/`, `/work`, `/services`, `/studio`, `/start-project`, `/privacy`; case routes `/work/harvester-parts`, `/work/veyrath`, `/work/glossboss`, `/work/form-and-field`, `/work/off-script`; unknown route/slug and Pages404 recovery. Direct load, refresh, internal navigation, Back/Forward, hash/query retention |
| Form                  | All six steps, validation/review/edit, optional draft save/expiry/restore with consent reset, denied storage, attribution, duplicate pending guard, timeout/network/429/rejection/retry, mocked provider-confirmed success, honeypot, preserved values. Zero real provider submissions                           |
| Assets/SEO            | Root-relative JS/CSS/font/project URLs exist; generated HTML/canonicals/sitemap/robots valid; no erroneous `/Webora/` runtime asset prefix; correct status/MIME; failed texture retains honest placeholder                                                                                                       |
| Performance/lifecycle | Cold/warm bundle graph,60 s active sampling, several-minute physical thermal run, idle/hidden draw counts, estimated resource bytes, twenty route cycles; label lab versus field data                                                                                                                            |

Asset audit should enumerate HTML `src`/`href`/modulepreloads and CSS `url()` dependencies against `dist`, then check runtime-lazy gallery/font/3D URLs in browser Network. An HTML-only scan does not cover dynamic texture loading. Preserve semantic HTML, canonical metadata and hydration without `window`/WebGL at module initialization. Screenshots must include hero before/after intro, W six-side views, all four gallery states, services/process, final CTA, menu, six-step form, reduced/no-WebGL and key responsive widths.

## 10. Risk register

| Risk / severity                             | Mitigation                                                                                 | Verification / release blocker                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Accidental production deployment — critical | Separate local worktree; no master push/manual workflow; frozen hosting files              | Branch/diff/workflow check at every stage; any unauthorized remote mutation blocks work                      |
| Loss of uncommitted/ignored work — critical | Preserve original checkout/report/video directory; no reset/clean/blanket copy             | Original status plus protected hashes; inspect release file manifest                                         |
| Booking/provider regression — critical      | Freeze form/service/schema/draft/attribution; scene state isolated; mock before navigation | All six steps and error/retry mocks; zero real Formspree requests; no success before confirmation            |
| Camera/scroll/animation conflict — high     | One clock, camera owner and gallery index; remove obsolete RAF/tweens                      | Fast/reverse scroll and input takeover; subscription counters; no oscillation or unwanted jump               |
| Memory/context leaks — high                 | Resource registry, generation tokens, partial-init cleanup, one renderer                   | Twenty route cycles plateau; late-load exit; context loss/restore/repeated-failure fallback                  |
| Excessive GPU load — high                   | Bounded pixels/draws/geometry/textures; optional refraction last; settle idle              | Measured budgets on named devices; no unexplained draw/resource growth                                       |
| Mobile heat/battery — high                  | No continuous touch idle, low-power tier, no refraction, downgrade hysteresis              | Physical several-minute interaction/idle review; unavailable hardware remains an explicit gap                |
| Drag breaks scrolling/navigation — high     | Horizontal intent/pan-y, cancel cleanup, deterministic click suppression                   | Physical vertical/horizontal touch gestures, lost capture, drag-over-link, route exit                        |
| Accessibility loss — high                   | Semantic HTML, real controls, no focus stealing, reversible reduced-motion policy          | Keyboard/screen reader/contrast/zoom review and automated checks; inaccessible core action blocks release    |
| Overflow/occluded copy — high               | Camera text safe areas, reserved DOM dimensions, adaptive framing                          | Full width/aspect/zoom matrix; no positive horizontal overflow or hidden booking action                      |
| SEO/hydration/deep-link regression — high   | Keep prerender/root-base/canonical; browser-only runtime lazy                              | Built HTML, eleven direct/refreshed routes plus404; no hydration errors or subpath-only proof                |
| Route-transition race — high                | Cancel old input/tweens/async work before destination; no duplicate world                  | Rapid routes/Back/Forward/failed import; one renderer and usable focus destination                           |
| Conversion distraction — medium/high        | Quiet booking, short skippable intro, stable CTA and readable metadata                     | CTA reachable throughout; local usability review; no invented conversion-lift claims                         |
| Misrepresented project/reference — high     | Existing facts authoritative, honest placeholders, original geometry/shaders               | Data/link snapshot and source/license review; ZIP absent is stated, not silently replaced with copied assets |
| Test false confidence — medium/high         | Fix local root harness and form timing; keep behavioral assertions                         | Record normal/reduced/failure results separately; distinguish historical evidence and fresh runs             |
| Dependency/material breakage — medium       | Locked existing stack, isolate shader variants, no opportunistic upgrades                  | Clean install/build and material-failure fallback; compare bundle graph                                      |

## 11. Immediate next task after blueprint review

**V2.1 first slice: prepare the isolated worktree, capture an instrumented V1 baseline, then implement the shared runtime shell and canonical W geometry with ordinary alloy only.** Prove one renderer, SSR-safe import, meaningful first frame, complete cleanup, static fallback, six finished model views and a reachable CTA before adding liquid flow or cinematic choreography.

The subsequent slice adds material flow, readiness-driven intro and same-instance hero handoff. Gallery, multi-chapter camera travel and service/process reconstruction wait for their stage gates. Phase 1 stops here for review; no runtime changes, commits, pushes or deployments are part of these deliverables.
