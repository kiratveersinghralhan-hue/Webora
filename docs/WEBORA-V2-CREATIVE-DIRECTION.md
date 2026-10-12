# WEBORA V2 — Creative direction

10 October 2026. **Everything labeled design/proposal below is a blueprint, not an implemented feature.** Current observations are recorded in the [audit](WEBORA-V2-AUDIT.md); engineering and delivery are in [architecture](WEBORA-V2-TECHNICAL-ARCHITECTURE.md) and [plan](WEBORA-V2-IMPLEMENTATION-PLAN.md).

## 1. Creative decision

**WEBORA — THE LIVING DIGITAL STUDIO.** A dark editorial studio where the W, its folded surfaces, and the websites made by the studio inhabit one changing spatial composition. The sculpture resolves, opens a gallery of website surfaces, organizes into service structures, and traces the six-stage process before settling beside the final enquiry invitation.

The W remains the visual signature. Every secondary form must be explainable as a fold, section, edge, aperture or surface of that identity. Geometry establishes depth and directs attention; readable HTML carries the offer, project facts and conversion actions. No city flythrough, game interface, unrelated planets, decorative primitive collection or obligatory exploration maze.

Maintain the current business language and project truth. This phase does not propose new testimonials, results, client claims, pricing, contact channels, or portfolio statuses.

## 2. Reference review: verified observations, interpretation, limits

All five supplied references were opened on 10 October in the browser. Observations are visual/interactive rather than guesses about private source code. No assets, textures, models, fonts or shaders were downloaded for reuse. Screenshot appearance alone does not establish the rendering technology or physical simulation.

### Felix Rieseberg

Reviewed [the supplied Landing Love listing](https://www.landing.love/sites/felixrieseberg/) and followed its Visit Site link to [Felix's actual site](https://felixrieseberg.com/).

**Verified:** a warm desk/monitor scene by a rainy nighttime window; tapes and objects reinforce the personal identity. A monitor offers an entry choice; entering muted changes the screen to the personal title. HTML navigation and visible keyboard hints coexist with the scene. The listing categorizes the site as retro/3D/portfolio; that classification is not a source audit.

**Adapt:** give Webora a specific inhabitable material world, and make objects meaningful navigation/identity elements. Maintain equivalent HTML links and a direct enquiry path. Carry the same object through entry and hero.

**Do not copy:** the desk, monitor, tapes, late-90s treatment or sound assets. Webora's world is its own folded studio geometry. Do not introduce a mandatory entry click or long loading ritual for prospective clients. The complete computer/CD-player simulation and its performance were not tested.

### Superlocal Design

Reviewed [the live Superlocal site](https://www.superlocaldesign.com/). The URL currently presents the **Superlocal 2026 design festival**, not an assumed studio portfolio.

**Verified:** pale dotted field, warm orange lower atmosphere, circular portrait/image elements and luminous objects surrounding a dotted central composition. Compact pill navigation remains legible. Scrolling expands/repositions the portrait/orb composition before the content sections; schedule, lineup and event actions exist in HTML.

**Adapt:** a consistent shape vocabulary can tie numerous content elements together; composition changes can make a transition feel spatial. Keep navigation readable while the large visual changes.

**Do not copy:** festival palette, circular collage, portraits or typographic identity. Its GPU implementation, exact transition timing, mobile behavior and performance were not verified.

### Ricardo Chance

Reviewed [the live site](https://www.ricardochance.com/), including the hero and Flixxo selection in Featured Work.

**Verified:** dark violet environment, luminous star-like central form, editorial italic typography, explicit creative-developer positioning, Start a project/View work actions. The featured project selection changes the preview, project label, service metadata and external link together; the Flixxo preview settled after selection. Services and process content explain the offer.

**Adapt:** use striking visuals with an understandable commercial offer, give website screenshots a strong presentation stage, and keep metadata/actions outside the decorative geometry. Couple project state to one authoritative selection.

**Do not copy:** star form, typography, claims, textures, project assets or case-study content. “Shaders” and “3D” in its service copy are claims by that site, not independent proof of any particular engine. No numerical carousel physics or GPU measurement was obtained.

### Kenichi Aikawa — highest-priority gallery reference

Reviewed [the live site](https://aikawakenichi.com/), category controls and entry into [Work](https://aikawakenichi.com/work).

**Verified:** large editorial PORTFOLIO typography on a white field; image surfaces bend around a cylindrical volume with adjacent imagery receding around the sides. A reflection-like presentation appears beneath the volume. Work/Fashion/Journey labels, previous/next category controls and a compact floating navigator make selection visible. Next category produces a rotating spatial transition; a pointer drag produced a changed/intermediate composition, followed by a settled category state. Selecting Work transitions toward its gallery, with curved image fragments visible during entry and layout/back controls present.

**Interpretation:** curvature, front/back depth, movement of neighboring images and material continuity give the gallery a coherent physical identity. This supports an arc-based Webora gallery proposal; it does not prove a specific spring implementation or calibrated mass/friction.

Scrolling within Work also exposed a larger, flatter front image, Details/Gallery navigation and a ZOOM affordance while curved fragments remained around the composition. The zoom action itself was not exercised.

**Not verified:** exact easing curves, timings in milliseconds, velocity law, touch behavior, all layout modes, keyboard semantics, source/engine, or performance. Do not claim the reference uses a particular shader, Three.js version, spring constant or DOM/WebGL technique. The Webora parameter values below are original starting values for tuning.

**Adapt:** one curved spatial gallery, readable active content, neighboring surfaces that establish depth, a discrete selection affordance and a purposeful entry/exit. Use shallow curvature on website screenshots so their content remains recognizable. A subtle studio-light floor gradient can suggest grounding; a reflection render pass is optional only after profiling.

**Do not copy:** cylindrical photo wrap, white/serif identity, photographs, category structure, fragmentation sequence or floating control design. Webora showcases websites with honest status and case-study links; it is not a photography clone.

### Batcloud Art

Reviewed [homepage](https://batcloud.art/), and accessible [About](https://batcloud.art/about/) and [Instructions](https://batcloud.art/instructions/) material.

**Verified:** sparse black screen, letter-spaced white wordmark/type, a single question input and deliberately quiet instruction hierarchy. About describes an artwork/listening encounter; this provides context, not proof of a browser WebGL scene. No question was submitted.

**Adapt:** confidence through restraint and focused interaction. Use silence/negative space between larger spatial movements. The booking interface benefits from this discipline.

**Limit:** experimental WebGL, oracle behavior after submission, shader effects and full immersive interaction were **not verified** in this environment. Those features cannot serve as engineering evidence for Webora.

## 3. Liquid-effect input and originality

The named `abstract-liquid-effect-landing-page.zip` was not available in the searched locations; it needs to be supplied again before reviewing its source or license. No design decision depends on permission to reuse it.

Propose an original metallic/liquid surface with electric blue/violet reflections, a stable W silhouette and shallow controlled surface flow. Start with programmatic W geometry and an original generated studio environment. Refraction is a high-quality optional branch, not a mandatory full-screen distortion effect. Maintain a license/source record for any later commissioned or supplied media. Public accessibility of a reference does not grant reuse rights.

## 4. Visual system proposal

| Role             | Starting token / rule  | Application                                                 |
| ---------------- | ---------------------- | ----------------------------------------------------------- |
| Background       | `#08090E`              | Retain approved near-black identity                         |
| Graphite surface | `#11131C` / `#1A1D2A`  | Quiet reading panels/controls                               |
| Primary text     | `#F4F2F6`              | HTML headings and controls                                  |
| Secondary text   | `#B1B4C7`              | Readable supporting copy; check contrast on actual surface  |
| Electric blue    | `#5676FF`              | Selected state/lighting; not assumed to pass for small text |
| Violet           | `#AA96FF`              | Brand emphasis and controlled reflections                   |
| Ultraviolet      | `#7550D8`              | Material shadow/light transition, not body copy             |
| Cyan             | `#76D6E7`              | Small glints, no large competing field                      |
| Metal            | Neutral graphite/alloy | Let lighting produce color, avoid neon emissive everywhere  |

Keep licensed Space Grotesk and DM Sans initially. Retain HTML text, real selectable headings and clear focus outlines. Use a disciplined editorial grid, shared gutters and a reserved hero text column. Model projections must respect safe text rectangles. Avoid shader text, animated body copy, giant filler headings and tiny all-caps information as the only explanation of a control.

Use maximum readable line lengths (body roughly55–75 characters), fluid headings with mobile-specific breaks and at least16 px primary body copy. Key hit areas target44×44 CSS px. Validate contrast rather than assuming electric accents are accessible. The palette values are proposed tokens to be reviewed in actual lighting, not a new approved production design.

## 5. One spatial narrative, six readable chapters

| Chapter       | Composition and transition proposal                                                                                                                                       | Visitor control / content                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Intro         | Short luminous edges emerge; folded fragments coalesce with a shallow liquid flow; W resolves and light travels across bevels. A restrained camera arc reveals thickness. | Skip immediately; no minimum load delay; complete/error/reduced motion all reveal HTML. |
| Hero          | Same W and lighting settle right of the offer; slight pointer parallax, honest full-turn exploration.                                                                     | Primary CTA always reachable; scroll/touch vertical gesture remains natural.            |
| Selected Work | Camera widens; W edges open into three visible website surfaces on a shallow arc; active screen faces viewer.                                                             | Drag or select a project; external live links and case-study links remain HTML.         |
| Services      | Gallery recedes; one set of W-derived folds forms service-specific compositions beside disclosure text.                                                                   | Select/focus a service; form CTA stays anchored in the content.                         |
| Process       | Folds become a six-part structure following the W's path; one light/traveler emphasizes the selected stage.                                                               | Discover, Direction, Design, Develop, Refine, Launch tabs work without scrolling.       |
| Final CTA     | Pieces settle back into a quieter W silhouette; scene brightness drops to frame the invitation.                                                                           | Clear booking/WhatsApp/email; booking route is a calm independent interface.            |

Value/principles/engagement content already present in V1 remains available between chapters. Let the shared environment rest behind those editorial sections; do not silently delete them to fit a six-scene diagram.

Camera movements should feel like one camera learning a single object. Avoid a succession of unrelated spin-ins, explosive transitions and independently animated backgrounds. There should be clear intervals where the geometry stops and people can read.

## 6. Intro storyboard proposal

Creative timing after first useful frame; actual total must shorten on skip, failure or delayed readiness:

| Approximate time | Image / engineering intention                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–0.35 s         | Reveal two rim-lit W folds from near-black; HTML and skip are already present.                                                                |
| 0.35–1.05 s      | Fragments converge along designed paths; surface normals/reflection flow create an organic feel without changing the outer silhouette wildly. |
| 1.05–1.65 s      | Resolve beveled W, expose rear detailing and a controlled blue→violet light sweep; camera yaws about15–25°.                                   |
| 1.65–2.2 s       | Camera/object settle directly into hero framing; concise studio identifier yields to business headline.                                       |

Target **1.8–2.4 s maximum cinematic playback once ready**, with a safety deadline **≤3 s from request** and no enforced minimum wait. If first useful render arrives too late, reveal hero/fallback and skip the cinematic path. Target mobile playback **≤1.5 s**, or no intro on low-power/reduced motion. No autoplay audio. Session key/version behavior must be explicit; never replay merely because a route remounted.

This is not proof of seamless morph topology: proposed “liquid” is low-amplitude continuous surface/lighting deformation plus fragment convergence. True topology fusion is out of scope for the first implementation slice.

## 7. Signature gallery proposal

Use actual mesh depth: a shallow three-quarter studio arc, not CSS cover-flow. Active screenshot becomes near-front-facing; immediate neighbors angle away and move behind. A small W-derived metallic sidewall gives the screen thickness. Surface curvature should be subtle (roughly6–10° across the active preview as a starting range), flattening near active focus; inactive surfaces can bend more.

Desktop: one dominant screen plus two cropped neighbors, metadata below/alongside in a fixed HTML block. Tablet: one screen and partial neighbor, shallower depth and no pin. Mobile: one readable screen, a narrow next-preview cue, simple previous/next and numbered buttons below; no wheel trapping. Low power/reduced motion: ordinary readable HTML cards or a simple accessible selected-card gallery.

Do not endlessly wrap four projects through duplicate claims. Bound the index0–3 with soft edge resistance; Article Project remains a labeled in-progress editorial panel, not a fake client screenshot. Concept archive stays separate.

On release, project motion settles using one shared position; metadata swaps once per intentional selection, not on every frame. Case-study navigation feels like entering the active screen, but the route must still load if the scene fails. The exact physics, control semantics and ownership contract are in the architecture document.

## 8. Interaction and motion direction

- Cursor: retain native cursor availability; contextual `EXPLORE`, `DRAG`, `VIEW` labels. Drag feedback follows actual gesture state. Never show a drag label for a non-interactive surface.
- Sculpture: full yaw, limited pitch, restrained inertia. Idle stops on touch/low power. Back/side materials and bevels must survive a full inspection.
- Light response: small movement toward pointer, no bright flashing or moving glare over HTML.
- Magnetic controls: only fine-pointer CTA surfaces; displacement≤6 px; no hit-target drift, form-field magnetism or focus animation trap.
- Scroll: one scene-camera owner; reversible chapter progression. No forced scroll velocity, no multi-screen pinned service/process sequences.
- Route entry: brief stable transition, roughly250–450 ms target. Avoid stacking full-page blur, model spin and duplicated text crossfades.
- Reduced motion: static sculpture/preview, all content/links intact, no pin/camera travel/parallax; reversible explicit opt-in is possible.

## 9. Original model family and cost envelope

Costs below are **relative proposals** pending profiling, not measured current GPU values.

| Experience              | Role / technique                                                                           | Interaction                                      | Complexity / cost                                                                        | Mobile / fallback                                        |
| ----------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Webora Core             | Original beveled extruded W with designed rear faces; physical alloy and small shader flow | 360° yaw, constrained pitch, light response      | Medium; geometry/lighting are the main cost; optional high-tier transmission adds passes | Lower bevel density, no transmission; original SVG/still |
| Spatial Project Screens | Thin W-derived frames with subdivided curved planes and actual website textures            | Drag, discrete selection, keyboard and case link | Low–medium;3 visible previews, cache active±1 textures                                   | Single flatter screen, bounded textures; HTML cards      |
| Liquid Transformation   | Same W surface, low-amplitude normal/vertex flow and original reflection environment       | Short pulse on chapter/drag, settle to still     | Medium; high-tier refraction is expensive/optional                                       | Normal-only effect or static alloy                       |
| Process Structure       | Six W-path segments, constrained assembly/connection, shared materials                     | Tab/scroll stage moves emphasis and traveler     | Low–medium; instanced/reused parts where possible                                        | Static six-stage diagram with tabs                       |
| Service Object          | Same fold family reorganizes into hierarchy/storefront/editorial states                    | Active disclosure drives one state               | Low–medium; reuse geometry/material, avoid six simultaneous models                       | Simplified single fold/static diagram                    |

No generic floating icosahedron should survive merely because it is easy to instantiate. Keep a primitive only when its finished design and relationship to the W are clear.

## 10. Review criteria before V2 implementation

Approve or revise: W silhouette/rear design, material restraint, arc-gallery composition, shorter intro, and single shared stage. These are creative proposals, not permission to publish. The first implementation slice should prove the W/material/intro in isolation before connecting the entire scroll narrative. Missing ZIP/license review can remain a separate input; original development does not require copying it.
