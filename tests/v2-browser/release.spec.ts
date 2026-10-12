import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
const output = "test-results/release";
test.beforeEach(async ({ context }) => {
  await mkdir(output, { recursive: true });
  await context.route("https://formspree.io/**", (route) => route.abort());
  await context.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
});
async function record(page: Page) {
  return page.evaluate(() => window.__WEBORA_RUNTIME__!.records.at(-1)!);
}
async function show(page: Page, kind: string) {
  await page
    .locator(`[data-installation-kind=${kind}]`)
    .first()
    .evaluate((element) =>
      scrollTo({
        top: element.getBoundingClientRect().top + scrollY - 120,
        behavior: "instant",
      }),
    );
  await expect(
    page.locator(`[data-installation-kind=${kind}][data-ready=true]`).first(),
  ).toBeVisible({ timeout: 60000 });
}
async function selected(page: Page, index: number) {
  await expect
    .poll(async () => Number((await record(page)).identity?.position), {
      timeout: 30000,
    })
    .toBe(index);
}
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
  test(`release responsive complete chapters ${width}x${height}`, async ({
    page,
  }) => {
    test.setTimeout(300000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.goto("/?experience=v2&diagnostics=1");
    await expect(page.locator(".living-hero")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/responsive-hero-${width}.png` });
    const samples = [];
    for (const kind of ["gallery", "services", "process"]) {
      await show(page, kind);
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `${output}/responsive-${kind}-${width}.png`,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBe(0);
      expect(await page.locator("canvas").count()).toBe(1);
      samples.push({ kind, record: await record(page) });
    }
    expect(errors).toEqual([]);
    await writeFile(
      `${output}/responsive-${width}.json`,
      JSON.stringify(samples, null, 2),
    );
  });
}
test("release gallery controls, inertial drag, keyboard, project truth and same canvas", async ({
  page,
}) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?experience=v2&diagnostics=1#work");
  await show(page, "gallery");
  const canvas = await page.locator("canvas").elementHandle();
  for (let i = 0; i < 4; i++) {
    await page
      .locator(".spatial-gallery-controls button")
      .nth(i + 1)
      .click();
    await show(page, "gallery");
    await selected(page, i);
    await page.screenshot({ path: `${output}/gallery-selection-${i}.png` });
  }
  await expect(page.locator(".spatial-gallery-meta")).toContainText(
    "Article Project",
  );
  await expect(page.locator(".spatial-gallery-meta a")).toHaveCount(0);
  await page.locator(".spatial-gallery-surface").focus();
  await page.keyboard.press("Home");
  await selected(page, 0);
  await page.keyboard.press("ArrowRight");
  await selected(page, 1);
  await expect(
    page.locator('.spatial-gallery-meta a[href="/work/veyrath"]'),
  ).toBeVisible();
  await expect(
    page.locator('.spatial-gallery-meta a[target="_blank"]'),
  ).toHaveCount(0);
  await page.keyboard.press("Home");
  await selected(page, 0);
  const rect = (await page.locator(".spatial-gallery-surface").boundingBox())!;
  await page.mouse.move(rect.x + rect.width * 0.7, rect.y + rect.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width * 0.25,
    rect.y + rect.height * 0.5,
    { steps: 15 },
  );
  await page.mouse.up();
  await expect
    .poll(async () => Number((await record(page)).identity?.position))
    .toBeGreaterThan(0);
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("[data-dragging]")).toHaveCount(0);
  for (const chapter of ["services", "process", "gallery"])
    await show(page, chapter);
  expect(
    await canvas!.evaluate((node) => node === document.querySelector("canvas")),
  ).toBe(true);
  await page.locator(".spatial-gallery-controls button").nth(1).click();
  await selected(page, 0);
  await page.mouse.move(1, 1);
  await expect
    .poll(
      async () => {
        const frames = (await record(page)).frames;
        await page.waitForTimeout(700);
        return (await record(page)).frames - frames;
      },
      { timeout: 30000 },
    )
    .toBe(0);
  const before = await record(page);
  await page.waitForTimeout(1500);
  expect((await record(page)).frames).toBe(before.frames);
  await writeFile(
    `${output}/gallery-resources.json`,
    JSON.stringify(before, null, 2),
  );
  await page
    .locator('.spatial-gallery-meta a[href="/work/harvester-parts"]')
    .click();
  await expect(page).toHaveURL(/\/work\/harvester-parts$/);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("h1")).toContainText("Harvester");
});
for (const mode of ["reduced", "no-webgl", "texture-failure"])
  test(`release accessible gallery fallback ${mode}`, async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (mode === "reduced")
      await page.emulateMedia({ reducedMotion: "reduce" });
    if (mode === "no-webgl")
      await page.addInitScript(() => {
        const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          type: string,
          ...args: unknown[]
        ) {
          if (type.includes("webgl")) return null;
          return get.apply(this, [type, ...args] as Parameters<typeof get>);
        } as typeof get;
      });
    if (mode === "texture-failure")
      await context.route("**/projects/*.webp", (route) => route.abort());
    await page.goto("/work?experience=v2&diagnostics=1");
    await page.locator(".spatial-gallery-controls").scrollIntoViewIfNeeded();
    for (let i = 0; i < 4; i++) {
      await page
        .locator(".spatial-gallery-controls button")
        .nth(i + 1)
        .click();
      await expect(
        page.locator(".spatial-gallery-title .gallery-project-name"),
      ).toHaveText(
        ["Harvester Parts", "VEYRATH", "Gloss Boss", "Article Project"][i],
      );
    }
    await page.locator(".spatial-gallery-surface").focus();
    await page.keyboard.press("Home");
    await expect(
      page.locator(".spatial-gallery-title .gallery-project-name"),
    ).toHaveText("Harvester Parts");
    await expect(page.locator(".spatial-gallery-fallback")).toBeVisible();
    if (mode !== "texture-failure")
      await expect(page.locator("canvas")).toHaveCount(0);
    const axe = await new AxeBuilder({ page })
      .include(".spatial-portfolio")
      .analyze();
    expect(axe.violations).toEqual([]);
    await page.screenshot({ path: `${output}/gallery-fallback-${mode}.png` });
  });
test("release touch gallery swipes and native vertical scrolling", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });
  await context.route("https://formspree.io/**", (route) => route.abort());
  await context.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  const page = await context.newPage();
  await page.goto("/?experience=v2&diagnostics=1#work");
  await show(page, "gallery");
  const cdp = await context.newCDPSession(page),
    rect = (await page.locator(".spatial-gallery-surface").boundingBox())!;
  const y = rect.y + rect.height * 0.5;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 320, y }],
  });
  for (let i = 1; i <= 12; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 320 - i * 19, y }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () => Number((await record(page)).identity?.position))
    .toBeGreaterThan(0);
  const before = await page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 180, y }],
  });
  for (let i = 1; i <= 12; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 180, y: y - i * 18 }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(before + 60);
  await context.close();
});
test("release ten complete world cycles release gallery textures and listeners", async ({
  page,
}) => {
  test.setTimeout(360000);
  const counts: number[] = [];
  for (let cycle = 0; cycle < 10; cycle++) {
    await page.goto("/?experience=v2&diagnostics=1#work");
    for (const kind of ["gallery", "services", "process"])
      await show(page, kind);
    counts.push((await record(page)).geometries);
    await page.locator(".site-header a[href='/start-project']").click();
    await expect(page.locator(".booking-page")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          window.__WEBORA_RUNTIME__?.records.filter((record) => record.active)
            .length ?? 0,
      ),
    ).toBe(0);
  }
  expect(new Set(counts).size).toBe(1);
  await writeFile(
    `${output}/complete-world-cycles.json`,
    JSON.stringify(counts),
  );
});
test("release root production preview hydrates V2 and refreshes all business routes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "/",
    "/work/",
    "/services/",
    "/studio/",
    "/start-project/",
    "/privacy/",
    "/work/harvester-parts/",
    "/work/veyrath/",
    "/work/glossboss/",
  ]) {
    const response = await page.goto(`http://127.0.0.1:4175${route}`);
    expect(response!.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator(".living-layout")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
  }
  expect(errors).toEqual([]);
});
