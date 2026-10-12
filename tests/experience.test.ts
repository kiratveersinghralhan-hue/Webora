import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("releases V2 on the public production hostname and ignores local comparison overrides", async () => {
  vi.stubGlobal("window", {});
  vi.stubGlobal("location", {
    hostname: "webora.design",
    search: "?experience=v1",
  });
  vi.stubGlobal("sessionStorage", { getItem: () => "v2" });
  const { isV2Experience, isLocalPreview } =
    await import("../src/lib/experience");
  expect(isLocalPreview()).toBe(false);
  expect(isV2Experience()).toBe(true);
});

it("allows explicit local selection when optional session storage is denied", async () => {
  vi.stubGlobal("window", {});
  vi.stubGlobal("location", {
    hostname: "127.0.0.1",
    search: "?experience=v2",
  });
  vi.stubGlobal("sessionStorage", {
    setItem: () => {
      throw new Error("denied");
    },
  });
  const { isV2Experience } = await import("../src/lib/experience");
  expect(isV2Experience()).toBe(true);
});

it("prerenders the released V2 experience", async () => {
  vi.stubGlobal("window", undefined);
  const { isV2Experience } = await import("../src/lib/experience");
  expect(isV2Experience()).toBe(true);
});
