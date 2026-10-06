import { afterEach, describe, expect, it, vi } from "vitest";
import { attributionFrom, pageAddress } from "../src/lib/attribution";

describe("bounded, session-only enquiry attribution", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("captures all campaign fields and strips unrelated query values", () => {
    const entry = attributionFrom(
      "https://webora.example/?utm_source=Instagram&utm_medium=social&utm_campaign=launch&utm_content=bio&utm_term=design&private=omit#secret",
      "https://instagram.com/profile?private=omit",
    );
    expect(entry).toEqual({
      source: "instagram",
      utm: {
        utm_source: "Instagram",
        utm_medium: "social",
        utm_campaign: "launch",
        utm_content: "bio",
        utm_term: "design",
      },
      referrer: "https://instagram.com/profile",
      landing_page: "https://webora.example/",
    });
  });
  it.each([
    ["https://webora.example/", "", "direct"],
    ["https://webora.example/?source=google", "", "google"],
    ["https://webora.example/?ref=partner", "", "referral"],
    ["https://webora.example/?source=campaign", "", "other"],
    ["https://webora.example/", "https://l.instagram.com/", "instagram"],
  ])("classifies %s with %s as %s", (url, referrer, source) => {
    expect(attributionFrom(url, referrer).source).toBe(source);
  });
  it("bounds stored values and removes URL credentials and non-web schemes", () => {
    expect(
      attributionFrom(
        `https://webora.example/?utm_source=${"x".repeat(300)}`,
        "",
      ).utm.utm_source,
    ).toHaveLength(200);
    expect(
      pageAddress(
        "https://user:password@webora.example/path?secret=value#secret",
      ),
    ).toBe("https://webora.example/path");
    expect(pageAddress("javascript:alert(1)")).toBe("");
    expect(pageAddress("invalid")).toBe("");
  });
  it("keeps the original landing attribution across client navigation and reload", async () => {
    vi.resetModules();
    const storage = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const location = { href: "https://webora.example/?utm_source=instagram" };
    vi.stubGlobal("window", { location });
    vi.stubGlobal("document", { referrer: "https://instagram.com/" });
    const first = await import("../src/lib/attribution");
    const entry = first.captureAttribution();
    location.href = "https://webora.example/start-project";
    expect(first.captureAttribution()).toEqual(entry);
    vi.resetModules();
    const reload = await import("../src/lib/attribution");
    expect(reload.captureAttribution()).toEqual(entry);
  });
  it("keeps an in-memory fallback when browser storage is blocked", async () => {
    vi.resetModules();
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    const location = { href: "https://webora.example/?utm_source=instagram" };
    vi.stubGlobal("window", { location });
    vi.stubGlobal("document", { referrer: "" });
    const module = await import("../src/lib/attribution");
    expect(module.captureAttribution().source).toBe("instagram");
    location.href = "https://webora.example/start-project";
    expect(module.captureAttribution().landing_page).toBe(
      "https://webora.example/",
    );
  });
});
