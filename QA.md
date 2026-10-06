# Current experience correction verification — 6 October 2026

Continued the existing working tree; no commit, push, deploy or real Formspree
submission. See [EXPERIENCE-CORRECTION-REPORT.md](./EXPERIENCE-CORRECTION-REPORT.md)
for root causes, visible scene changes and proof images.

- TypeScript, lint and production build passed; 11 routes prerendered.
- Unit tests: **70/70** in six files.
- Final full browser suite: **34/34**, including five new correction checks.
- Separate enquiry regression: **7/7**, with Formspree blocked/mocked.
- Fresh intro, ordinary session reuse, skip, desktop/phone local replay and an explicit
  reduced-motion opt-in passed; default reduced motion still avoids WebGL.
- One Lenis runtime generation survived route/hash changes; wheel movement showed
  measurable early-to-settled inertia. Discover, hero camera depth and process hash passed.
- Full-turn mouse/touch W dragging, damping, gallery drag/wheel/keys/arrows/direct
  selection, native touch scrolling and route cancellation passed.
- Requested matrix: 1920×1080, 1440×900, 1366×768, 1024×1366, 768×1024,
  430×932, 390×844, 360×800 and 844×390. Existing checks also cover 320 px,
  ultrawide/4K and eleven routes at the original six widths.
- Visual QA caught and fixed the VEYRATH background covering WebGL, decorative
  wordmark blocking Discover, early hash placement and mobile sculpture visibility.
- Mobile service selection keeps one sculpture above its content; breakpoint changes
  mount one scene at a time. A measured bounds check guards phone/tablet visibility.
- Unavailable/lost WebGL, no-JS content, accessibility, menu focus/Escape, offscreen,
  hidden and idle lifecycle checks passed. Real Formspree receipt was not exercised.
- Screenshot proof: qa/correction-intro.png, qa/correction-intro-mobile.png,
  qa/correction-hero-final.png, qa/correction-work-final.png,
  qa/correction-process-final.png and the requested gallery/service viewport matrix.
- Initial referenced JS: **317,766 bytes / 101,454 gzip**, +1,633 bytes (+0.52%)
  against the before-correction snapshot. Largest chunk: 378,303 bytes, lazy.
  No warning-threshold increase. See qa/bundle-correction-comparison.json.
- Final 120-frame local sample: median **16.7 ms**, p95 **33.4 ms**, max gap
  **100 ms**, one **111 ms** long task; 12 layouts / **2.21 ms** layout work.
  Software motion uses a lighter fill rate and resolves one sharper still frame;
  idle rendering stops. This is local Windows headless evidence.
- Protected enquiry service, shared validation, draft, attribution, project data and
  package manifest match the preserved before-correction snapshot.
- git diff --check passed; additional no-index whitespace checks covered **91**
  tracked/untracked text files because the current checkout is entirely untracked.

---

# Previous immersive verification — 6 October 2026

The intro/interaction addendum continues the existing working tree. No commit,
push, deploy or real Formspree submission. See [IMMERSIVE-REPORT.md](./IMMERSIVE-REPORT.md).

- TypeScript, lint and production build passed; 11 routes prerendered.
- Unit tests: 70/70 passed in six files.
- Full browser suite: 29/29 passed, including nine intro/interaction/performance checks.
- Separate targeted enquiry regression: 7/7 passed with Formspree blocked/mocked.
- Intro assembly/completion/skip/session reuse and same-canvas continuity passed.
- Full-turn W dragging, inertia and keyboard rotate/reset passed.
- Gallery keyboard, wheel, drag, direct selection and case-route cancellation passed.
- Trusted Chromium touch events exercised W/carousel drags and native vertical scrolling.
- Resizing through 4K, ultrawide, laptop, tablet, modern and 320 px phone passed;
  844×390 touch landscape navigation and gallery passed.
- Eleven routes remain without horizontal overflow at the original six viewport widths.
- Repeated mobile menus, focus/Escape, reduced motion, no-JS content, unavailable/lost
  WebGL, offscreen/idle rendering and synthetic visibility / lifecycle freeze-resume passed.
- Browser screenshots visually reviewed: intro, sculpture, gallery at 3840×2160,
  2560×1080, 1366×768, 768×1024, 390×844 and 320×740, landscape and form fields.
- Final initial referenced JS: 316,133 bytes / 100,896 gzip. Addendum +8,447 bytes
  (+2.75%) against the preserved prior tree; Three.js and motion remain lazy.
- 120-frame local headless sample: median 16.7 ms / p95 33.4 ms, largest gap 100 ms,
  one 104 ms long task; 8 layouts / 1.75 ms layout work. Before tuning: median about
  150 ms / p95 200 ms. These do not certify physical-device or production performance.
- git diff --check plus all 85 tracked/untracked text files passed whitespace checks.
  The repository has no tracked files/commits, so ordinary diff alone is insufficient.
- Formspree service, attribution, drafts, central portfolio data and package.json
  were hash-compared against the exact pre-addendum snapshot and are unchanged.
  Form component edits are presentation/step motion only; validation, submit lock,
  payload, consent, failure retention, reference reuse and drafts retain their architecture.

Remaining boundaries: missing verified VEYRATH URL/Article details, real Formspree
setup/delivery and hosted release validation, and physical-device performance.
No release or provider readiness is claimed. Existing NO_COLOR/FORCE_COLOR tooling
notice and public-origin/indexing configuration notice remain.

---

# Earlier spatial pass — 6 October 2026

The spatial upgrade is implemented in the current working tree. All work remains
local and uncommitted. The Formspree architecture and enquiry logic are preserved.

- TypeScript, lint and production build passed; 11 routes are prerendered.
- All 70 existing unit tests passed.
- Full browser regression: 20/20 passed (the original 14 plus six spatial checks).
- Separate targeted enquiry regression: 7/7 passed, with requests mocked/blocked.
- Desktop, touch/mobile, reduced motion, renderer/context failure, keyboard tabs,
  scene cleanup, idle rendering and simulated visibility pause/resume passed.
- No horizontal overflow across 11 routes at 320, 390, 768, 1024, 1920 and 3840 px.
- Browser screenshots were visually inspected; mobile preview sizing and process
  keyboard/scroll conflicts discovered during iteration were fixed.
- `git diff --check` and a separate untracked text-file whitespace scan passed.
  No files were staged for verification.
- Initial referenced JS: 1,004.024 kB → 307.686 kB (69.35% smaller). Three.js and
  GSAP/Lenis now load lazily; the old 500 kB chunk warning is resolved without
  changing its threshold.
- Baseline comparison verifies StartProject.tsx changed only its visual Core prop.
  The Formspree service, validation, drafts, attribution and conversion logic did
  not change.

See [SPATIAL-REPORT.md](./SPATIAL-REPORT.md) for scene details, exact portfolio
statuses/provenance, bundle measurements, media sizes, screenshots and limits.
Read-only public checks confirmed the supplied Harvester Parts and Gloss Boss
websites respond. No payments, bookings, fulfilment, real Formspree submissions or
email delivery were exercised. No physical-device fps or hosted CWV claim is made.

Remaining launch work is the real Formspree setup/receipt/domain verification,
actual public site origin and an authorized release with hosted validation.
VEYRATH's missing URL/current capture and the article project's final details
remain explicit content follow-ups. No commit, push or deploy was performed.

---

# Previous enquiry verification — 5 October 2026

WEBORA V1 enquiries now use Formspree. All work remains local and uncommitted.
No real Formspree ID has been configured, no real enquiry or email has been sent,
and no commit, push, database mutation or deployment has been performed.

## Current checks

- TypeScript: passed (`npm run typecheck`).
- ESLint: passed (`npm run lint`).
- Production build: passed (`npm run build`), without Supabase or Formspree
  configuration; eight routes prerendered to complete HTML, plus a 404 page.
- Vitest: **70 tests passed**. The active V1 coverage is 48 tests: validation,
  draft sanitization, Formspree payload/receipt/rejection/network/configuration
  guards, bounded attribution and session/storage fallback. The other 22 tests
  retain local regression coverage for the inactive database/Edge prototype.
- Browser: **14/14 scenarios passed in the final full run**, and **7/7 targeted
  enquiry scenarios passed**. An earlier full run passed 13/14; the remaining
  test's final WhatsApp assertion ambiguously selected the success panel and
  footer links. Scoping it to the success panel fixed the test without a product
  change. Its payload/attribution assertions had already passed.
- `git diff --check`: passed. The repository still has no tracked files, so a
  separate `git diff --no-index --check` scan covered all 73 untracked files and
  found no whitespace errors. No files were staged for that check.
- Preservation: SHA-256 comparison against the pre-change snapshot found 28 of
  33 existing `src/` + `public/` files unchanged. Only draft restoration, browser
  entry capture, privacy text, form attribution/submit guard and the enquiry
  service changed. Styles, the Three.js engine/Core, custom cursor, routing,
  case studies, concept visuals, contact data, fonts and public assets match.
- The built JavaScript contains no Supabase/Resend submission dependency.

## Browser coverage

Local Chromium verified all eight routes without horizontal overflow at **320,
390, 768, 1024, 1920 and 3840px** widths. Form coverage includes validation/error
focus, review editing, complete 320px navigation, opt-in draft restore/clear,
unconfigured service errors, delayed mocked receipt/double clicks, retained drafts
after network/provider rejection, retry unlock, clearing after receipt, and
Instagram homepage attribution sent as readable Formspree fields. Success stays
on Webora and keeps the correct return/WhatsApp links. Rendered mail/phone/WhatsApp
actions match the supplied studio contacts.

Desktop WebGL/navigation reported no uncaught page errors. Mobile menu escape/focus
handling, keyboard process tabs, service switching, reduced-motion fallback,
forced WebGL failure, off-screen rendering pause/resume and no-JavaScript
prerendered navigation passed. Automated axe checks found no WCAG 2 A/AA or
2.1 AA violations on the homepage, opening form, services and architecture concept
page in the tested reduced-motion state. This is not complete accessibility
certification or a physical-device performance claim.

## Automated submission safety and meaning

All Formspree unit requests are mocked. Playwright has a context-wide block for
`https://formspree.io/**`; specific enquiry scenarios override it only with
synthetic responses. Its isolated Vite server uses a labelled test-only fixture
ID, not real credentials. Success/failure tests verify frontend behavior, not
hosted storage or email delivery. No raw provider errors or lead data are logged.

The browser lock prevents concurrent duplicate clicks. The retained UUID is an
enquiry reference, not provider-level idempotency. A timed-out or lost response
may follow an accepted submission; operators should check the dashboard before
repeating manual tests. On-site success confirms AJAX acceptance and does not
promise notification delivery or a client autoresponse.

## Bundle review

Current production sizes:

| Asset                               |  Minified |      Gzip |
| ----------------------------------- | --------: | --------: |
| Core application                    | 236.84 KB |  73.84 KB |
| GSAP / Lenis motion                 | 131.46 KB |  49.34 KB |
| Project booking route + validation  | 103.40 KB |  30.42 KB |
| Three.js engine, dynamically loaded | 626.54 KB | 163.34 KB |
| Site CSS                            |  39.98 KB |   9.31 KB |

Vite's existing warning for the Three.js chunk above 500 KB remains visible. It
loads asynchronously and reduced-motion users bypass the engine. The warning
has not been suppressed. Existing DPR caps, off-screen/document visibility
pauses, disposal and static fallback are preserved. No Lighthouse/Core Web Vitals
results or physical-device frame-rate claims are made.

## Real verification still required

The single next lead-acquisition blocker is **configure and verify the real
Formspree form**: a real public form ID, verified notification recipient
`kiratveersinghralhan@gmail.com`, compatible spam settings, and one intentional
real local enquiry that appears in Submissions and arrives in the intended inbox.
These checks have **not** passed yet. Supabase is no longer a launch dependency.

Later, add the Formspree ID to Vercel, set the actual HTTPS `VITE_SITE_URL` for
indexing/canonical URLs/sitemap, and repeat a real enquiry on the production
domain. Production-domain acceptance and inbox/Reply-To checks remain unverified.
Client autoresponse is optional and plan-dependent; the site works without it.
Safari/Firefox and representative physical-device GPU/touch checks also remain
outside the current local Chromium evidence.

See [BACKEND-SETUP.md](./BACKEND-SETUP.md) for the exact manual steps. Preview
indexing stays disabled until the public site origin is supplied. Work pages
remain labelled independent **Concept Projects**, with no invented client claims.

## Earlier baseline and inactive legacy evidence

Before this switch, the recorded baseline passed TypeScript, lint, build, both
Deno Edge import-graph checks and 43 Vitest tests. Its 12 browser scenarios passed
across the full run and a targeted rerun after a mobile ornament overflow fix.
The recorded axe checks found no WCAG 2 A/AA or 2.1 AA violations in the tested
reduced-motion pages; this was automated coverage, not complete certification.

The SQL tests run the original migration in PGlite with emulated roles, and Edge
tests mock outbound requests. Their local storage/RLS/rate/queue behavior is
retained as **inactive prototype evidence only**. It does not establish hosted
Supabase/PostgREST/JWT behavior, multi-session concurrency or real email delivery,
and it is not an acceptance requirement for the active Formspree integration.
See [supabase/README.md](./supabase/README.md). No hosted Supabase setup is needed.
