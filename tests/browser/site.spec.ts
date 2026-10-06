import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Mandatory safety net: ordinary automated tests must never contact a real form.
// Individual tests register later handlers that fulfill synthetic responses.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
  await context.route("https://formspree.io/**", (route) =>
    route.abort("blockedbyclient"),
  );
});

async function completeForm(page: Page, url = "/start-project") {
  if (url) await page.goto(url);
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
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Business category", { exact: true })
    .selectOption("Professional services");
  await page
    .getByLabel("What does your business do?", { exact: true })
    .fill("A design studio serving local businesses.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("radio", { name: "Business website", exact: true })
    .check();
  await page.getByRole("radio", { name: "2–5", exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Enquiry forms", exact: true })
    .check();
  await page.getByRole("checkbox", { name: "WhatsApp", exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("radio", { name: "Recommend a budget", exact: true })
    .check();
  await page.getByRole("radio", { name: "1–2 months", exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator('input[name="consent"]').check();
}

test("desktop WebGL, navigation, services and keyboard process interaction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".core")).toHaveClass(/core-ready/);
  await page.screenshot({ path: "qa/home-desktop.png" });
  await page.getByRole("button", { name: /03 E-commerce/ }).click();
  await expect(
    page.getByText("Turn browsing into a shopping experience"),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Discover/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Direction/ })).toBeFocused();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Distinctive worlds",
  );
  await page
    .getByRole("link", { name: "Explore Harvester Parts, LIVE" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Harvester Parts",
  );
  expect(errors).toEqual([]);
});

test("responsive routes have no horizontal overflow", async ({ page }) => {
  test.setTimeout(120000);
  for (const size of [
    { width: 320, height: 740 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 },
    { width: 3840, height: 2160 },
  ]) {
    await page.setViewportSize(size);
    for (const route of [
      "/",
      "/work",
      "/services",
      "/studio",
      "/start-project",
      "/privacy",
      "/work/form-and-field",
      "/work/off-script",
      "/work/harvester-parts",
      "/work/veyrath",
      "/work/glossboss",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${route} at ${size.width}`,
      ).toBe(true);
    }
  }
});

test("mocked successful submission protects against duplicate clicks", async ({
  page,
}) => {
  let calls = 0;
  await page.route("https://formspree.io/f/**", async (route) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"ok":true}',
    });
  });
  await completeForm(page, "http://127.0.0.1:5174/start-project");
  await page.getByLabel("Save my draft on this device").check();
  await page
    .getByRole("button", { name: "Send Project Enquiry", exact: true })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await expect(
    page.getByRole("heading", { name: "Project received." }),
  ).toBeVisible();
  expect(calls).toBe(1);
  expect(
    await page.evaluate(() => localStorage.getItem("webora-enquiry-draft-v1")),
  ).toBeNull();
});

test("network failure retains the saved brief and retries with the same enquiry reference", async ({
  page,
}) => {
  const ids: string[] = [];
  await page.route("https://formspree.io/f/**", async (route) => {
    ids.push(route.request().postDataJSON().submission_id);
    if (ids.length === 1) await route.abort("failed");
    else
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: '{"ok":true}',
      });
  });
  await completeForm(page, "http://127.0.0.1:5174/start-project");
  await page.getByLabel("Save my draft on this device").check();
  await page
    .getByRole("button", { name: "Send Project Enquiry", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "connection was interrupted",
  );
  await expect(page.getByText("Alex Example · Example Studio")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("webora-enquiry-draft-v1")!).draft
          .business_name,
    ),
  ).toBe("Example Studio");
  await page
    .getByRole("button", { name: "Retry Project Enquiry", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Project received." }),
  ).toBeVisible();
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
  expect(
    await page.evaluate(() => localStorage.getItem("webora-enquiry-draft-v1")),
  ).toBeNull();
});

test("form validation, retained values, review editing and honest failure", async ({
  page,
}) => {
  await page.goto("/start-project");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Please enter your full name.")).toBeVisible();
  await expect(page.getByLabel("Full name", { exact: true })).toBeFocused();
  await completeForm(page);
  await page.getByRole("button", { name: "Edit" }).first().click();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Alex Example",
  );
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Send Project Enquiry", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Online enquiries are not connected yet",
  );
  await expect(
    page.getByText("Project received.", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("Alex Example · Example Studio")).toBeVisible();
});

test("Formspree rejection retains the persisted draft and unlocks retry without leaking provider errors", async ({
  page,
}) => {
  await page.route("https://formspree.io/f/**", (route) =>
    route.fulfill({
      status: 422,
      contentType: "application/json",
      body: '{"errors":[{"message":"PRIVATE PROVIDER MESSAGE alex@example.com"}]}',
    }),
  );
  await completeForm(page, "http://127.0.0.1:5174/start-project");
  await page.getByLabel("Save my draft on this device").check();
  await page
    .getByRole("button", { name: "Send Project Enquiry", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Your details are still here",
  );
  await expect(page.getByRole("alert")).not.toContainText(
    "PRIVATE PROVIDER MESSAGE",
  );
  await expect(
    page.getByRole("button", { name: "Retry Project Enquiry", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("heading", { name: "Project received." }),
  ).toHaveCount(0);
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("webora-enquiry-draft-v1")!).draft,
  );
  expect(saved.full_name).toBe("Alex Example");
  expect(saved.features).toEqual(["Enquiry forms", "WhatsApp"]);
  await page.reload();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Alex Example",
  );
  await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(
    "alex@example.com",
  );
});

test("Instagram homepage entry survives navigation and is included in readable Formspree fields", async ({
  page,
}) => {
  let payload: Record<string, string> | undefined;
  await page.route("https://formspree.io/f/**", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"ok":true}',
    });
  });
  await page.goto(
    "http://127.0.0.1:5174/?utm_source=instagram&utm_medium=social&utm_campaign=launch&utm_content=bio&utm_term=studio",
    { referer: "https://www.instagram.com/" },
  );
  await page
    .locator(".hero-actions")
    .getByRole("link", { name: "Start a Project" })
    .click();
  await completeForm(page, "");
  await page
    .getByRole("button", { name: "Send Project Enquiry", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Project received." }),
  ).toBeVisible();
  expect(payload).toMatchObject({
    full_name: "Alex Example",
    business_name: "Example Studio",
    email: "alex@example.com",
    features: "Enquiry forms, WhatsApp",
    existing_website: "No",
    _gotcha: "",
    source: "instagram",
    utm_source: "instagram",
    utm_medium: "social",
    utm_campaign: "launch",
    utm_content: "bio",
    utm_term: "studio",
    referrer: "https://www.instagram.com/",
    landing_page: "http://127.0.0.1:5174/",
  });
  await expect(page).toHaveURL("http://127.0.0.1:5174/start-project");
  await expect(
    page.getByRole("link", { name: "Return to Webora" }),
  ).toHaveAttribute("href", "/");
  await expect(
    page
      .locator(".success-panel")
      .getByRole("link", { name: "WhatsApp Webora" }),
  ).toHaveAttribute("href", /^https:\/\/wa.me\/919814800017\?/);
  expect(JSON.stringify(payload)).not.toContain("kiratveersinghralhan");
});

test("explicit local drafts restore and clear", async ({ page }) => {
  await page.goto("/start-project");
  await page.getByLabel("Full name", { exact: true }).fill("Draft Person");
  expect(
    await page.evaluate(() => localStorage.getItem("webora-enquiry-draft-v1")),
  ).toBeNull();
  await page.getByLabel("Save my draft on this device").check();
  await page.reload();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Draft Person",
  );
  await page.getByRole("button", { name: "Clear saved draft" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("webora-enquiry-draft-v1")),
  ).toBeNull();
});

test("mobile menu supports escape and traps focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Start a Project" })
    .click();
  await expect(page).toHaveURL(/start-project/);
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
});

test("reduced motion keeps content and form usable, with accessible pages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/",
    "/start-project",
    "/services",
    "/work/form-and-field",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      route,
    ).toEqual([]);
  }
  await page.goto("/");
  expect(await page.locator(".core-canvas canvas").count()).toBe(0);
});

test("WebGL failure preserves fallback and enquiry route", async ({ page }) => {
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
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".core-fallback")).toBeVisible();
  await page
    .locator(".hero-actions")
    .getByRole("link", { name: "Start a Project" })
    .click();
  await expect(page.getByLabel("Full name", { exact: true })).toBeVisible();
});

test("prerendered business content and links work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.locator("h1")).toContainText("Your business.");
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await expect(page.locator("h1")).toContainText("Distinctive worlds");
  await context.close();
});

test("small-phone form is usable through every step", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await completeForm(page);
  for (let step = 5; step >= 0; step--) {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (step > 0)
      await page.getByRole("button", { name: "Back", exact: true }).click();
  }
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Alex Example",
  );
  await page.screenshot({ path: "qa/booking-mobile.png", fullPage: true });
});

test("hero WebGL rendering pauses off-screen and resumes on return", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".core")).toHaveClass(/core-ready/);
  await page.evaluate(() => scrollTo(0, 2400));
  // Allow the scroll and IntersectionObserver to settle before comparing draws.
  await page.waitForTimeout(300);
  const hero = page.locator(".core [data-frames]");
  const paused = await hero.getAttribute("data-frames");
  await page.waitForTimeout(300);
  expect(await hero.getAttribute("data-frames")).toBe(paused);
  await page.evaluate(() => scrollTo(0, 0));
  await expect
    .poll(() => hero.getAttribute("data-frames").then(Number))
    .toBeGreaterThan(Number(paused));
});
