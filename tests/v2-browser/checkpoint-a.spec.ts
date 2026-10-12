import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
const output = process.env.WEBORA_CHECKPOINT_OUTPUT ?? "test-results/checkpoint-a";
const stages = [
  "Discover",
  "Direction",
  "Design",
  "Develop",
  "Refine",
  "Launch",
];
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
async function show(page: Page, kind: string, heading = false) {
  await page
    .locator(
      heading
        ? `#${kind} .installation-section-heading`
        : `[data-installation-kind=${kind}]`,
    )
    .evaluate((el) =>
      scrollTo({
        top:
          el.getBoundingClientRect().top +
          scrollY -
          (innerWidth > 899 ? 140 : 100),
        behavior: "instant",
      }),
    );
  await expect(
    page.locator(`[data-installation-kind=${kind}][data-ready=true]`),
  ).toHaveCount(1, { timeout: 60000 });
}
async function settle(page: Page) {
  await page.mouse.move(1, 1);
  await expect
    .poll(
      async () => {
        const before = (await record(page)).frames;
        await page.waitForTimeout(400);
        return (await record(page)).frames === before;
      },
      { timeout: 30000 },
    )
    .toBe(true);
}
async function capture(page: Page, name: string, kind?: string) {
  await page.evaluate(() => document.fonts.ready);
  if (kind)
    await page
      .locator(`[data-installation-kind=${kind}]`)
      .screenshot({ path: `${output}/${name}.png` });
  else await page.screenshot({ path: `${output}/${name}.png` });
}

for (const [width, height] of [
  [1440, 1000],
  [390, 844],
])
  test(`Checkpoint A: six Services and Process selections, depth views and resources ${width}`, async ({
    page,
  }) => {
    test.setTimeout(300000);
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/?experience=v2&diagnostics=1#services");
    await show(page, "services");
    await expect
      .poll(async () =>
        Number((await record(page)).identity!.loadedScreenshots),
      )
      .toBe(3);
    const canvas = await page.locator("canvas").elementHandle();
    const samples = [];
    for (let i = 0; i < 6; i++) {
      const button = page.locator("#services .service-row > button").nth(i);
      if ((await button.getAttribute("aria-expanded")) !== "true")
        await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await show(page, "services");
      await settle(page);
      expect((await record(page)).identity!.selected).toBe(i);
      await capture(page, `services-${width}-selection-${i + 1}`, "services");
      samples.push(await record(page));
    }
    for (let view = 1; view <= 3; view++) {
      await page
        .getByRole("button", { name: "Rotate services installation" })
        .click();
      await show(page, "services");
      await settle(page);
      await capture(page, `services-${width}-depth-${view}`, "services");
    }
    // Restore front composition for the page-level review.
    for (let i = 0; i < 3; i++)
      await page
        .getByRole("button", { name: "Rotate services installation" })
        .click();
    await page.locator("#services .service-row > button").first().click();
    await show(page, "services", true);
    await settle(page);
    await capture(page, `services-${width}`);
    await show(page, "process");
    for (let i = 0; i < 6; i++) {
      await page.getByRole("tab", { name: new RegExp(stages[i]) }).click();
      await show(page, "process");
      await settle(page);
      expect((await record(page)).identity!.selected).toBe(i);
      await expect(page.getByRole("tabpanel")).toHaveCount(1);
      await expect(page.getByRole("tabpanel")).toContainText(
        stages[i].toUpperCase(),
      );
      await capture(page, `process-${width}-stage-${i + 1}`, "process");
      samples.push(await record(page));
    }
    for (let view = 1; view <= 3; view++) {
      await page
        .getByRole("button", { name: "Rotate process installation" })
        .click();
      await show(page, "process");
      await settle(page);
      await capture(page, `process-${width}-depth-${view}`, "process");
    }
    for (let i = 0; i < 3; i++)
      await page
        .getByRole("button", { name: "Rotate process installation" })
        .click();
    await page.getByRole("tab", { name: /Design/ }).click();
    await show(page, "process", true);
    await settle(page);
    await capture(page, `process-${width}`);
    const idle = (await record(page)).frames;
    await page.waitForTimeout(1500);
    expect((await record(page)).frames).toBe(idle);
    expect(
      await canvas!.evaluate(
        (node) => node === document.querySelector("canvas"),
      ),
    ).toBe(true);
    await expect(page.locator("canvas")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
    expect(
      (
        await page.evaluate(() =>
          window.__WEBORA_RUNTIME__!.records.filter((r) => r.active),
        )
      ).length,
    ).toBe(1);
    await writeFile(
      `${output}/resources-${width}.json`,
      JSON.stringify(
        { samples, idleDraws: (await record(page)).frames - idle, errors },
        null,
        2,
      ),
    );
    expect(errors).toEqual([]);
  });

for (const mode of ["reduce", "no-webgl"])
  test(`Checkpoint A: accessible HTML and selected static artwork with ${mode}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (mode === "reduce") await page.emulateMedia({ reducedMotion: "reduce" });
    else
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          type: string,
          ...args: unknown[]
        ) {
          return /^webgl/.test(type)
            ? null
            : original.call(this, type as "2d", ...(args as []));
        } as typeof original;
      });
    await page.goto("/services?experience=v2&diagnostics=1#services");
    for (let i = 0; i < 6; i++) {
      const button = page.locator("#services .service-row > button").nth(i);
      if ((await button.getAttribute("aria-expanded")) !== "true")
        await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator(`#service-${i}`)).toBeVisible();
    }
    await page.getByRole("tab", { name: /Discover/ }).focus();
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: /Launch/ })).toBeFocused();
    await expect(page.getByRole("tabpanel")).toContainText(
      "Ready for the real world.",
    );
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: /Discover/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /Direction/ })).toBeFocused();
    for (const kind of ["services", "process"]) {
      await page
        .locator(`[data-installation-kind=${kind}]`)
        .scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(
        page.locator(`[data-installation-kind=${kind}] .installation-still`),
      ).toBeVisible();
      await capture(page, `${mode}-${kind}`, kind);
    }
    await expect(page.locator("canvas")).toHaveCount(0);
    const axe = await new AxeBuilder({ page })
      .include("#services")
      .include("#process")
      .analyze();
    await writeFile(
      `${output}/axe-${mode}.json`,
      JSON.stringify(axe.violations, null, 2),
    );
    expect(axe.violations).toEqual([]);
  });

test("Checkpoint A: context loss restores artwork and the same canvas", async ({
  page,
}) => {
  await page.goto("/services?experience=v2&diagnostics=1#services");
  await show(page, "services");
  await settle(page);
  const extension = await page.evaluateHandle(() => {
    const gl = document.querySelector("canvas")!.getContext("webgl2")!;
    return gl.getExtension("WEBGL_lose_context")!;
  });
  await extension.evaluate((value) => value.loseContext());
  await expect(
    page.locator("[data-installation-kind=services] .installation-still"),
  ).toBeVisible();
  await page.waitForTimeout(600);
  await extension.evaluate((value) => value.restoreContext());
  await expect(
    page.locator("[data-installation-kind=services][data-ready=true]"),
  ).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.evaluate(() =>
    document
      .querySelector("canvas")!
      .getContext("webgl2")!
      .getExtension("WEBGL_lose_context")!
      .loseContext(),
  );
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.locator("[data-installation-kind=services] .installation-still"),
  ).toBeVisible();
});

test("Checkpoint A: chapter reuse, route cleanup and W return", async ({
  page,
}) => {
  test.setTimeout(240000);
  const counts = [];
  for (let cycle = 0; cycle < 5; cycle++) {
    await page.goto("/?experience=v2&diagnostics=1");
    await expect(page.locator(".core-ready")).toBeVisible({ timeout: 60000 });
    const hero = (await record(page)).identity!.geometryId;
    const owner = (await record(page)).id;
    await show(page, "services");
    await settle(page);
    const services = (await record(page)).identity!.geometryId;
    await show(page, "process");
    await settle(page);
    counts.push((await record(page)).geometries);
    await show(page, "services");
    await settle(page);
    expect((await record(page)).identity!.geometryId).toBe(services);
    await page.locator(".hero-scene").scrollIntoViewIfNeeded();
    await expect(page.locator(".core-ready")).toBeVisible();
    expect((await record(page)).identity!.geometryId).toBe(hero);
    expect((await record(page)).id).toBe(owner);
    await page.locator(".hero-actions a").first().click();
    await expect(page.locator(".booking-page")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    expect((await record(page)).active).toBe(false);
  }
  expect(new Set(counts).size).toBe(1);
  await writeFile(`${output}/route-cycles.json`, JSON.stringify(counts));
});

for (const [width, height] of [
  [1920, 1080],
  [1280, 720],
  [768, 1024],
  [430, 932],
  [360, 800],
  [320, 568],
])
  test(`Checkpoint A: responsive installations ${width}x${height}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height });
    await page.goto("/services?experience=v2&diagnostics=1#services");
    for (const kind of ["services", "process"]) {
      await show(page, kind);
      await settle(page);
      await capture(page, `${kind}-${width}x${height}`);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBe(0);
    }
    await expect(page.locator("canvas")).toHaveCount(1);
  });

test("Checkpoint A: production preview hydrates the Services route with no diagnostics", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4175/services?experience=v2#process");
  await show(page, "process");
  await page.getByRole("tab", { name: /Launch/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Ready for the real world.",
  );
  expect(await page.evaluate(() => window.__WEBORA_RUNTIME__)).toBeUndefined();
  await expect(page.locator("canvas")).toHaveCount(1);
});
