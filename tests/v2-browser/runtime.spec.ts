import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const output = process.env.WEBORA_EVIDENCE_DIR || "test-results/v2-1a";
test.beforeEach(async ({ context, page }) => {
  await mkdir(output, { recursive: true });
  await context.route("https://formspree.io/**", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "no-preference" });
});
async function snapshot(page: Page) {
  return page.evaluate(() => {
    const gl = document.querySelector("canvas")?.getContext("webgl2");
    const debug = gl?.getExtension("WEBGL_debug_renderer_info");
    return {
      renderer:
        debug && gl
          ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
          : null,
      userAgent: navigator.userAgent,
      records: window.__WEBORA_RUNTIME__?.records ?? [],
      canvases: document.querySelectorAll("canvas").length,
      lenis: document.documentElement.dataset.scrollInstances,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
}
test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus && !page.isClosed()) {
    await writeFile(
      `${output}/failure-${info.title.replace(/[^a-z0-9]+/gi, "-")}.json`,
      JSON.stringify(await snapshot(page), null, 2),
    );
  }
});
async function settledPointer(page: Page) {
  // The same input-settled boundary for both versions; a fixed sleep can sample
  // damping in progress when this software-rendered browser is CPU constrained.
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const path = "/src/lib/pointer.ts";
          const { pointer } = await import(path);
          return pointer.velocity;
        }),
      { timeout: 15000 },
    )
    .toBe(0);
}
test("V1 instrumented baseline", async ({ page }) => {
  test.setTimeout(420000);
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?experience=v1&diagnostics=1");
  await expect(page.locator(".hero .core-ready")).toBeVisible({
    timeout: 60000,
  });
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 6000,
  });
  await page.screenshot({ path: `${output}/v1-desktop.png` });
  for (let i = 0; i < 25; i++) {
    await page.mouse.move(920 + i * 5, 370 + Math.sin(i) * 60);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(2000);
  await settledPointer(page);
  const idleStart = await snapshot(page);
  await page.waitForTimeout(1500);
  const idleEnd = await snapshot(page);
  for (const selector of [
    "#work",
    "#services",
    ".fabric-section",
    "#process",
  ]) {
    const section = page.locator(selector).first();
    if (await section.count()) {
      await section.scrollIntoViewIfNeeded();
      const sculpture = section.locator("[data-scene], .work-stage").first();
      if (await sculpture.count()) await sculpture.scrollIntoViewIfNeeded();
      const kind =
        selector === "#work"
          ? "work"
          : selector === "#services"
            ? "services"
            : selector === "#process"
              ? "process"
              : "fabric";
      await expect
        .poll(
          async () =>
            (await snapshot(page)).records.some(
              (r) => r.kind === kind && r.frames > 0,
            ),
          { timeout: 60000 },
        )
        .toBe(true);
    }
  }
  const traversed = await snapshot(page);
  await page.goto("/?experience=v1&diagnostics=1");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  await page.locator(".hero-scene").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${output}/v1-mobile.png` });
  const mobileStart = await snapshot(page);
  await page.waitForTimeout(1500);
  const mobileEnd = await snapshot(page);
  await writeFile(
    `${output}/v1-runtime.json`,
    JSON.stringify(
      {
        method:
          "Local Chromium dev build, emulated viewport, 1.5s idle windows; object counts are not VRAM",
        idleStart,
        idleEnd,
        traversed,
        mobileStart,
        mobileEnd,
      },
      null,
      2,
    ),
  );
  expect(traversed.records.filter((r) => r.active)).toHaveLength(5);
});

test("V2 original W, first frame, input, idle, section isolation and booking cleanup", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.locator(".hero .core-ready")).toBeVisible({
    timeout: 60000,
  });
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 6000,
  });
  await expect(page.locator("canvas")).toHaveCount(1);
  const stage = page.locator(".experience-stage");
  expect(Number(await stage.getAttribute("data-frames"))).toBeGreaterThan(0);
  await page.screenshot({ path: `${output}/v2-desktop.png` });
  for (let i = 0; i < 25; i++) {
    await page.mouse.move(920 + i * 5, 370 + Math.sin(i) * 60);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(2000);
  await settledPointer(page);
  const idleStart = await snapshot(page);
  await page.waitForTimeout(1500);
  const idleEnd = await snapshot(page);
  expect(idleEnd.records.at(-1)!.frames).toBe(idleStart.records.at(-1)!.frames);
  await page.getByRole("button", { name: "Rotate sculpture right" }).click();
  await expect
    .poll(async () => Number(await stage.getAttribute("data-frames")))
    .toBeGreaterThan(idleEnd.records.at(-1)!.frames);
  const core = await page.locator(".hero .core").boundingBox();
  await page.mouse.move(
    core!.x + core!.width * 0.35,
    core!.y + core!.height * 0.5,
  );
  await page.mouse.down();
  await page.mouse.move(
    core!.x + core!.width * 0.7,
    core!.y + core!.height * 0.5,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect(page.locator(".core[data-dragging]")).toHaveCount(0);
  for (const selector of [
    "#work",
    "#services",
    ".fabric-section",
    "#process",
  ]) {
    const section = page.locator(selector).first();
    if (await section.count()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(750);
    }
  }
  const traversed = await snapshot(page);
  expect(traversed.canvases).toBe(1);
  expect(traversed.records.filter((r) => r.active)).toHaveLength(1);
  expect(traversed.records.every((r) => r.owner === "v2")).toBe(true);
  await page.locator(".hero-actions a").first().click();
  await expect(page).toHaveURL(/\/start-project$/);
  await expect(page.locator(".booking-page")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect((await snapshot(page)).records.every((r) => !r.active)).toBe(true);
  await page.goto("/?experience=v2&diagnostics=1");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".hero-scene").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${output}/v2-mobile.png` });
  const mobileStart = await snapshot(page);
  await page.waitForTimeout(1500);
  const mobileEnd = await snapshot(page);
  expect(mobileEnd.records.at(-1)!.frames).toBe(
    mobileStart.records.at(-1)!.frames,
  );
  await writeFile(
    `${output}/v2-runtime.json`,
    JSON.stringify(
      {
        method:
          "Local Chromium dev build; same 1440x1000/390x844 pointer workload and 1.5s idle windows as V1",
        idleStart,
        idleEnd,
        traversed,
        mobileStart,
        mobileEnd,
      },
      null,
      2,
    ),
  );
  expect(errors).toEqual([]);
});

for (const [width, height] of [
  [1920, 1080],
  [1440, 1000],
  [1280, 720],
  [1024, 768],
  [768, 1024],
  [430, 932],
  [390, 844],
  [360, 800],
  [320, 568],
]) {
  test(`V2 responsive W ${width}x${height}`, async ({ page }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("webora-intro-v2", "seen"),
    );
    await page.setViewportSize({ width, height });
    await page.goto("/?experience=v2&diagnostics=1");
    await page.locator(".hero-scene").scrollIntoViewIfNeeded();
    await expect(page.locator(".hero .core-ready")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.waitForTimeout(800);
    const scene = await page.locator(".experience-stage").boundingBox();
    expect(scene!.width).toBeGreaterThan(200);
    expect(scene!.height).toBeGreaterThan(150);
    expect((await snapshot(page)).overflow).toBeLessThanOrEqual(0);
    await page.screenshot({ path: `${output}/v2-${width}x${height}.png` });
    const cta = page.locator(".hero-actions a").first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
    if (width === 390)
      await page.screenshot({ path: `${output}/v2-mobile-top.png` });
  });
}

test("V2 context loss, real restoration and repeated-loss fallback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  const lose = async () =>
    page.evaluate(() => {
      const canvas = document.querySelector(
        ".experience-stage canvas",
      ) as HTMLCanvasElement;
      const gl = canvas.getContext("webgl2")!;
      const extension = gl.getExtension("WEBGL_lose_context")!;
      extension.loseContext();
      setTimeout(() => extension.restoreContext(), 300);
    });
  await lose();
  await expect
    .poll(async () =>
      (await snapshot(page)).records.at(-1)?.events.includes("context-lost"),
    )
    .toBe(true);
  await expect
    .poll(async () =>
      (await snapshot(page)).records
        .at(-1)
        ?.events.includes("context-restored"),
    )
    .toBe(true);
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  await lose();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".core-fallback svg")).toBeVisible();
  await writeFile(
    `${output}/context-lifecycle.json`,
    JSON.stringify(await snapshot(page), null, 2),
  );
});

test("V2 reduced motion toggling retains HTML and disposes the renderer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".core-fallback svg")).toBeVisible();
  await page.screenshot({ path: `${output}/v2-reduced.png` });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  expect((await snapshot(page)).records.every((r) => !r.active)).toBe(true);
});

test("V2 unavailable WebGL preserves SVG, CTA and booking", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 6000,
  });
  await expect(page.locator(".core-fallback svg")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.screenshot({ path: `${output}/v2-no-webgl.png` });
  await page.locator(".hero-actions a").first().click();
  await expect(page.locator(".booking-page")).toBeVisible();
});

test("V2 shader compilation failure cleans up and keeps HTML", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.shaderSource;
    WebGL2RenderingContext.prototype.shaderSource = function (shader, source) {
      original.call(
        this,
        shader,
        source + "\ninvalid_shader_source_for_failure_test",
      );
    };
  });
  await page.goto("/?experience=v2&diagnostics=1");
  await expect
    .poll(async () =>
      (await snapshot(page)).records.some((r) =>
        r.events.some((e) => e.includes("shader compilation failed")),
      ),
    )
    .toBe(true);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
});

test("V2 rejected lazy import and route navigation during initialization remain usable", async ({
  page,
}) => {
  let release!: () => void;
  const delayed = new Promise<void>((done) => {
    release = done;
  });
  await page.route("**/src/three/runtime/WorldRuntime.ts*", async (route) => {
    await delayed;
    await route.abort();
  });
  await page.goto("/?experience=v2&diagnostics=1");
  await page.locator(".hero-actions a").first().click();
  await expect(page.locator(".booking-page")).toBeVisible();
  release();
  await page.waitForTimeout(500);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 6000,
  });
  await expect(page.locator(".core-fallback svg")).toBeVisible();
});

test("V2 twenty route cycles release contexts and stabilize resource counts", async ({
  page,
}) => {
  test.setTimeout(300000);
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.goto("/?experience=v2&diagnostics=1");
  const counts: number[] = [];
  for (let i = 0; i < 20; i++) {
    await expect(page.locator(".hero .core-ready")).toBeVisible();
    const state = await snapshot(page);
    expect(state.canvases).toBe(1);
    expect(state.records.filter((r) => r.active)).toHaveLength(1);
    counts.push(state.records.at(-1)!.geometries);
    await page.locator(".hero-actions a").first().click();
    await expect(page.locator(".booking-page")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    expect((await snapshot(page)).records.every((r) => !r.active)).toBe(true);
    await page.goBack();
  }
  expect(new Set(counts).size).toBe(1);
  await writeFile(
    `${output}/route-cycles.json`,
    JSON.stringify({ counts, snapshot: await snapshot(page) }, null, 2),
  );
});

test("V2 offscreen suspension and keyboard navigation", async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  await page
    .getByRole("link", { name: "Step into the studio", exact: true })
    .click();
  await expect(page).toHaveURL(/#work$/);
  await page.waitForTimeout(500); // Complete the existing 350ms anchor correction.
  // Services and Process now share the renderer; use an editorial interval
  // to verify offscreen suspension rather than assuming Process is static.
  await page
    .locator(".principles-section")
    .evaluate(async (el) => {
      const path = "/src/lib/scroll.ts";
      const { scrollToPosition } = await import(path);
      scrollToPosition(el.getBoundingClientRect().top + scrollY + 150, true);
    });
  await page.waitForTimeout(1000);
  const first = await snapshot(page);
  await page.waitForTimeout(500);
  const second = await snapshot(page);
  expect(second.records.at(-1)!.visible).toBe(false);
  expect(second.records.at(-1)!.frames).toBe(first.records.at(-1)!.frames);
  await page.locator(".hero-actions a").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".booking-page")).toBeVisible();
});

test("V2 production-build local preview hydrates and keeps diagnostics absent", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:4175/?experience=v2&diagnostics=1");
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  expect(await page.evaluate(() => window.__WEBORA_RUNTIME__)).toBeUndefined();
  await expect(page.locator(".hero [data-frames]")).toHaveCount(0);
  await expect(page.locator(".hero [data-quality]")).toHaveCount(0);
  await expect(page.locator(".hero [data-dpr]")).toHaveCount(0);
  await page.locator(".hero-actions a").first().click();
  await expect(page.locator(".booking-page")).toBeVisible();
  await page.reload();
  await expect(page.locator(".booking-page")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("local comparison switch reloads V1 and V2 without mixed ownership", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  await page.getByRole("link", { name: "Switch to V1" }).click();
  await expect(
    page.getByText("LOCAL / V1 comparison", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  expect((await snapshot(page)).records.every((r) => r.owner === "v1")).toBe(
    true,
  );
  await page.getByRole("link", { name: "Switch to V2" }).click();
  await expect(
    page.getByText("LOCAL / V2 · Living studio", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".hero .core-ready")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  expect((await snapshot(page)).records.every((r) => r.owner === "v2")).toBe(
    true,
  );
});

test("direct quiet routes and refreshed privacy never initialize WebGL", async ({
  page,
}) => {
  for (const path of ["/privacy", "/start-project"]) {
    await page.goto(`${path}?experience=v2&diagnostics=1`);
    await expect(page.locator("main h1")).toBeVisible();
    await page.reload();
    await expect(page.locator("main h1")).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.locator("canvas")).toHaveCount(0);
    expect((await snapshot(page)).records).toHaveLength(0);
  }
});

test("V2 six-step enquiry reaches review without any provider submission", async ({
  page,
}) => {
  let attempts = 0;
  page.on("request", (request) => {
    if (request.url().includes("formspree.io")) attempts++;
  });
  await page.goto("/start-project?experience=v2");
  await page.getByLabel("Full name", { exact: true }).fill("Alex Example");
  await page
    .getByLabel("Business / brand", { exact: true })
    .fill("Example Studio");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("alex@example.com");
  await page
    .getByLabel("Phone / WhatsApp", { exact: true })
    .fill("+919999999999");
  const next = () =>
    page.getByRole("button", { name: "Continue", exact: true }).click();
  await next();
  await page
    .getByLabel("Business category", { exact: true })
    .selectOption("Professional services");
  await page
    .getByLabel("What does your business do?", { exact: true })
    .fill("A design studio serving local businesses.");
  await next();
  await page
    .getByRole("radio", { name: "Business website", exact: true })
    .check();
  await page.getByRole("radio", { name: "2–5", exact: true }).check();
  await next();
  await page
    .getByRole("checkbox", { name: "Enquiry forms", exact: true })
    .check();
  await page.getByRole("checkbox", { name: "WhatsApp", exact: true }).check();
  await next();
  await page
    .getByRole("radio", { name: "Recommend a budget", exact: true })
    .check();
  await page.getByRole("radio", { name: "1–2 months", exact: true }).check();
  await next();
  await expect(
    page.getByRole("button", { name: "Send Project Enquiry", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Alex Example · Example Studio", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(attempts).toBe(0);
  await page.screenshot({ path: `${output}/v2-enquiry-review.png` });
});

test.describe("mobile DPR 3 emulation", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  test("bounded pixels and touch controls", async ({ page }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("webora-intro-v2", "seen"),
    );
    await page.goto("/?experience=v2&diagnostics=1");
    await page.locator(".hero-scene").scrollIntoViewIfNeeded();
    await expect(page.locator(".hero .core-ready")).toBeVisible();
    const stage = page.locator(".experience-stage");
    const before = Number(await stage.getAttribute("data-frames"));
    const dimensions = await stage
      .locator("canvas")
      .evaluate((canvas) => ({ width: canvas.width, height: canvas.height }));
    expect(dimensions.width * dimensions.height).toBeLessThanOrEqual(700000);
    await page.getByRole("button", { name: "Rotate sculpture right" }).tap();
    await expect
      .poll(async () => Number(await stage.getAttribute("data-frames")))
      .toBeGreaterThan(before);
    await page.screenshot({ path: `${output}/v2-mobile-dpr3.png` });
  });
});

test("V2 fresh intro can be skipped while runtime preparation continues", async ({
  page,
  context,
}) => {
  await context.route(
    "**/src/three/runtime/WorldRuntime.ts*",
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.continue();
    },
  );
  await page.goto("/?experience=v2&intro=1&diagnostics=1", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByTestId("webora-intro")).toBeVisible();
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await expect(page.locator(".hero .core-ready")).toBeVisible({
    timeout: 60000,
  });
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".hero-actions a").first()).toBeVisible();
});
