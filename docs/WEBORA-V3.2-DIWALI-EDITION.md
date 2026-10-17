# Webora V3.2 — Diwali Edition 2026

A seasonal layer over the V3 Impression site. Business services stay primary;
the festive edition adds a night palette, lit clay diyas around the W, and the
Memory Gift packages.

## Where it lives

| Area | Files |
| --- | --- |
| Palette, typography, festive UI | `src/styles/v3-diwali.css` (everything scoped to `.living-layout.v3.diwali`) |
| Package data, enquiry pre-fill | `src/data/diwali.ts` (`giftPackages`, `giftComparison`, `applyGift`) |
| Rangoli, sparks, diya icon, cards, sample preview, comparison | `src/components/Diwali.tsx` |
| Memory Gifts page (`/diwali-gifts`) | `src/pages/DiwaliGifts.tsx`, route in `src/App.tsx`, SEO in `src/data/seo.ts`, prerender list in `scripts/prerender.mjs` |
| 3D clay diyas | `src/three/geometry/diyaGeometry.ts`, `src/three/scenes/DiyaLights.ts`, added in `ImpressionScene` |
| Intro copy (same V3.2 360° revolution) | `src/three/IdentityCore.tsx` |
| Static fallback diyas (reduced motion / no WebGL) | `src/three/ImpressionFallback.tsx` |
| Tests | `tests/diwali.test.ts` |

## Behaviour notes

- The V3.2 revolution timing is unchanged. Diyas ignite in sequence across the
  turn and the W finishes in the exact hero pose.
- Flames only request frames during the intro plus an 8 s window, or 4 s after
  pointer movement, then rest lit. An idle hero draws nothing.
- Diyas use ordinary materials only (no custom shaders, no point light).
- Gift CTAs open `/start-project?gift=<id>`. The existing six-step brief and
  Formspree payload are unchanged; the edition is written into
  `additional_requirements` as `Diwali Memory Gift: <name> (<price>).`
- Package sample content is fictional and labelled as illustrative.

## Package terms to confirm before launch

Photo counts, chapters, revision rounds and "priority delivery before Diwali"
in `src/data/diwali.ts` are draft commercial terms. Confirm them before
publishing.

## Ending the season

1. In `src/layouts/Layout.tsx`, remove `diwali` from the layout class and the
   `Diwali Gifts` nav, mobile menu and footer links.
2. Remove `<GiftsChapter />` from `src/pages/LivingHome.tsx` and the ribbon,
   rangoli and sparks from `src/components/ImpressionHero.tsx`.
3. Remove the `DiyaLights` lines from `ImpressionScene` (and restore the
   nickel material colours), or keep `/diwali-gifts` live as an archive page.
