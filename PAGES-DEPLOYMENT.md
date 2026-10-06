# GitHub Pages release preparation — 6 October 2026

Repository: https://github.com/kiratveersinghralhan-hue/Webora

Production target: https://kiratveersinghralhan-hue.github.io/Webora/

The supplied repository was empty. The existing `master` branch is retained and `origin` points to that exact repository. GitHub CLI authentication and admin access were verified. Pages was enabled with `build_type=workflow` and HTTPS enforcement confirmed. Actual deployment and public-site verification follow the launch commit; enabling Pages alone is not deployment proof.

## Compatibility changes

- Vite receives `VITE_BASE_PATH` and `VITE_SITE_URL` from official Pages configuration outputs.
- BrowserRouter and server prerendering share the same basename; intercepted DOM navigation removes that base before calling the router.
- Public screenshots and Three.js project textures use Vite's base; font URLs are rewritten by Vite. HTML favicon and font preload use `%BASE_URL%`.
- Eleven complete route documents remain crawlable. A generated Pages `404.html` restores the original path, query and hash through the root document before React starts; redirected routes use a fresh React root to avoid hydrating the wrong page.
- Canonical, Open Graph, structured organization metadata, sitemap and robots include the repository path. Trailing-slash refreshes normalize page metadata correctly.
- Pinned official GitHub Actions build with Node 24.19.0, `npm ci`, typecheck, lint and unit tests, then upload only `dist` as the Pages artifact. `dist` is never committed.

No CSS, content, scene geometry, shaders, intro, Lenis, ScrollTrigger, adaptive DPR, cursor or form business logic changed. The only engine edit prefixes project texture URLs. Existing inactive Supabase files remain preserved and are not deployed or configured.

## Configuration and safety

Repository variable `VITE_FORMSPREE_FORM_ID` contains the supplied browser-safe form ID. No Formspree management key is used. The public site URL is also recorded as repository variable `VITE_SITE_URL`; the workflow derives its build value from Pages metadata to match the hosting configuration.

The enquiry remains AJAX with validation, duplicate locking, draft retention, retry and the existing success UI. Automated tests intercept all provider requests. No real enquiry or email delivery is exercised; inbox notifications must be confirmed separately by an authorized manual enquiry.

`scripts/check-release.mjs` checks candidate or staged files without printing credential values. `.env`, `.env.local`, build output, dependencies, browser traces and screenshots are ignored. Only placeholder `.env.example` files are eligible for Git. The source and legacy fixtures were also reviewed for private configuration.

## Validation

- TypeScript and lint passed.
- Production build passed; eleven routes, robots, sitemap and Pages fallback generated.
- Full unit suite: 70 passed.
- Full browser regression: 34 passed.
- Targeted enquiry suite: 7 passed.
- `playwright.pages.config.ts` exercises the real `/Webora/` artifact on a static server with directory redirects and genuine 404 recovery. It also supports testing the public URL via `WEBORA_TEST_URL` without a local server.
- Largest production chunk: Three.js renderer 378.30 kB (94.66 kB gzip), below Vite's unchanged warning threshold. No Vite chunk warning was emitted. Lazy scene loading, route splitting and adaptive quality remain intact.

Local checks establish compatibility, not successful hosting. The final delivery report records the launch commit, Actions result, actual public URL and hosted smoke test results after publishing.

Workflow references: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Vite deployment base guidance](https://vite.dev/guide/static-deploy.html#github-pages), [Node LTS releases](https://nodejs.org/en/about/previous-releases).
