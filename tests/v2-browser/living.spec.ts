import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const output = "test-results/living-m1";
test.beforeEach(async ({ context, page }) => {
  await mkdir(output, { recursive: true });
  await context.route("https://formspree.io/**", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
});

test("living studio: real geometry, full turn, keyboard reset and legible conversion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.locator(".core-ready")).toBeVisible();
  const identity = () =>
    page.evaluate(() => window.__WEBORA_RUNTIME__!.records.at(-1)!.identity!);
  const initial = await identity();
  expect(initial.studio).toBe(1);
  expect(initial.materials).toBe(5);
  await expect(
    page.getByRole("heading", { name: /Distinct\.\s*By design\./ }),
  ).toBeVisible();
  const cta = page.locator(".hero-actions .button");
  const box = (await cta.boundingBox())!;
  expect(box.y + box.height).toBeLessThan(1000);
  expect(
    await cta.evaluate((a) => {
      const r = a.getBoundingClientRect();
      return a.contains(
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
      );
    }),
  ).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${output}/desktop.png` });
  const scene = (await page.locator(".identity-core").boundingBox())!;
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(
      scene.x + scene.width * 0.25,
      scene.y + scene.height * 0.55,
    );
    await page.mouse.down();
    await page.mouse.move(
      scene.x + scene.width * 0.75,
      scene.y + scene.height * 0.55,
      { steps: 8 },
    );
    await page.mouse.up();
  }
  expect((await identity()).yaw).toBeGreaterThan(2 * Math.PI);
  expect((await identity()).geometryId).toBe(initial.geometryId);
  await page.getByRole("button", { name: "Reset sculpture" }).focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => Number((await identity()).yaw)).toBe(0);
  await expect(page.locator("canvas")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Step into the studio", exact: true })
    .click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work h2")).toBeInViewport();
  await expect
    .poll(() =>
      page
        .locator("#work")
        .evaluate(
          (section) =>
            Math.abs(
              section.getBoundingClientRect().top -
                document.querySelector(".site-header")!.getBoundingClientRect()
                  .height -
                24,
            ) < 2,
        ),
    )
    .toBe(true);
  await page.screenshot({ path: `${output}/work-entry.png` });
  await page.mouse.wheel(0, -500);
  await expect(page.locator(".living-manifesto")).toBeInViewport({ ratio: 1 });
  await page.waitForTimeout(1200);
  await page
    .locator(".living-manifesto")
    .screenshot({ path: `${output}/manifesto.png` });
  await cta.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".booking-page")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

for (const [width, height] of [
  [2560, 1080],
  [844, 390],
]) {
  test(`living studio: ${width}x${height} composition`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?experience=v2&diagnostics=1");
    await page.locator(".hero-scene").scrollIntoViewIfNeeded();
    await expect(page.locator(".core-ready")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
    await page
      .locator(".hero")
      .screenshot({ path: `${output}/hero-${width}x${height}.png` });
    const heading = await page.locator("h1").boundingBox();
    expect(heading!.x).toBeGreaterThanOrEqual(0);
    expect(heading!.x + heading!.width).toBeLessThanOrEqual(width);
    await page.locator(".hero-actions .button").click();
    await expect(page.locator(".booking-page")).toBeVisible();
  });
}

test("living studio: balanced alloy and architecture compile together and stop idle draws", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "deviceMemory", { get: () => 4 });
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 });
    const parameter = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function (p) {
      return p === 0x9246
        ? "Emulated capability hints"
        : parameter.call(this, p);
    };
  });
  await page.goto("/?experience=v2&diagnostics=1");
  await expect(page.locator(".core-ready")).toBeVisible();
  await page.mouse.move(600, 600);
  await page.mouse.move(900, 500, { steps: 12 });
  await page.waitForTimeout(3000);
  const snapshot = () =>
    page.evaluate(() =>
      structuredClone(window.__WEBORA_RUNTIME__!.records.at(-1)!),
    );
  const start = await snapshot();
  await page.waitForTimeout(1500);
  const end = await snapshot();
  expect(end.quality).toBe("balanced");
  expect(end.identity!.materials).toBe(5);
  expect(end.events).not.toContain("ordinary-alloy-fallback");
  expect(end.frames).toBe(start.frames);
  expect(end.calls).toBeLessThan(60);
  await page.screenshot({ path: `${output}/balanced-material.png` });
  await writeFile(
    `${output}/balanced-material.json`,
    JSON.stringify(
      { start, end, emulatedHints: true, actualBackend: "SwiftShader" },
      null,
      2,
    ),
  );
});

test("living studio: preserved project truth, service disclosures and process keys", async ({
  page,
}) => {
  await page.goto("/?experience=v2");
  await expect(page.locator("#work .project")).toHaveCount(4);
  const harvester = page.locator("#work .project").filter({
    has: page.getByRole("heading", { name: "Harvester Parts", exact: true }),
  });
  const gloss = page.locator("#work .project").filter({
    has: page.getByRole("heading", { name: "Gloss Boss", exact: true }),
  });
  await expect(harvester.locator(".concept-tag")).toHaveText("LIVE");
  await expect(
    harvester.getByRole("link", { name: "Visit Website" }),
  ).toHaveAttribute("href", "https://harvesterparts.in");
  await expect(
    gloss.getByRole("link", { name: "Visit Website" }),
  ).toHaveAttribute("href", "https://glossbossautomotive.online");
  for (const name of ["VEYRATH", "Article Project"]) {
    const article = page
      .locator("#work .project")
      .filter({ has: page.getByRole("heading", { name, exact: true }) });
    await expect(article.locator(".concept-tag")).toHaveText("IN PROGRESS");
    await expect(
      article.getByRole("link", { name: "Visit Website" }),
    ).toHaveCount(0);
  }
  const services = page.locator("#services .service-row > button");
  await expect(services).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    if ((await services.nth(i).getAttribute("aria-expanded")) !== "true")
      await services.nth(i).click();
    await expect(services.nth(i)).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(`#service-${i} p`)).toBeVisible();
  }
  await page
    .locator("#services")
    .screenshot({ path: `${output}/services.png` });
  await expect(page.locator("#process [role=tab]")).toHaveCount(6);
  await page.locator("#stage-0").focus();
  await page.keyboard.press("End");
  await expect(page.locator("#stage-5")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".process-copy")).toContainText("LAUNCH");
  await page.keyboard.press("Home");
  await expect(page.locator("#stage-0")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".process-copy")).toContainText("DISCOVER");
  await page.locator("#process").screenshot({ path: `${output}/process.png` });
});

test.describe("living touch", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });
  test("living studio: horizontal touch turns the W and vertical touch scrolls", async ({
    page,
    context,
  }) => {
    await page.goto("/?experience=v2&diagnostics=1");
    await page.locator(".hero-scene").scrollIntoViewIfNeeded();
    await expect(page.locator(".core-ready")).toBeVisible();
    const scene = (await page.locator(".identity-core").boundingBox())!;
    const client = await context.newCDPSession(page);
    const swipe = async (vertical: boolean) => {
      const x = scene.x + scene.width * 0.35,
        y = scene.y + scene.height * 0.65;
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let i = 1; i <= 12; i++) {
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [
            { x: x + (vertical ? 0 : i * 12), y: y - (vertical ? i * 12 : 0) },
          ],
        });
        await page.waitForTimeout(20);
      }
      await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    };
    const identity = () =>
      page.evaluate(() => window.__WEBORA_RUNTIME__!.records.at(-1)!.identity!);
    const before = await identity();
    await swipe(false);
    expect(Number((await identity()).yaw) - Number(before.yaw)).toBeGreaterThan(
      0.2,
    );
    await expect(page.locator(".identity-core[data-dragging]")).toHaveCount(0);
    const scroll = await page.evaluate(() => scrollY);
    await swipe(true);
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(scroll + 30);
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.screenshot({ path: `${output}/mobile-touch.png` });
    await writeFile(
      `${output}/touch.json`,
      JSON.stringify(
        {
          before,
          after: await identity(),
          scrollBefore: scroll,
          scrollAfter: await page.evaluate(() => scrollY),
          emulatedDevice: true,
        },
        null,
        2,
      ),
    );
    await client.detach();
  });
});
