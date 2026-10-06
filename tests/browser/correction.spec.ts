import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test.beforeEach(async ({ context, page }) => {
  await context.route("https://formspree.io/**", (route) =>
    route.abort("blockedbyclient"),
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

test("local replay overrides a seen session and explicitly enables the full experience", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?intro=1");
  const intro = page.getByTestId("webora-intro");
  await expect(intro).toBeVisible();
  await expect(page.locator(".core canvas")).toBeVisible();
  const bounds = await intro.boundingBox();
  expect(bounds!.x).toBe(0);
  expect(bounds!.width).toBeGreaterThan(1400);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-runtime",
    "lenis",
  );
  await page.waitForTimeout(650);
  await page.screenshot({ path: "qa/correction-intro.png" });
  await expect(intro).toHaveCount(0, { timeout: 3200 });
  await page.reload();
  await expect(intro).toBeVisible();
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(intro).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(intro).toBeVisible();
  await expect(page.locator(".core canvas")).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "qa/correction-intro-mobile.png" });
  await expect(intro).toHaveCount(0, { timeout: 3200 });
});

test("reduced motion remains accessible and visitors can explicitly enable 3D", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Enable 3D experience" }).click();
  await expect(page.locator(".core canvas")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await expect(
    page.getByRole("button", { name: "Enable 3D experience" }),
  ).toHaveCount(0);
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 3500,
  });
  await page.reload();
  await expect(page.locator(".core canvas")).toBeVisible();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
});

test("one Lenis instance survives hashes and routes and scrolls with measurable inertia", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-instances",
    "1",
  );
  const generation = await page
    .locator("html")
    .getAttribute("data-scroll-generation");
  await page.waitForTimeout(900);
  await page.mouse.move(300, 400);
  const initial = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 650);
  await page.waitForTimeout(75);
  const early = (await page.evaluate(() => scrollY)) - initial;
  await page.waitForTimeout(900);
  const settled = (await page.evaluate(() => scrollY)) - initial;
  expect(early).toBeGreaterThan(0);
  expect(early).toBeLessThan(600);
  expect(settled).toBeGreaterThan(early + 20);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services" })
    .click();
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-generation",
    generation!,
  );
  await page.getByRole("link", { name: "Webora home" }).click();
  await page.getByRole("link", { name: "SCROLL TO DISCOVER" }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-generation",
    generation!,
  );
  await writeFile(
    "qa/correction-scroll.json",
    JSON.stringify(
      { earlyDelta: early, settledDelta: settled, generation },
      null,
      2,
    ),
  );
});

test("hero depth timeline changes the WebGL camera and process hash lands on the actual structure", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".core-ready")).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "qa/correction-hero.png" });
  await page.mouse.wheel(0, 480);
  await expect
    .poll(() =>
      page
        .locator(".spatial-hero .spatial-canvas")
        .getAttribute("data-camera-depth")
        .then(Number),
    )
    .toBeGreaterThan(0.3);
  await page.screenshot({ path: "qa/correction-hero-exit.png" });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Process" })
    .click();
  await expect
    .poll(
      () =>
        page
          .locator("#process")
          .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
      { timeout: 6000 },
    )
    .toBeLessThan(160);
  await expect(page.locator(".spatial-process canvas")).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "qa/correction-process.png" });
  const scene = page.locator(".spatial-process .spatial-canvas");
  await page.getByRole("tab", { name: "06 Launch" }).click();
  await expect
    .poll(() => scene.getAttribute("data-camera-position").then(Number))
    .toBeGreaterThan(4.8);
});

test("requested viewport matrix keeps 3D screens, service models and form content usable", async ({
  page,
}) => {
  test.setTimeout(150000);
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  const sizes = [
    [1920, 1080],
    [1440, 900],
    [1366, 768],
    [1024, 1366],
    [768, 1024],
    [430, 932],
    [390, 844],
    [360, 800],
    [844, 390],
  ];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.goto("/work");
    await expect(page.locator(".work-theatre")).toHaveClass(/work-enhanced/);
    await page.locator(".work-stage").scrollIntoViewIfNeeded();
    await expect(page.locator(".spatial-work canvas")).toBeVisible();
    await page.getByRole("button", { name: "Show VEYRATH" }).click();
    await expect(page.locator(".project.is-active h3")).toHaveText("VEYRATH");
    await expect(
      page.locator(".project.is-active .project-visual-link"),
    ).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.waitForTimeout(750);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `qa/correction-gallery-${width}x${height}.png`,
    });
    await page.goto("/services");
    await page
      .locator(
        width < 900 ? ".services-spatial-mobile" : ".services-spatial-primary",
      )
      .scrollIntoViewIfNeeded();
    await expect(page.locator(".spatial-services canvas")).toBeVisible();
    await page.getByRole("button", { name: "03 E-commerce" }).click();
    await expect(page.locator("#service-2")).toBeVisible();
    await page.waitForTimeout(500);
    if (width < 900 && height >= 600) {
      const model = await page
        .locator(".services-spatial-mobile")
        .boundingBox();
      const header = await page.locator(".site-header").boundingBox();
      expect(model!.y).toBeGreaterThanOrEqual(header!.height - 1);
      expect(model!.y + model!.height).toBeLessThan(height - 50);
    }
    await page.screenshot({
      path: `qa/correction-services-${width}x${height}.png`,
    });
    await page.goto("/start-project");
    await expect(page.locator("form")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
});
