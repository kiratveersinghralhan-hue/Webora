import { test, expect, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test.beforeEach(async ({ context, page }) => {
  await context.route("https://formspree.io/**", (route) =>
    route.abort("blockedbyclient"),
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
});
async function seen(page: Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
}
async function drag(page: Page, x: number, y: number, dx: number) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + 8, { steps: 18 });
  await page.mouse.up();
}
async function touchDrag(page: Page, x: number, y: number, dx: number, dy = 0) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 12; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + (dx * i) / 12, y: y + (dy * i) / 12 }],
    });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
}

test("WebGL-unavailable gallery keeps fitted previews, keyboard selection and case links", async ({
  page,
}) => {
  await seen(page);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return original.call(this, type as never, ...(args as [])) as never;
    } as typeof original;
  });
  await page.goto("/work");
  await expect(page.locator(".work-theatre")).toHaveClass(/work-enhanced/);
  const stage = page.locator(".work-stage");
  await stage.scrollIntoViewIfNeeded();
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".project.is-active h3")).toHaveText("VEYRATH");
  await page.getByRole("button", { name: "Show Gloss Boss" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText("Gloss Boss");
  const image = await page.locator(".project.is-active img").boundingBox(),
    info = await page.locator(".project.is-active .project-info").boundingBox();
  expect(image!.y + image!.height).toBeLessThanOrEqual(info!.y + 10);
  await expect(page.locator(".spatial-work canvas")).toHaveCount(0);
  await page.screenshot({ path: "qa/gallery-no-webgl.png" });
  await page
    .locator(".project.is-active")
    .getByRole("link", { name: "View Case Study" })
    .click();
  await expect(page.locator("h1")).toContainText("Gloss Boss");
});

test("intro assembles real geometry, completes once, and keeps the hero canvas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByTestId("webora-intro")).toBeVisible();
  await expect(page.locator(".core")).toHaveClass(/core-ready/);
  const canvas = await page.locator(".core canvas").elementHandle();
  await expect
    .poll(() =>
      page
        .locator(".core [data-intro-phase]")
        .getAttribute("data-intro-phase")
        .then(Number),
    )
    .toBeGreaterThan(0.1);
  await page.screenshot({ path: "qa/intro-assembly.png" });
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 3500,
  });
  expect(
    await canvas!.evaluate(
      (element) => element === document.querySelector(".core canvas"),
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() => sessionStorage.getItem("webora-intro-v2")),
  ).toBe("seen");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Studio" })
    .click();
  await expect(page.locator(".studio-ai")).toContainText("Human direction");
  await page.getByRole("link", { name: "Webora home" }).click();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
});

test("intro skip is immediate and reduced motion avoids the intro and WebGL", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("webora-intro")).toBeVisible();
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await expect(page.locator(".core canvas")).toHaveCount(0);
});

test("Discover traverses smoothly, offsets navigation and preserves hash history", async ({
  page,
}) => {
  await seen(page);
  await page.goto("/");
  await expect(page.locator(".work-theatre")).toHaveClass(/work-enhanced/);
  await page.getByRole("link", { name: "SCROLL TO DISCOVER" }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect
    .poll(
      () =>
        page
          .locator("#work")
          .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
      { timeout: 5000 },
    )
    .toBeGreaterThan(80);
  await expect
    .poll(() =>
      page
        .locator("#work")
        .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
    )
    .toBeLessThan(160);
  const y = await page.evaluate(() => scrollY);
  await page.goBack();
  await expect(page).not.toHaveURL(/#work$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(y);
});

test("desktop W supports full turns and release inertia; model back is dimensional", async ({
  page,
}) => {
  await seen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".core")).toHaveClass(/core-ready/);
  const core = await page.locator(".core").boundingBox();
  for (let i = 0; i < 3; i++)
    await drag(
      page,
      core!.x + 60,
      core!.y + core!.height * 0.5,
      core!.width - 120,
    );
  const angle = Number(
    await page.locator(".core [data-rotation]").getAttribute("data-rotation"),
  );
  expect(angle).toBeGreaterThan(Math.PI * 2);
  await expect
    .poll(() =>
      page
        .locator(".core [data-rotation]")
        .getAttribute("data-rotation")
        .then(Number),
    )
    .toBeGreaterThan(angle + 0.02);
  await page.screenshot({ path: "qa/core-explored-desktop.png" });
  await page.getByRole("button", { name: "Reset sculpture" }).click();
  await expect
    .poll(() =>
      page
        .locator(".core [data-rotation]")
        .getAttribute("data-rotation")
        .then(Number),
    )
    .toBeLessThan(0.01);
  await page.getByRole("button", { name: "Rotate sculpture right" }).focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() =>
      page
        .locator(".core [data-rotation]")
        .getAttribute("data-rotation")
        .then(Number),
    )
    .toBeGreaterThan(1);
});

test("gallery keyboard, drag, wheel, reversal and route cancellation remain coherent", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await seen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/work");
  const stage = page.locator(".work-stage");
  await stage.scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-work")).toHaveClass(/spatial-ready/);
  await stage.focus();
  await page.keyboard.press("End");
  await expect(page.locator(".project.is-active h3")).toHaveText(
    "Article Project",
  );
  await page.keyboard.press("Home");
  await expect(page.locator(".project.is-active h3")).toHaveText(
    "Harvester Parts",
  );
  const bounds = await stage.boundingBox();
  await drag(
    page,
    bounds!.x + bounds!.width * 0.75,
    bounds!.y + 180,
    -bounds!.width * 0.5,
  );
  await expect(page.locator(".project.is-active h3")).not.toHaveText(
    "Harvester Parts",
  );
  await page.mouse.wheel(0, 900);
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(1200);

  await page.getByRole("button", { name: "Show Gloss Boss" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText("Gloss Boss");
  await expect
    .poll(() => stage.getAttribute("data-position").then(Number))
    .toBeGreaterThan(1.99);
  await page.screenshot({ path: "qa/carousel-desktop-final.png" });
  await page
    .locator(".project.is-active")
    .getByRole("link", { name: "View Case Study" })
    .click();
  await expect(page.locator("h1")).toContainText("Gloss Boss");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.getByRole("link", { name: "All websites" }).click();
  await expect(page.locator("h1")).toContainText("Distinctive worlds");
  expect(errors).toEqual([]);
});

test("trusted touch drag rotates W and gallery while vertical touch still scrolls", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "no-preference",
  });
  await context.route("https://formspree.io/**", (route) => route.abort());
  const page = await context.newPage();
  await seen(page);
  await page.goto("/");
  await expect(page.locator(".core")).toHaveClass(/core-ready/);
  await page.locator(".core").scrollIntoViewIfNeeded();
  const core = await page.locator(".core").boundingBox();
  await touchDrag(page, 65, core!.y + core!.height / 2, 250);
  await expect
    .poll(() =>
      page
        .locator(".core [data-rotation]")
        .getAttribute("data-rotation")
        .then(Number),
    )
    .toBeGreaterThan(1);
  const scroll = await page.evaluate(() => scrollY);
  await touchDrag(page, 180, core!.y + core!.height / 2, 5, -140);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(scroll + 40);
  await page.locator(".work-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-work")).toHaveClass(/spatial-ready/);
  const stage = await page.locator(".work-stage").boundingBox();
  await touchDrag(page, 330, stage!.y + 180, -265);
  await expect(page.locator(".project.is-active h3")).not.toHaveText(
    "Harvester Parts",
  );
  await expect(page.locator(".cursor")).toBeHidden();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(
    page.getByRole("button", { name: "Next project" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({ path: "qa/gallery-phone-landscape.png" });
  await context.close();
});

test("responsive spatial compositions survive resize and repeated mobile menus", async ({
  page,
}) => {
  test.setTimeout(90000);
  await seen(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [label, width, height] of [
    ["4k", 3840, 2160],
    ["ultrawide", 2560, 1080],
    ["laptop", 1366, 768],
    ["tablet", 768, 1024],
    ["phone", 390, 844],
    ["narrow", 320, 740],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/work");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".work-theatre")).toHaveClass(/work-enhanced/);
    await page.locator(".work-stage").scrollIntoViewIfNeeded();
    await expect(page.locator(".spatial-work")).toHaveClass(/spatial-ready/);
    await page.getByRole("button", { name: "Show Gloss Boss" }).click();
    await expect(page.locator(".project.is-active h3")).toHaveText(
      "Gloss Boss",
    );
    await expect
      .poll(() =>
        page.locator(".work-stage").getAttribute("data-position").then(Number),
      )
      .toBeGreaterThan(1.99);
    await expect
      .poll(() =>
        page
          .locator(".spatial-work [data-camera-position]")
          .getAttribute("data-camera-position")
          .then(Number),
      )
      .toBeGreaterThan(1.99);
    if (width < 900)
      await page.evaluate(() => {
        const stage = document.querySelector(".work-stage")!;
        const header = document
          .querySelector(".site-header")!
          .getBoundingClientRect().height;
        scrollTo(0, stage.getBoundingClientRect().top + scrollY - header - 12);
      });
    const description = await page
      .locator(".project.is-active .project-description")
      .boundingBox();
    const canvas = await page.locator(".spatial-work canvas").boundingBox();
    expect(description!.width).toBeGreaterThan(250);
    expect(canvas!.height).toBeGreaterThan(200);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({ path: `qa/gallery-${label}.png` });
    if (width < 900) {
      for (let i = 0; i < 3; i++) {
        await page.getByRole("button", { name: "Open menu" }).click();
        await page.getByRole("button", { name: "Close menu" }).click();
      }
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Start a Project" })
        .click();
      await expect(page.getByLabel("Full name", { exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
        "hidden",
      );
      await page.screenshot({ path: `qa/brief-${label}.png` });
    }
  }
  expect(errors).toEqual([]);
});

test("performance sampling records frame stalls and layout work; idle gallery stops", async ({
  page,
}) => {
  await seen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/work");
  await page.locator(".work-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-work")).toHaveClass(/spatial-ready/);
  await page.waitForTimeout(1500);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const before = await cdp.send("Performance.getMetrics");
  const sampling = page.evaluate(async () => {
    const gaps: number[] = [],
      longTasks: number[] = [];
    const observer = new PerformanceObserver((list) =>
      list.getEntries().forEach((entry) => longTasks.push(entry.duration)),
    );
    observer.observe({ type: "longtask", buffered: false });
    let previous = performance.now();
    await new Promise<void>((resolve) => {
      let frames = 0;
      const tick = (now: number) => {
        gaps.push(now - previous);
        previous = now;
        if (++frames < 120) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    observer.disconnect();
    gaps.sort((a, b) => a - b);
    return {
      frames: gaps.length,
      frameP50: gaps[60],
      frameP95: gaps[114],
      maxFrameGap: gaps.at(-1),
      longTasks,
    };
  });
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, i % 2 ? -260 : 380);
    await page.waitForTimeout(80);
  }
  await page.getByRole("button", { name: "Show Gloss Boss" }).click();
  const frames = await sampling,
    after = await cdp.send("Performance.getMetrics");
  const metric = (name: string) =>
    (after.metrics.find((m) => m.name === name)?.value ?? 0) -
    (before.metrics.find((m) => m.name === name)?.value ?? 0);
  const result = {
    environment:
      "Local Windows Chromium, headless; not a physical-device or production benchmark",
    ...frames,
    layoutCount: metric("LayoutCount"),
    recalcStyleCount: metric("RecalcStyleCount"),
    scriptDuration: metric("ScriptDuration"),
    layoutDuration: metric("LayoutDuration"),
  };
  await writeFile(
    "qa/performance-immersive.json",
    JSON.stringify(result, null, 2),
  );
  await page.waitForTimeout(1800);
  const scene = page.locator(".spatial-work [data-frames]"),
    count = await scene.getAttribute("data-frames");
  await page.waitForTimeout(250);
  expect(await scene.getAttribute("data-frames")).toBe(count);
  await cdp.send("Page.setWebLifecycleState", { state: "frozen" });
  await page.waitForTimeout(150);
  await cdp.send("Page.setWebLifecycleState", { state: "active" });
  await page.getByRole("button", { name: "Show Article Project" }).click();
  await expect(page.locator(".project.is-active h3")).toHaveText(
    "Article Project",
  );
  await cdp.detach();
});
