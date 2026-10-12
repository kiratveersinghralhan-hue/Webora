# WEBORA V2 — Release validation

12 October 2026 (Asia/Calcutta). Continued in `C:\Users\ACER\Documents\ChatGPT\Webora V2`, branch `codex/webora-v2`. The current user brief authorizes committing and deploying the completed V2 after the mandatory gates pass. Earlier local-only checkpoint reports are historical evidence; this report governs the full release.

## Release state

Local release gates passed; ready for authorized integration. No production push has occurred. Last working V1 production commit: `3f57b43cb843058cbdb68b6cf5e1acf057e7d361`. Use a normal revert commit followed by the existing Pages workflow for non-destructive recovery if a serious production regression is found.

## Preservation

Both local branches and remote master started at the V1 commit. The production checkout had no tracked changes, five local untracked reports/blueprints and 554 local video outputs. No reset, clean or blanket stash was used. Existing A, V2.1A, V2.1B, M1, architecture and creative-direction work was retained. The other Webora chat was not loaded; no parallel source editor or subagent was started.

Before further changes, `test-results/checkpoints/20261012-before-full-v2/` preserved 154 Git-visible source/report files, SHA-256 manifest, HEAD, status and binary patch. The two earlier checkpoints remain available. The protected-file audit compares enquiry, privacy, facts, SEO, dependency and production configuration text with V1, checks original video/report hashes and resolves all prerendered root assets. Evidence: `test-results/release/safety-before-deploy.json`.

## Finished experience

- **B / portfolio:** original subdivided cylindrical preview faces, closed curved titanium shells, inset screens, finished rear covers, machined rear ribs and edge details. One central project dominates an arc; adjacent projects turn and recede. All transforms come from one continuous index. Pointer/touch drag is direct; release projects velocity into a critically damped spring, and idle stops drawing. HTML buttons, previous/next, Arrow/Home/End and case/live links remain available with reduced motion or failed WebGL. Native vertical scrolling is never captured. The gallery is unpinned.
- Harvester Parts and Gloss Boss use the existing actual website captures and verified live links. VEYRATH uses its existing portfolio artwork, labelled in progress. Article Project displays an explicit in-progress project label saying its preview is to follow. It has no invented screenshot, case study, public URL or delivery claim. Existing data and order are unchanged.
- **C / introduction:** four actual forged strokes of the canonical W travel along separated paths, rotate through depth and assemble on the same front/rear geometry. A larger camera arc and dolly reveal the folded architectural setting; the alloy and rim light transition into the settled hero. No duplicate W, renderer, loading wall or independent animation loop is introduced. Session awareness, Skip, reduced motion, early intent and the 2.9-second overall request deadline remain. Development replay: `/?experience=v2&intro=1`.
- Background shader readiness now has an independent eight-second failure bound. Slow desktop drivers previously disposed an otherwise usable world at 2.5 seconds. A late-ready visitor receives the usable HTML immediately, skips the finite intro and can still receive the completed scene. No intro deadline was extended.
- **D / integration:** the hero, gallery, A Services devices, A six-part Process sculpture and a quieter final W share the route's existing world, camera, lighting and asset registry. Visible HTML slots select the active chapter; other scene modules stop updating. Restrained entrance fades, graphite/cobalt surfaces, editorial typography, hover feedback and consistent controls join the sections. Value, principles, engagement copy and contact/enquiry pathways remain.
- **E / release:** V2 is the public and prerendered default. The local V1 comparison remains available at `?experience=v1`; public query parameters cannot switch the release back to V1. Booking/privacy remain calm HTML routes.

This is bounded chapter continuity with a shared camera and canvas transfer between HTML compositions; it is not a continuous topology morph between unrelated meshes.

## Exact full-finish file scope

Compared with the 154-file checkpoint immediately after A, the following 25 source/report files changed or were added. The final release also includes the previously completed, preserved V2 foundation and Checkpoint A files.

| File | Change |
| --- | --- |
| docs/WEBORA-V2-RELEASE-VALIDATION.md | added |
| playwright.release.config.ts | added |
| src/components/ExperienceSwitcher.tsx | modified |
| src/components/SpatialProjects.tsx | added |
| src/lib/experience.ts | modified |
| src/lib/galleryController.ts | added |
| src/pages/LivingHome.tsx | modified |
| src/styles/living.css | modified |
| src/three/ExperienceStage.tsx | modified |
| src/three/geometry/curvedScreen.ts | added |
| src/three/geometry/identityGeometry.ts | modified |
| src/three/runtime/WorldRuntime.ts | modified |
| src/three/runtime/installationViews.ts | modified |
| src/three/scenes/CoreScene.ts | modified |
| src/three/scenes/GalleryScene.ts | added |
| src/three/scenes/StudioScene.ts | modified |
| tests/experience.test.ts | modified |
| tests/gallery.test.ts | added |
| tests/runtime.test.ts | modified |
| tests/v2-browser/checkpoint-a.spec.ts | modified |
| tests/v2-browser/release.spec.ts | added |
| tests/v2-browser/identity.spec.ts | modified |
| tests/v2-browser/runtime.spec.ts | modified |
| src/components/Projects.tsx | modified |
| src/layouts/Layout.tsx | modified |

## QA and evidence

Evidence is under ignored `test-results/release/`; no browser traces, screenshots, generated bundles or raw video exports belong in the release commit. All automation blocks `https://formspree.io/**` before navigation and never presses Send.

The responsive sweep covers 1920×1080, 1440×1000, 1280×720, 1024×768, 768×1024, 430×932, 390×844, 360×800 and 320×568. Each visits gallery, Services and Process, asserts one canvas and zero horizontal overflow, captures all three and checks page errors. The retained initial hero screenshots show the immediately available fallback; later native/identity captures inspect the actual rendered W.

Screenshots: `responsive-{gallery,services,process}-{width}.png`, `gallery-selection-{0..3}.png`, `gallery-fallback-{mode}.png`, native gallery/hero captures and the identity intro frame series. All six A service/process states and depth views retain their earlier evidence, supplemented by release regressions.

The first release sweep passed 11/15 cases and failed four. Three distinct causes were investigated: standalone gallery skipped from h1 to h3; delayed scene initialization could reset a newer HTML project selection; a development route refresh lost module requests with Chromium `ERR_NETWORK_CHANGED`. The first two were corrected in the application. The refresh failure is preserved in its trace and rerun without hiding network failures. No assertion was removed. Separate reruns establish the latest status.

## Validation results

TypeScript, deployable-scope lint, all 112 unit tests in 12 files, production build and eleven prerendered routes pass. Root asset audit resolves 118 references across 53 distribution files with zero missing assets. `git diff --check` passes.

All 72 distinct latest browser cases pass with zero skips, consolidated from four runs in `test-results/release/browser-summary.json`; this is not a claim of one uninterrupted 72-case sweep. Release suite: 16 distinct cases. Inherited A/identity/runtime suites: 56 cases. Axe reports zero violations in the tested reduced-motion, no-WebGL and failed-texture alternatives. The six-step enquiry reaches review without submitting.

The inherited sweep initially passed 52/56. The production-preview timeout passed its focused repeat and native standalone-route repeat. Other failures were stale fixture expectations for the renamed comparison switch, the independent eight-second shader cleanup bound, and native scrolling competing with an ongoing Lenis anchor transition. Fixtures now use the actual application scroll driver and current bounds; all four focused repeats pass. The offscreen suspension and cleanup assertions remain. Earlier failed JSON and remaining traces are retained. Some initial release traces were overwritten by the first correction run; their JSON errors remain.

Native installed Chrome on Intel UHD/D3D11 renders all four gallery selections, Services and Process at 1440 and 390 pixels without page errors. Intro captures at progress approximately 0, .25, .50, .75 and 1 show actual playback and continuous same-instance handoff. Standalone production-preview Services and Process also render with one canvas. Screenshots were opened and visually inspected.

Final application TypeScript/lint/unit/build checks passed after the application corrections. Subsequent changes affect browser fixtures, validation documentation and ignored evidence scripts only.

The release browser suite covers selection, inertia, keyboard, honest metadata/link destinations, actual touch emulation and vertical scrolling, accessible reduced/no-WebGL/texture-failure fallback, ten complete world cycles, idle frames and refreshed production routes. Inherited suites cover context restoration/repeated failure, delayed/rejected imports, shader recovery, all six A states/depth views, twenty W route cycles, intro session/skip/assembly continuity, and the six-step enquiry through review without submission.

## Resources and performance boundaries

The final build contains 108,596 locally gzipped initial/preloaded JS bytes (342,119 raw) and 586,543 raw Three.js vendor bytes, below the proposed 115,000/600,000 limits. Evidence: `bundle-final.json`. Gallery geometry/materials/textures are leased once per scene and disposed on route exit; selection does not rebuild them. Per-chapter renderer counts and route-cycle plateaus are recorded in JSON.

Native high-quality counts after visiting successive chapters (same counts at 1440 and 390):

| Active scene | Draw calls | Triangles | Cached geometries | Textures | Programs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gallery | 16 | 1,576 | 22 | 8 | 5 |
| Services | 27 | 14,070 | 44 | 11 | 6 |
| Process | 56 | 11,536 | 83 | 11 | 6 |

Counts are cumulative uploaded renderer resources as chapters become visible. Ten complete gallery/Services/Process-to-booking cycles plateau at 77 uploaded geometries in the software test (different prior visibility), with no canvas/active owner on booking. Twenty W-to-booking cycles plateau at 14. Settled gallery adds zero draw frames during a 1.5-second idle observation; offscreen rendering suspends.

Counts from renderer.info are resource objects, not measured VRAM. SwiftShader captures and CPU draw gaps are not physical-device FPS/GPU timing. Installed desktop Chrome additionally exercises the Intel UHD/D3D11 backend without a capability override. Physical iOS/Android performance, thermals, battery, Safari and Firefox remain unverified. The intro intentionally skips on reduced motion, low capability or late readiness. Portfolio preview cropping does not claim newly tested responsive client-site screenshots.

## Deployment and public verification

Pending. Preserve the existing workflow, root base, GitHub Pages domain/HTTPS, repository Formspree variable and six-step business logic. Remote master must be rechecked immediately before normal integration/push. Record the release commit, Actions URL/result, live rendered desktop/mobile checks, asset requests, actual gallery/Services/Process interactions, route refresh and www redirect behavior here after deployment.

## Local reproduction

`npm run dev -- --port 5175 --strictPort`, then `http://127.0.0.1:5175/?experience=v2`. Replay intro with `&intro=1`. Production preview after `npm run build`: `npm run preview -- --port 4175 --strictPort`. Root URLs require no repository subpath. Run the release browser configuration with separate `WEBORA_RELEASE_REPORT`, `WEBORA_CHECKPOINT_OUTPUT`, `WEBORA_EVIDENCE_DIR` and `WEBORA_IDENTITY_OUTPUT` paths to preserve historical evidence.
