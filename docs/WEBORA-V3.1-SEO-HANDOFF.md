# Webora V3.1 — SEO audit and integration handoff

Scope: every prerendered public route, audited from a local production build
(`VITE_SITE_URL=https://webora.design`, `VITE_BASE_PATH=/`, matching the Pages
workflow). No production system, DNS, analytics account or live configuration
was contacted or changed.

## 1. What already passes

| Check                                                         | Result                                                   |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| One `<h1>` per route, no skipped heading levels               | All 11 routes + 404                                      |
| Unique `<title>` per route                                    | No duplicates                                            |
| Meta description, `og:title`, `og:description`, Twitter card  | Every route                                              |
| `og:image`, canonical, `og:url` (when `VITE_SITE_URL` is set) | Every indexable route                                    |
| Image `alt` and intrinsic `width`/`height`                    | All images (decorative images use `alt=""`)              |
| Crawlable prerendered HTML (content present without JS)       | All routes                                               |
| `robots.txt` (production build)                               | `Allow: /` + sitemap reference                           |
| 404 page                                                      | `noindex`                                                |
| Local/preview builds without `VITE_SITE_URL`                  | `Disallow: /`, empty sitemap (prevents preview indexing) |

## 2. Frontend changes made in V3.1 (in this diff)

- **Titles** now carry service intent instead of generic labels, e.g.
  `Services — WEBORA` → `Web Design & Development Services — WEBORA`;
  case studies read `Harvester Parts: Website Case Study — WEBORA`, concepts
  `Form & Field: Website Concept — WEBORA` (`src/data/seo.ts`).
- **Descriptions**: removed the duplicated tagline on concept pages
  ("Space to make an impression. Space to make an impression.") and the
  `Status: CONCEPT.` suffix; each now ends with a plain status phrase
  ("Live website case study by Webora." etc.). Home description names the
  real offer: business websites, online stores, landing pages, interactive.
- **`theme-color`** updated from the retired V1/V2 `#08090e` to V3 paper
  `#efebe3` (`index.html`).
- **Social card** (`public/og.svg` → `public/og.png`, 1200×630) redrawn in the
  V3 identity; it previously showed the retired violet V1/V2 mark.
  `scripts/generate-og.mjs` now inlines the bundled brand fonts.
- **Accessible headings**: the decorative ✳ in case-study `<h1>`s is now
  `aria-hidden`, so screen readers announce only the project name.
- **On-page content**: the home hero now states who Webora serves
  ("Built for: Service businesses · Online stores · Specialist commerce ·
  Personal brands") and the process chapter ends in a contextual link to the
  enquiry. No keyword stuffing; every phrase reflects existing services.

## 3. Outside frontend ownership — proposed, not applied

These touch build/deploy output (`scripts/prerender.mjs`, hosting) and so are
left for the integration owner.

### 3.1 Canonical / sitemap trailing-slash consistency (recommended)

GitHub Pages serves each route from a directory (`dist/work/index.html`).
Pages normally answers `https://webora.design/work` with a redirect to
`/work/`, but the generated canonical, `og:url` and sitemap entries use the
slash-less form (`https://webora.design/work`). A canonical that points at a
redirecting URL is a mixed signal.

1. **Verify** after the next deploy: `curl -sI https://webora.design/work`
   (expect `301` with `location: .../work/` if the assumption holds).
2. If confirmed, emit trailing slashes for non-root routes in
   `scripts/prerender.mjs` (canonical, `og:url`, sitemap `<loc>`), and the
   matching client-side update in `src/App.tsx` (`canonical.href`). Example:
   ```js
   const pageUrl = (path) => `${origin}${path === "/" ? "/" : `${path}/`}`;
   ```
3. Internal `<a href="/work">` links then incur one redirect hop for
   crawlers; acceptable, or switch router links to trailing-slash paths in a
   separate change.

If the site is instead served by Vercel (`vercel.json` rewrites `/work` →
`/work/index.html` without redirect), the current slash-less canonical is
already consistent; pick one host's behaviour and align to it.

### 3.2 Concept pages

`/work/form-and-field` and `/work/off-script` are clearly labelled concepts
with ~320 words each and are listed in the sitemap. They do not compete with
other pages' intent, but they are thin. Options: keep (portfolio depth), or
add `<meta name="robots" content="noindex,follow">` and drop them from the
sitemap in `scripts/prerender.mjs`. Business decision.

### 3.3 Structured data

Current JSON-LD (`Organization`: name, description, email, telephone,
Instagram, url) is factual. Possible additions **only once verified**:

- `WebSite` with `name` and `url` (safe; no new claims).
- `ProfessionalService` / `areaServed` / postal address: **not added** —
  the codebase contains no verified business address or service area. The
  +91 phone number is the only geographic signal.

### 3.4 Geographic targeting

Search topics such as "web design Punjab/India" were considered but **not
applied**: no location, city or service-area claim exists anywhere in the
site content, and none was supplied. If Webora wants local discoverability,
provide the verified service area and it can be stated once, truthfully,
on the Studio page and in `ProfessionalService` JSON-LD. No location-specific
landing pages should be fabricated.

### 3.5 Production configuration reminders

- Keep `VITE_SITE_URL=https://webora.design` in the Pages workflow; without
  it the build intentionally blocks indexing.
- Submit `https://webora.design/sitemap.xml` in Google Search Console after
  deploy (account owner action).
- Rankings are not promised by any of the above; these changes remove
  ambiguity and describe the real offer clearly.

## 4. How to re-run the audit

```sh
VITE_SITE_URL=https://webora.design VITE_BASE_PATH=/ npm run build
# then inspect dist/**/index.html, dist/robots.txt and dist/sitemap.xml
```

On Windows Git Bash, run the build from PowerShell (or set
`MSYS_NO_PATHCONV=1`) so `VITE_BASE_PATH=/` is not rewritten into a path.
