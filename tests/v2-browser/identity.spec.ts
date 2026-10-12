import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const output = process.env.WEBORA_IDENTITY_OUTPUT ?? "test-results/v2-1b";
test.beforeEach(async ({ context, page }) => {
  await mkdir(output, { recursive: true });
  await context.route("https://formspree.io/**", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "no-preference" });
});
async function capability(page: Page, balanced = true) {
  await page.addInitScript(
    ({ balanced }) => {
      // Exercise material branches on SwiftShader. This changes hints, not the physical backend.
      Object.defineProperty(navigator, "deviceMemory", {
        get: () => (balanced ? 4 : 8),
      });
      Object.defineProperty(navigator, "hardwareConcurrency", {
        get: () => (balanced ? 4 : 8),
      });
      const parameter = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function (p) {
        return p === 0x9246
          ? "Test capability hints (emulated)"
          : parameter.call(this, p);
      };
    },
    { balanced },
  );
}
async function seen(page: Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem("webora-intro-v2", "seen"),
  );
}
async function record(page: Page) {
  return page.evaluate(() =>
    structuredClone(window.__WEBORA_RUNTIME__?.records.at(-1)),
  );
}
test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus && !page.isClosed())
    await writeFile(
      `${output}/failure-${info.title.replace(/[^a-z0-9]+/gi, "-")}.json`,
      JSON.stringify((await record(page)) ?? null, null, 2),
    );
});
async function ready(page: Page) {
  await expect(page.locator(".hero .core-ready")).toBeVisible({
    timeout: 60000,
  });
}
async function shot(page: Page, label: string) {
  if (await page.locator(".identity-core.core-ready").count())
    await expect(page.locator(".identity-core .core-fallback")).toHaveCSS(
      "opacity",
      "0",
    );
  await page.screenshot({ path: `${output}/${label}.png` });
}
async function warmReplay(page: Page) {
  // Playback tests warm the real driver and ES modules before a browser Back
  // navigation into the existing local replay URL. A full document reload can
  // spend the whole readiness budget reparsing modules on this software driver.
  // Cold/late readiness is covered separately; clocks/deadlines are unchanged.
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/?experience=v2&diagnostics=1");
  await ready(page);
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    history.replaceState(
      history.state,
      "",
      "/?experience=v2&intro=1&diagnostics=1",
    );
  });
  await page.locator(".hero-actions a").first().click();
  await expect(page.locator(".booking-page")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".identity-core")).toBeAttached();
}
async function captureIntroFrames(page: Page, target: number | null = null) {
  await page.addInitScript(
    ({ target }) => {
      const frames: {
        progress: number;
        phase: string;
        data: string;
        sculptureId: string;
        geometryId: string;
        time: number;
      }[] = [];
      (
        window as typeof window & { __identityFrames: typeof frames }
      ).__identityFrames = frames;
      let pending = false;
      const capture = (gl: WebGL2RenderingContext) => {
        if (pending) return;
        pending = true;
        queueMicrotask(() => {
          pending = false;
          const identity = window.__WEBORA_RUNTIME__?.records.at(-1)?.identity;
          if (!identity) return;
          const progress = Number(identity.progress),
            bucket = Math.min(4, Math.floor(progress * 4));
          if (
            identity.introPhase === "settled" &&
            !Number(identity.introDuration)
          )
            return;
          if (
            target !== null &&
            (frames.length ||
              progress < target ||
              (target < 1 && identity.introPhase === "settled"))
          )
            return;
          if (
            frames.some(
              (frame) => Math.min(4, Math.floor(frame.progress * 4)) === bucket,
            )
          )
            return;
          frames.push({
            progress,
            phase: String(identity.introPhase),
            sculptureId: String(identity.sculptureId),
            geometryId: String(identity.geometryId),
            time: performance.now(),
            data:
              target === null
                ? ""
                : (gl.canvas as HTMLCanvasElement).toDataURL("image/png"),
          });
        });
      };
      const arrays = WebGL2RenderingContext.prototype.drawArrays,
        elements = WebGL2RenderingContext.prototype.drawElements;
      WebGL2RenderingContext.prototype.drawArrays = function (...args) {
        arrays.apply(this, args);
        capture(this);
      };
      WebGL2RenderingContext.prototype.drawElements = function (...args) {
        elements.apply(this, args);
        capture(this);
      };
    },
    { target },
  );
}
test("identity: six views, continuous sculpture and full-turn drag", async ({
  page,
}) => {
  await seen(page);
  await page.goto("/?experience=v2&diagnostics=1");
  await ready(page);
  const initial = (await record(page))!.identity!;
  await shot(page, "identity-front");
  for (const label of ["right", "rear", "left"]) {
    await page.getByRole("button", { name: "Rotate sculpture right" }).click();
    await page.waitForTimeout(900);
    await shot(page, `identity-${label}`);
  }
  await page.getByRole("button", { name: "Reset sculpture" }).click();
  await page.waitForTimeout(900);
  const box = (await page.locator(".identity-core").boundingBox())!;
  for (const [label, dy] of [
    ["above", 125],
    ["below", -250],
  ] as const) {
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width * 0.5,
      box.y + box.height * 0.5 + dy,
      { steps: 8 },
    );
    await page.mouse.up();
    await page.waitForTimeout(400);
    await shot(page, `identity-${label}`);
  }
  await page.getByRole("button", { name: "Reset sculpture" }).click();
  await page.waitForTimeout(900);
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, {
      steps: 8,
    });
    await page.mouse.up();
  }
  const final = (await record(page))!.identity!;
  expect(Number(final.yaw)).toBeGreaterThan(Math.PI * 2);
  expect(Math.abs(Number(final.pitch))).toBeLessThanOrEqual(0.44);
  expect(final.sculptureId).toBe(initial.sculptureId);
  expect(final.geometryId).toBe(initial.geometryId);
  await expect(page.locator("canvas")).toHaveCount(1);
  await writeFile(
    `${output}/six-views.json`,
    JSON.stringify({ initial, final }, null, 2),
  );
});
test("identity: actual liquid shader compiles and its uniforms settle without material rebuilds", async ({
  page,
}) => {
  await capability(page);
  await seen(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?experience=v2&diagnostics=1");
  await ready(page);
  const initial = await record(page);
  expect(initial!.quality).toBe("balanced");
  expect(initial!.events).not.toContain("ordinary-alloy-fallback");
  await page.mouse.move(1000, 400);
  await page.mouse.move(1100, 350, { steps: 12 });
  await page.waitForTimeout(3000);
  const start = await record(page);
  await page.waitForTimeout(1500);
  const end = await record(page);
  expect(end!.frames).toBe(start!.frames);
  expect(end!.programs).toBe(initial!.programs);
  expect(end!.identity!.sculptureId).toBe(initial!.identity!.sculptureId);
  expect(errors).toEqual([]);
  await shot(page, "identity-liquid-balanced");
  await writeFile(
    `${output}/liquid-balanced.json`,
    JSON.stringify(end, null, 2),
  );
});
test("identity: failed custom shader retries ordinary alloy on the same renderer", async ({
  page,
}) => {
  await capability(page);
  await seen(page);
  await page.addInitScript(() => {
    const source = WebGL2RenderingContext.prototype.shaderSource;
    WebGL2RenderingContext.prototype.shaderSource = function (shader, text) {
      source.call(
        this,
        shader,
        text.includes("WEBORA_ALLOY_FLOW")
          ? `${text}\nBROKEN_WEBORA_FLOW`
          : text,
      );
    };
  });
  await page.goto("/?experience=v2&diagnostics=1");
  await ready(page);
  const state = await record(page);
  expect(state!.events).toContain("ordinary-alloy-fallback");
  expect(state!.identity!.material).toContain("ordinary alloy fallback");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".hero-actions a").first()).toBeVisible();
  await shot(page, "identity-ordinary-recovery");
});
test("identity: readiness-driven assembly hands the same W and camera into the hero", async ({
  page,
}) => {
  await capability(page);
  await seen(page);
  await captureIntroFrames(page);
  await warmReplay(page);
  await ready(page);
  await expect(page.locator(".hero-actions a").first()).toBeVisible();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 3500,
  });
  const last = await record(page);
  const frames = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __identityFrames: {
            progress: number;
            phase: string;
            sculptureId: string;
            geometryId: string;
            time: number;
          }[];
        }
      ).__identityFrames,
  );
  expect(frames.some((frame) => frame.progress > 0 && frame.progress < 1)).toBe(
    true,
  );
  expect(
    frames.every(
      (frame) =>
        frame.sculptureId === last!.identity!.sculptureId &&
        frame.geometryId === last!.identity!.geometryId,
    ),
  ).toBe(true);
  expect(last!.identity!.progress).toBe(1);
  expect(Number(last!.identity!.introDuration)).toBeLessThanOrEqual(2200);
  await expect(page.locator(".hero-actions a").first()).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  await shot(page, "intro-hero-handoff");
  await writeFile(
    `${output}/intro-continuity.json`,
    JSON.stringify({ frames, last }, null, 2),
  );
  await writeFile(
    `${output}/intro-frame-metadata.json`,
    JSON.stringify(frames, null, 2),
  );
});
test("identity: captures actual initial, assembly and resolve surfaces", async ({
  page: rootPage,
}) => {
  test.setTimeout(180000);
  const metadata: { progress: number; phase: string }[] = [];
  for (const [index, target] of [0, 0.3, 1].entries()) {
    const page = await rootPage.context().newPage();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await seen(page);
    // One readback per replay. Capturing every frame stalls software drivers and
    // changes the timeline being measured. These images are not timing samples.
    await captureIntroFrames(page, target);
    await warmReplay(page);
    await ready(page);
    await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
      timeout: 5000,
    });
    const frames = await page.evaluate(
      () =>
        (
          window as typeof window & {
            __identityFrames: {
              progress: number;
              phase: string;
              data: string;
            }[];
          }
        ).__identityFrames,
    );
    expect(frames).toHaveLength(1);
    expect(frames[0].data.length).toBeGreaterThan(1000);
    await writeFile(
      `${output}/intro-frame-${index}.png`,
      Buffer.from(frames[0].data.split(",")[1], "base64"),
    );
    metadata.push({ progress: frames[0].progress, phase: frames[0].phase });
    await page.close();
  }
  await writeFile(
    `${output}/intro-capture-metadata.json`,
    JSON.stringify(metadata, null, 2),
  );
});
test("identity: high-tier clearcoat and liquid shader compile without extra render passes", async ({
  page,
}) => {
  await capability(page, false);
  await seen(page);
  await page.goto("/?experience=v2&diagnostics=1");
  await ready(page);
  const state = await record(page);
  expect(state!.quality).toBe("high");
  expect(state!.events).not.toContain("ordinary-alloy-fallback");
  // The original W retains its three materials; the studio adds two leased finishes.
  expect(state!.identity!.materials).toBe(5);
  await expect(page.locator("canvas")).toHaveCount(1);
  await shot(page, "identity-liquid-high");
  await writeFile(`${output}/liquid-high.json`, JSON.stringify(state, null, 2));
});

test("identity: trusted Skip during playback keeps the same sculpture and usable CTA", async ({
  page,
}) => {
  // Exercise Skip with the actual software tier's ordinary alloy and explicit
  // local replay. Balanced/high shader compilation is covered independently.
  await seen(page);
  await page.addInitScript(() => {
    document.addEventListener(
      "click",
      (event) => {
        if (!(event.target as Element).closest(".identity-intro button"))
          return;
        const proof = {
          trusted: event.isTrusted,
          phase: document
            .querySelector(".identity-core")
            ?.getAttribute("data-intro-phase"),
          sculptureId:
            window.__WEBORA_RUNTIME__?.records.at(-1)?.identity?.sculptureId,
        };
        (window as typeof window & { __skipProof: typeof proof }).__skipProof =
          proof;
      },
      true,
    );
  });
  await warmReplay(page);
  await page.waitForFunction(
    () =>
      !!document.querySelector('.identity-core[data-intro-phase="playing"]'),
  );
  await page
    .getByRole("button", { name: "Skip intro" })
    .click({ timeout: 2200 });
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await ready(page);
  const proof = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __skipProof: { trusted: boolean; phase: string; sculptureId: string };
        }
      ).__skipProof,
  );
  expect(proof.trusted).toBe(true);
  expect(["playing", "handoff"]).toContain(proof.phase);
  await expect(page.locator(".experience-stage")).toHaveAttribute(
    "data-intro-reason",
    "skip",
  );
  expect((await record(page))!.identity!.sculptureId).toBe(proof.sculptureId);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".hero-actions a").first()).toBeVisible();
  await writeFile(
    `${output}/skip-playing.json`,
    JSON.stringify({ proof, record: await record(page) }, null, 2),
  );
});

test("identity: drag handoff preserves DRAG feedback through React settlement", async ({
  page,
}) => {
  // Exercise playback input at the real software tier. Material compilation
  // branches have separate strict checks and must not consume this input window.
  await seen(page);
  await warmReplay(page);
  await page.waitForFunction(
    () =>
      !!document.querySelector('.identity-core[data-intro-phase="playing"]'),
  );
  const box = (await page.locator(".identity-core").boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width * 0.5 + 45,
    box.y + box.height * 0.5,
    { steps: 3 },
  );
  await expect(page.locator(".identity-core")).toHaveAttribute(
    "data-cursor",
    "DRAG",
  );
  await expect(page.locator(".identity-core")).toHaveAttribute(
    "data-intro-phase",
    "settled",
  );
  // Read the actual cursor, not a second unversioned Vite import after HMR.
  await expect(page.locator(".cursor")).toHaveText("DRAG");
  await page.mouse.up();
  await expect(page.locator(".identity-core")).toHaveAttribute(
    "data-cursor",
    "EXPLORE",
  );
  await expect(page.locator(".cursor")).toHaveText("EXPLORE");
  await expect(page.locator(".identity-core[data-dragging]")).toHaveCount(0);
  await expect(page.locator(".identity-core .core-fallback")).toHaveCSS(
    "opacity",
    "0",
  );
  await writeFile(
    `${output}/drag-handoff.json`,
    JSON.stringify(await record(page), null, 2),
  );
});
test("identity: fresh capable session follows a bounded intro and revisit skips it", async ({
  page,
}) => {
  await capability(page);
  await page.addInitScript(() => {
    const phases: { phase: string; time: number }[] = [];
    (window as typeof window & { __introPhases: typeof phases }).__introPhases =
      phases;
    new MutationObserver(() => {
      const phase = document
        .querySelector(".identity-core")
        ?.getAttribute("data-intro-phase");
      if (phase && phases.at(-1)?.phase !== phase)
        phases.push({ phase, time: performance.now() });
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-intro-phase"],
    });
  });
  await page.goto("/?experience=v2&diagnostics=1", {
    waitUntil: "domcontentloaded",
  });
  await ready(page);
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 3500,
  });
  const phases = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __introPhases: { phase: string; time: number }[];
        }
      ).__introPhases,
  );
  expect(phases.some((p) => p.phase === "preparing")).toBe(true);
  const first = phases.find((p) => p.phase === "preparing")!;
  expect(phases.at(-1)!.time - first.time).toBeLessThan(3400);
  await writeFile(
    `${output}/fresh-intro.json`,
    JSON.stringify({ phases, record: await record(page) }, null, 2),
  );
  await page.reload();
  await ready(page);
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
});
test("identity: skip works during preparation and same-session navigation does not replay", async ({
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
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await ready(page);
  await page.goto("/?experience=v2&diagnostics=1");
  await ready(page);
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
});
for (const intent of ["scroll", "navigate"] as const)
  test(`identity: early ${intent} exits preparation immediately`, async ({
    page,
    context,
  }) => {
    await context.route(
      "**/src/three/runtime/WorldRuntime.ts*",
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1600));
        await route.continue();
      },
    );
    await page.goto("/?experience=v2&intro=1", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("webora-intro")).toBeVisible();
    if (intent === "scroll") await page.mouse.wheel(0, 350);
    else await page.locator(".hero-actions a").first().click();
    await expect(page.getByTestId("webora-intro")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/\bintro-running\b/);
    if (intent === "navigate") {
      await expect(page.locator(".booking-page")).toBeVisible();
      await expect(page.locator("canvas")).toHaveCount(0);
    }
  });
test("identity: delayed shader readiness reaches usable fallback within the original deadline", async ({
  page,
}) => {
  await capability(page);
  await page.addInitScript(() => {
    if (!new URLSearchParams(location.search).has("delayShader")) return;
    const extension = WebGL2RenderingContext.prototype.getExtension,
      parameter = WebGL2RenderingContext.prototype.getProgramParameter;
    WebGL2RenderingContext.prototype.getExtension = function (name: string) {
      return name === "KHR_parallel_shader_compile"
        ? { COMPLETION_STATUS_KHR: 0x91b1 }
        : extension.call(this, name);
    } as typeof extension;
    WebGL2RenderingContext.prototype.getProgramParameter = function (
      program,
      p,
    ) {
      return p === 0x91b1 ? false : parameter.call(this, program, p);
    };
  });
  await warmReplay(page);
  await page.goto("/?experience=v2&intro=1&diagnostics=1&delayShader=1", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByTestId("webora-intro")).toBeVisible();
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 5000,
  });
  await expect(page.locator(".core-fallback svg")).toBeVisible();
  await expect(page.locator(".hero-actions a").first()).toBeVisible();
  // The original intro deadline still releases the visitor immediately. Shader
  // cleanup has its separate, bounded 8s background-readiness contract.
  await expect(page.locator("canvas")).toHaveCount(0, { timeout: 10000 });
});
test("identity: denied session storage and reduced-motion fallback remain usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Denied");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Denied");
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?experience=v2");
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  await expect(page.locator(".core-fallback svg")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.locator(".hero-actions a").first().click();
  await expect(page.locator(".booking-page")).toBeVisible();
});

test("identity: unavailable storage in normal motion uses in-memory visit state", async ({
  page,
}) => {
  await capability(page);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Denied");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Denied");
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?experience=v2&diagnostics=1");
  await ready(page);
  await expect(page.getByTestId("webora-intro")).toHaveCount(0, {
    timeout: 3500,
  });
  await page.locator(".hero-actions a").first().click();
  await expect(page.locator(".booking-page")).toBeVisible();
  await page.goBack();
  await ready(page);
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  expect((await record(page))!.identity!.introDuration).toBe(0);
  expect(errors).toEqual([]);
});
test("identity: context loss during playback settles without replay after restoration", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let lost = false;
    new MutationObserver(() => {
      if (
        lost ||
        !document.querySelector('.identity-core[data-intro-phase="playing"]')
      )
        return;
      const canvas = document.querySelector("canvas"),
        gl = canvas?.getContext("webgl2"),
        extension = gl?.getExtension("WEBGL_lose_context");
      if (!extension) return;
      lost = true;
      const proof = {
        phase: "playing",
        sculptureId:
          window.__WEBORA_RUNTIME__?.records.at(-1)?.identity?.sculptureId,
        time: performance.now(),
      };
      (
        window as typeof window & { __identityLoss: typeof proof }
      ).__identityLoss = proof;
      extension.loseContext();
      setTimeout(() => extension.restoreContext(), 200);
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-intro-phase"],
    });
  });
  await capability(page);
  await seen(page);
  await warmReplay(page);
  await expect
    .poll(async () => (await record(page))?.events)
    .toContain("context-restored");
  const proof = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __identityLoss: { phase: string; sculptureId: string; time: number };
        }
      ).__identityLoss,
  );
  expect(proof.phase).toBe("playing");
  await ready(page);
  await expect(page.getByTestId("webora-intro")).toHaveCount(0);
  expect((await record(page))!.identity!.sculptureId).toBe(proof.sculptureId);
  await expect(page.locator("canvas")).toHaveCount(1);
  await writeFile(
    `${output}/intro-context-loss.json`,
    JSON.stringify({ proof, record: await record(page) }, null, 2),
  );
});
for (const [width, height] of [
  [2560, 1080],
  [844, 390],
])
  test(`identity: composition ${width}x${height}`, async ({ page }) => {
    await seen(page);
    await page.setViewportSize({ width, height });
    await page.goto("/?experience=v2&diagnostics=1");
    await page.locator(".hero-scene").scrollIntoViewIfNeeded();
    await ready(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
    await expect(page.locator(".hero-actions a").first()).toBeVisible();
    await shot(page, `identity-${width}x${height}`);
  });
test.describe("identity: touch emulation", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  test("horizontal drag rotates while vertical swipe scrolls the same surface", async ({
    page,
    context,
  }) => {
    await seen(page);
    await page.goto("/?experience=v2&diagnostics=1");
    await page.locator(".hero-scene").scrollIntoViewIfNeeded();
    await ready(page);
    const cdp = await context.newCDPSession(page);
    const box = (await page.locator(".identity-core").boundingBox())!,
      x = box.x + box.width * 0.5,
      y = box.y + box.height * 0.5;
    const swipe = async (dx: number, dy: number) => {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let i = 1; i <= 8; i++) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x + (dx * i) / 8, y: y + (dy * i) / 8 }],
        });
        await page.waitForTimeout(20);
      }
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    };
    const yaw = Number((await record(page))!.identity!.yaw);
    await swipe(100, 0);
    await expect
      .poll(async () => Number((await record(page))!.identity!.yaw))
      .not.toBe(yaw);
    const scroll = await page.evaluate(() => scrollY);
    await swipe(0, -140);
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(scroll + 30);
    await expect(page.locator(".core[data-dragging]")).toHaveCount(0);
  });
});
