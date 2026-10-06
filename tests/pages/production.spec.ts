import { test, expect, type Page } from "@playwright/test";

const site = process.env.WEBORA_TEST_URL || "http://127.0.0.1:4180/Webora/";
const url = (route = "") => `${site}${route}`;
const errors: string[] = [];
test.beforeEach(async ({ page, context }) => {
  errors.length = 0;
  await context.route("https://formspree.io/**", (route) =>
    route.abort("blockedbyclient"),
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});
test.afterEach(() => {
  const info = test.info();
  // This one test intentionally serves a 404 document to exercise Pages recovery.
  const unexpected = info.title.startsWith("Pages 404")
    ? errors.filter((error) => !/^Failed to load resource:.*404/.test(error))
    : errors;
  expect(unexpected).toEqual([]);
});

async function ready(page: Page) {
  await expect(page.locator(".site-header")).toBeVisible();
  await expect(page.locator(".route-loading")).toHaveCount(0);
}

test("production intro, 360 core, Lenis, cursor, Discover and session navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url());
  await expect(page.getByTestId("webora-intro")).toBeVisible();
  await expect(page.locator(".core canvas")).toBeVisible();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 5000,
  });
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-runtime",
    "lenis",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-instances",
    "1",
  );
  const core = page.locator(".core");
  const bounds = (await core.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.3,
    bounds.y + bounds.height * 0.5,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.75,
    bounds.y + bounds.height * 0.5,
    { steps: 15 },
  );
  await page.mouse.up();
  await expect(page.locator(".cursor")).toHaveCount(1);
  await page.mouse.move(300, 400);
  await expect(page.locator(".cursor")).toHaveCSS("opacity", "1");
  const start = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 500);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(start + 100);
  await page.getByRole("link", { name: /Scroll to discover/i }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect
    .poll(() =>
      page
        .locator("#work")
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(170);
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: /Work/ })
    .click();
  await expect(page).toHaveURL(/\/Webora\/work\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await page.goto(url());
  await expect(page.locator(".core canvas")).toBeVisible();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await page.screenshot({
    path: process.env.WEBORA_TEST_URL
      ? "qa/pages-live-home.png"
      : "qa/pages-local-home.png",
  });
});

test("all clean routes refresh, canonical metadata and public assets resolve", async ({
  page,
  request,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  const routes = [
    "work",
    "services",
    "studio",
    "start-project",
    "privacy",
    "work/harvester-parts",
    "work/veyrath",
    "work/glossboss",
    "work/form-and-field",
    "work/off-script",
  ];
  for (const route of routes) {
    const response = await page.goto(url(route));
    expect(response!.status()).toBe(200);
    await ready(page);
    await expect(page.locator("h1")).toBeVisible();
    await page.reload();
    await ready(page);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://kiratveersinghralhan-hue.github.io/Webora/${route}`,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const links = await page
      .locator('a[href^="/"]')
      .evaluateAll((elements) => elements.map((el) => el.getAttribute("href")));
    expect(links.every((href) => href!.startsWith("/Webora/"))).toBe(true);
  }
  for (const asset of [
    "favicon.svg",
    "og.png",
    "fonts/dm-sans-latin.woff2",
    "fonts/space-grotesk-latin.woff2",
    "projects/screen-harvesterparts.webp",
    "projects/screen-glossboss.webp",
    "projects/project-veyrath.webp",
    "sitemap.xml",
    "robots.txt",
  ]) {
    const response = await request.get(url(asset));
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).not.toContain("text/html");
  }
  const sitemap = await (await request.get(url("sitemap.xml"))).text();
  expect(sitemap).toContain(
    "https://kiratveersinghralhan-hue.github.io/Webora/work/veyrath",
  );
  expect(sitemap).not.toMatch(/localhost|127\.0\.0\.1/);
});

test("spatial gallery, screenshots, project links and service/process choreography", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(url("work"));
  await page.locator(".work-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-work canvas")).toBeVisible();
  await page.getByRole("button", { name: "Show VEYRATH" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText("VEYRATH");
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: process.env.WEBORA_TEST_URL
      ? "qa/pages-live-work.png"
      : "qa/pages-local-work.png",
  });
  await page.getByRole("button", { name: "Show Gloss Boss" }).click();
  await expect(
    page
      .locator(".project.is-active")
      .getByRole("link", { name: /Visit Website/ }),
  ).toHaveAttribute("href", "https://glossbossautomotive.online");
  await page
    .locator(".project.is-active")
    .getByRole("link", { name: "View Case Study" })
    .click();
  await expect(page).toHaveURL(/\/Webora\/work\/glossboss$/);
  await page.goto(url("services"));
  await page.getByRole("button", { name: /03 E-commerce/ }).click();
  await expect(page.locator(".spatial-services canvas")).toBeVisible();
  await page.goto(url("#process"));
  await expect(page.locator(".spatial-process canvas")).toBeVisible();
  await page.getByRole("tab", { name: /06 Launch/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText(/Launch/i);
});

test("mobile navigation, native vertical scroll, touch gallery and form fields", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  await context.route("https://formspree.io/**", (route) =>
    route.abort("blockedbyclient"),
  );
  await context.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url());
  await expect(page.locator(".core canvas")).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .locator(".mobile-menu")
    .getByRole("link", { name: /Work/ })
    .click();
  await page.locator(".work-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-work canvas")).toBeVisible();
  const bounds = (await page.locator(".work-stage").boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const x = bounds.x + bounds.width * 0.75,
    y = bounds.y + 120;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 12; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - i * 18, y }],
    });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator(".project.is-active h3")).not.toHaveText(
    "Harvester Parts",
  );
  const before = await page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 180, y: 550 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 180, y: 350 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  await cdp.detach();
  await page.goto(url("start-project"));
  await page.getByLabel("Full name", { exact: true }).fill("Preview only");
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Preview only",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".core canvas")).toBeVisible();
  await page.screenshot({
    path: process.env.WEBORA_TEST_URL
      ? "qa/pages-live-mobile-form.png"
      : "qa/pages-local-mobile-form.png",
  });
  await context.close();
});

test("Pages 404 redirect restores clean deep URL, query and hash without loops", async ({
  page,
  request,
}) => {
  // Fetch and serve the deployed 404 document at a real missing path; no server rewrite.
  const response = await request.get(url("404.html"));
  const html = await response.text();
  await page.route(
    "**/Webora/work/glossboss/missing?utm_source=pages-test",
    (route) =>
      route.fulfill({ status: 404, contentType: "text/html", body: html }),
  );
  await page.goto(url("work/glossboss/missing?utm_source=pages-test#main"));
  await expect(page).toHaveURL(
    /\/Webora\/work\/glossboss\/missing\?utm_source=pages-test#main$/,
  );
  await expect(page.locator("h1")).toContainText("is out of frame.");
  expect(
    await page.evaluate(() => document.documentElement.dataset.pagesRedirect),
  ).toBe("true");
  await page.route(
    "**/Webora/work/glossboss?utm_source=pages-fallback",
    (route) =>
      route.fulfill({ status: 404, contentType: "text/html", body: html }),
  );
  await page.goto(url("work/glossboss?utm_source=pages-fallback#main"));
  await expect(page).toHaveURL(
    /\/Webora\/work\/glossboss\?utm_source=pages-fallback#main$/,
  );
  await expect(page.locator("h1")).toContainText("Gloss Boss");
});
