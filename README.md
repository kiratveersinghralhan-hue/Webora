# WEBORA

An independent studio website: an original spatial identity with a clear project enquiry journey. Built with React 19, Vite 8, TypeScript, Three.js, GSAP and Lenis.

## Run locally

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173. All business pages and the six-step form work locally. Without backend configuration, submission displays an honest connection notice and keeps the brief available; WhatsApp and email links are usable.

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```

The production build prerenders eleven routes into complete HTML. The project form and inner pages are split into route chunks. Three.js and motion load dynamically; system reduced motion keeps the engines off by default, with an explicit Enable 3D experience choice. Local fonts include their licenses.

Replay the intro locally at [127.0.0.1:4173/?intro=1](http://127.0.0.1:4173/?intro=1).
This loopback-only query also enables motion for local visual QA when the OS requests
reduced motion. It works in the production preview build; production hosts ignore it.
Ordinary sessions skip the intro after it has played. See
[EXPERIENCE-CORRECTION-REPORT.md](./EXPERIENCE-CORRECTION-REPORT.md) for the current
camera choreography, responsive sculpture, carousel and verification.

## Where to edit

- `src/data/studio.ts`: contact details, services, process, engagement scopes and project records.
- `src/styles/global.css`: design tokens, composition, responsive styles and reduced motion.
- `src/styles/spatial.css`: the spatial work theatre, scene presentation and responsive refinements.
- `src/three/engine.ts`: layered W, real project surfaces, service compositions, process path and reactive fabric.
- `src/three/Spatial.tsx`: viewport-based progressive loading and fallback lifecycle.
- `src/lib/pointer.ts`: shared normalized pointer, damping and restrained magnetic interactions.
- `src/lib/pageMotion.ts`: lazy Lenis/GSAP integration, route entry, reveals and section progression.
- `src/pages/StartProject.tsx`: accessible, six-step qualification and opt-in local drafts.
- `shared/enquiry.ts`: active frontend validation and configurable budget preferences.
- `src/services/enquiries.ts`: AJAX Formspree field mapping, confirmed receipt and safe failures.
- `src/lib/attribution.ts`: bounded entry attribution retained for this tab session.
- `supabase/`: inactive legacy storage/Edge/email prototype and regression fixtures; not a V1 launch dependency.
- `scripts/prerender.mjs`: crawlable route HTML, metadata, robots and sitemap.

The signature work sequence contains Harvester Parts and Gloss Boss (public websites), VEYRATH (in development) and the Article Project (in progress, final details pending). Real URLs and captures were recovered from the previous portfolio; missing URLs remain unavailable. VEYRATH uses explicitly labelled portfolio artwork, not a claimed website capture. Form & Field and Off Script remain in the website concept archive and retain their original case-study routes. Project metadata is centralized in `src/data/studio.ts`; the prerender route list follows records with available case studies. See [SPATIAL-REPORT.md](./SPATIAL-REPORT.md) for provenance, validation and performance measurements.

## Connect enquiries

See [BACKEND-SETUP.md](./BACKEND-SETUP.md). V1 uses Formspree with the public `VITE_FORMSPREE_FORM_ID` in ignored `.env.local`. No Supabase credentials or Formspree API/management keys are required. No real Formspree submission or email delivery has been verified. Automated submissions are mocked.

## Production

The approved site deploys from `master` in [kiratveersinghralhan-hue/Webora](https://github.com/kiratveersinghralhan-hue/Webora) through `.github/workflows/pages.yml`. GitHub Pages supplies the production base path and public site URL. Node 24.19.0 and the lockfile are pinned; Actions uses `npm ci`, validation, a production build and the official Pages artifact/deployment actions. `dist` is ignored and never committed.

The production URL is `https://kiratveersinghralhan-hue.github.io/Webora/`. The public Formspree ID comes from repository variable `VITE_FORMSPREE_FORM_ID`; no management key is needed. Configure Pages under **Settings → Pages → Source → GitHub Actions**. Rebuild after changing the form variable.

Clean routes are retained with `BrowserRouter` and a matching SSR basename. Eleven prerendered route directories support direct visits and refreshes. The generated `404.html` redirects unresolved routes through the site root, restoring the original path, query and hash before React starts. Public screenshots, WebGL textures, fonts, favicon and social previews respect Vite's base. The older Vercel configuration is unused by Pages.

To reproduce the Pages artifact locally:

```powershell
$env:VITE_BASE_PATH='/Webora/'
$env:VITE_SITE_URL='https://kiratveersinghralhan-hue.github.io/Webora/'
# Set the public form ID locally if you want the configured submission UI.
npm run build
npx playwright test --config playwright.pages.config.ts
```

The Pages tests block every Formspree request, exercise a static server with genuine directory redirects and 404 responses, and can target the live site via `WEBORA_TEST_URL`. The ordinary regression suite uses a root-base build; clear the two variables and rebuild before `npm run test:e2e`. No live enquiry is submitted by either suite. See [PAGES-DEPLOYMENT.md](./PAGES-DEPLOYMENT.md) for deployment evidence and remaining proof boundaries.

## Interaction choices

The native pointer remains visible. A secondary interpolated cursor adds context labels and modest magnetic feedback. Touch and reduced-motion users get native interactions. Lenis is desktop-only, uses GSAP's ticker, preserves native anchors, and is excluded from the form. The form controls never animate while typing. Forward steps use a brief exit/entry; Back stays immediate.

Scenes cap DPR at 1.5 on desktop and 1.15 on mobile, reduce it on sustained slow frames, and pause outside the viewport or when the document is hidden. Work, service and process rendering rests when interaction settles. There is no postprocessing pipeline or downloaded model pack. Geometry, materials, textures, listeners, observers and animation loops are disposed on route changes. Static fallback artwork remains available on renderer failure or context loss. Mobile keeps a lighter spatial Three.js carousel with horizontal touch drag and native vertical scrolling. The desktop gallery pins briefly; short landscape screens remain unpinned. The W supports full drag rotation, inertia and keyboard rotate/reset controls. A bounded, skippable first-visit intro shares the hero canvas and is suppressed for the rest of the session. Orientation sensor access is intentionally not requested.

See [IMMERSIVE-REPORT.md](./IMMERSIVE-REPORT.md) for the intro, 360 exploration, carousel, responsive review and final addendum measurements.

Privacy-conscious event hooks are dispatched as `webora:analytics` browser events with a small event name/step/project payload. There is no external analytics vendor, cookie or contact data in those events.
