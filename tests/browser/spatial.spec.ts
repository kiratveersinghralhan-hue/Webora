import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await context.route("https://formspree.io/**", (route) =>
    route.abort("blockedbyclient"),
  );
});

test("spatial project sequence advances, supports direct selection and keeps truthful CTAs", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/work");
  await expect(page.locator(".work-theatre")).toHaveClass(/work-enhanced/);
  await page.locator(".work-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-work")).toHaveClass(/spatial-ready/);
  await page.getByRole("button", { name: "Show VEYRATH" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText("VEYRATH");
  await expect(
    page
      .locator(".project.is-active")
      .getByRole("link", { name: "Visit Website" }),
  ).toHaveCount(0);
  await page.screenshot({ path: "qa/work-veyrath-desktop.png" });
  await page.getByRole("button", { name: "Show Gloss Boss" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText("Gloss Boss");
  await expect(
    page
      .locator(".project.is-active")
      .getByRole("link", { name: "Visit Website" }),
  ).toHaveAttribute("rel", "noopener noreferrer");
  await page.screenshot({ path: "qa/work-glossboss-desktop.png" });
  await page.getByRole("button", { name: "Show Article Project" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText(
    "Article Project",
  );
  await expect(page.locator(".project.is-active a")).toHaveCount(0);
  await page.getByRole("button", { name: "Show Harvester Parts" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText(
    "Harvester Parts",
  );
  await page.screenshot({ path: "qa/work-harvester-desktop.png" });
  await page
    .getByRole("link", { name: "Explore Harvester Parts, LIVE" })
    .click();
  await expect(page.locator("h1")).toContainText("Harvester Parts");
  await expect(page.locator(".case-hero img")).toHaveAttribute(
    "src",
    "/projects/screen-harvesterparts.webp",
  );
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("shared cursor, service composition, process path and fabric render without errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".core")).toHaveClass(/core-ready/);
  await page.mouse.move(1080, 400);
  await expect(page.locator(".cursor")).toHaveText("EXPLORE");
  await expect(page.locator(".cursor")).toHaveCSS("opacity", "1");
  const first = await page
    .locator(".core [data-frames]")
    .getAttribute("data-frames");
  await page.mouse.move(1250, 520);
  await expect
    .poll(() =>
      page
        .locator(".core [data-frames]")
        .getAttribute("data-frames")
        .then(Number),
    )
    .toBeGreaterThan(Number(first));
  await page.getByRole("button", { name: /03 E-commerce/ }).click();
  await expect(page.locator(".spatial-services")).toHaveClass(/spatial-ready/);
  await expect(
    page.locator(".spatial-services .spatial-canvas"),
  ).toHaveAttribute("data-active", "2");
  await page.screenshot({ path: "qa/services-desktop.png" });
  await page.locator(".value-heading").scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-fabric")).toHaveClass(/spatial-ready/);
  await page.getByRole("tab", { name: /Discover/ }).focus();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: /Launch/ })).toBeFocused();
  await expect(page.locator(".spatial-process")).toHaveClass(/spatial-ready/);
  await expect(page.locator(".spatial-process .spatial-fallback")).toHaveCSS(
    "opacity",
    "0",
  );
  await expect(
    page.locator(".spatial-process .spatial-canvas"),
  ).toHaveAttribute("data-active", "5");
  await page.screenshot({ path: "qa/process-desktop.png" });
  expect(errors).toEqual([]);
});

test("mobile retains lightweight WebGL and native work exploration", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await context.route("https://formspree.io/**", (route) => route.abort());
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.goto("/");
  await expect(page.locator(".core")).toHaveClass(/core-ready/);
  expect(
    Number(await page.locator(".core [data-dpr]").getAttribute("data-dpr")),
  ).toBeLessThanOrEqual(1.15);
  await expect(page.locator(".cursor")).toBeHidden();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.screenshot({ path: "qa/hero-mobile-spatial.png" });
  await page.locator(".work-stage").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Show Gloss Boss" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText("Gloss Boss");
  await expect(page.locator(".spatial-work")).toHaveClass(/spatial-ready/);
  const visual = page.locator(".project").filter({
    has: page.getByRole("heading", { name: "Gloss Boss", exact: true }),
  });
  const preview = visual.locator("img");
  await expect(preview).toBeVisible();
  await expect
    .poll(() =>
      preview.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  const previewBounds = await preview.boundingBox();
  const copyBounds = await visual.locator(".project-description").boundingBox();
  expect(previewBounds!.height).toBeLessThan(260);
  expect(copyBounds!.width).toBeGreaterThan(280);
  await expect(
    page
      .locator(".project")
      .filter({
        has: page.getByRole("heading", { name: "Gloss Boss", exact: true }),
      })
      .getByRole("link", { name: "Visit Website" }),
  ).toBeVisible();
  await page.screenshot({ path: "qa/work-mobile-spatial.png" });
  await page.getByRole("button", { name: /03 E-commerce/ }).click();
  await expect(page.locator(".spatial-services")).toHaveClass(/spatial-ready/);
  expect(
    Number(
      await page
        .locator(".spatial-services [data-dpr]")
        .getAttribute("data-dpr"),
    ),
  ).toBeLessThanOrEqual(1.15);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await context.close();
});

test("context loss restores the designed fallback and routes dispose scenes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".core")).toHaveClass(/core-ready/);
  await page
    .locator(".core canvas")
    .evaluate((canvas: HTMLCanvasElement) =>
      canvas
        .getContext("webgl2")!
        .getExtension("WEBGL_lose_context")!
        .loseContext(),
    );
  await expect(page.locator(".core")).not.toHaveClass(/core-ready/);
  await expect(page.locator(".core-fallback")).toHaveCSS("opacity", "1");
  await page
    .locator(".hero-actions")
    .getByRole("link", { name: "Start a Project" })
    .click();
  await expect(page.getByLabel("Full name", { exact: true })).toBeVisible();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(
    page.locator(
      ".spatial-work canvas,.spatial-process canvas,.spatial-services canvas",
    ),
  ).toHaveCount(0);
});

test("reduced motion keeps real work accessible and avoids WebGL downloads", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work");
  await expect(page.locator(".project")).toHaveCount(4);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  expect(
    requests.some((url) => /three-(renderer|foundation)|\/engine-/.test(url)),
  ).toBe(false);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  await page
    .getByRole("link", { name: "Explore VEYRATH, IN PROGRESS" })
    .click();
  await expect(page.locator(".case-title")).toContainText("IN PROGRESS");
  await expect(page.getByRole("link", { name: "Visit Website" })).toHaveCount(
    0,
  );
  await expect(
    page
      .getByText(/Live checkout, payments and fulfilment are not claimed/)
      .first(),
  ).toBeVisible();
});

test("spatial renderer rests while idle and wakes for interaction and visibility", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: /03 E-commerce/ }).click();
  await expect(page.locator(".spatial-services")).toHaveClass(/spatial-ready/);
  const scene = page.locator(".spatial-services [data-frames]");
  await page.waitForTimeout(1600);
  const idle = await scene.getAttribute("data-frames");
  await page.waitForTimeout(250);
  expect(await scene.getAttribute("data-frames")).toBe(idle);
  await page.getByRole("button", { name: /06 Custom interactive/ }).click();
  await expect
    .poll(() => scene.getAttribute("data-frames").then(Number))
    .toBeGreaterThan(Number(idle));
  // Exercise visibility handlers without changing the user's desktop settings.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hidden = await scene.getAttribute("data-frames");
  await page.waitForTimeout(250);
  expect(await scene.getAttribute("data-frames")).toBe(hidden);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => scene.getAttribute("data-frames").then(Number))
    .toBeGreaterThan(Number(hidden));
});
