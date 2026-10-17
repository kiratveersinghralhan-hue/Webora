import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three/src/Three.js";
import { enquirySchema, validateStep } from "../shared/enquiry";
import { formspreePayload } from "../src/services/enquiries";
import {
  applyGift,
  findGift,
  giftComparison,
  giftPackages,
} from "../src/data/diwali";
import {
  createDiyaGeometry,
  diyaRadiusScale,
} from "../src/three/geometry/diyaGeometry";
import { DiyaLights, FLICKER_WINDOW } from "../src/three/scenes/DiyaLights";
import { AssetRegistry } from "../src/three/runtime/AssetRegistry";
import { metadata } from "../src/data/seo";
import { validLead } from "./fixture";

afterEach(() => vi.unstubAllGlobals());

describe("Diwali Edition Memory Gifts", () => {
  it("offers exactly the three priced editions, each with a valid comparison column", () => {
    expect(giftPackages.map((g) => [g.name, g.price, g.priceValue])).toEqual([
      ["Little Moments", "₹999", 999],
      ["Our Story", "₹2,499", 2499],
      ["Forever Edition", "₹4,999", 4999],
    ]);
    expect(new Set(giftPackages.map((g) => g.id)).size).toBe(3);
    for (const row of giftComparison) expect(row).toHaveLength(4);
    expect(findGift("our-story")?.name).toBe("Our Story");
    expect(findGift("free")).toBeUndefined();
    expect(findGift(null)).toBeUndefined();
  });

  it("pre-fills a gift brief that validates and reaches Formspree with the edition noted", () => {
    const gift = findGift("forever-edition")!;
    const draft = applyGift(
      {
        ...validLead,
        business_name: "My grandparents",
        business_category: "",
        project_type: "",
        estimated_pages: "",
        features: [],
        additional_requirements: "Please include the 1976 photographs.",
        referrer: "",
        landing_page: "",
        consent: false,
      } as never,
      gift,
    );
    expect(validateStep(draft, 1)).toEqual({});
    expect(validateStep(draft, 2)).toEqual({});
    expect(validateStep(draft, 3)).toEqual({});
    expect(draft.additional_requirements).toBe(
      "Diwali Memory Gift: Forever Edition (₹4,999).\nPlease include the 1976 photographs.",
    );
    // Switching edition replaces the note instead of stacking a second one.
    const switched = applyGift(draft, findGift("little-moments"));
    expect(
      switched.additional_requirements.match(/Diwali Memory Gift/g),
    ).toHaveLength(1);
    expect(switched.additional_requirements).toContain("Little Moments (₹999)");
    const lead = enquirySchema.parse({ ...switched, consent: true });
    expect(formspreePayload(lead).additional_requirements).toContain(
      "Diwali Memory Gift: Little Moments (₹999).",
    );
  });

  it("leaves an ordinary business brief untouched", () => {
    const draft = { ...validLead, referrer: "", landing_page: "" } as never;
    expect(applyGift(draft, undefined)).toBe(draft);
  });

  it("has indexable metadata for the gifts route", () => {
    const { title, description } = metadata("/diwali-gifts");
    expect(title).toContain("Diwali Memory Gifts");
    expect(description).toContain("₹999");
  });
});

describe("Diwali Edition clay diyas", () => {
  it("builds a closed, finite, seamless teardrop with a pinched spout", () => {
    const geometry = createDiyaGeometry(48);
    const positions = geometry.getAttribute("position");
    expect(geometry.index).not.toBeNull();
    expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
    expect(geometry.getAttribute("color").count).toBe(positions.count);
    // The spout (+z) reaches well beyond the back of the bowl.
    expect(diyaRadiusScale(0)).toBeGreaterThan(diyaRadiusScale(Math.PI) * 1.5);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    expect(box.max.z).toBeGreaterThan(-box.min.z * 1.4);
    expect(box.min.y).toBe(0);
    geometry.dispose();
  });

  it("lights in sequence, flickers for a bounded window, then stops asking for frames", () => {
    vi.stubGlobal("document", {
      createElement: () => ({ getContext: () => null }),
    });
    const assets = new AssetRegistry();
    let serial = 0;
    const releases: (() => void)[] = [];
    const own = <T extends { dispose(): void }>(resource: T) => {
      const lease = assets.acquire(`diya/${++serial}`, () => resource);
      releases.push(lease.release);
      return lease.value;
    };
    const lamps = new DiyaLights(own, "balanced");
    const flames = () =>
      lamps.group.children
        .filter((child) => child instanceof THREE.Group)
        .map((diya) => diya.children.at(-1)!);
    expect(flames()).toHaveLength(5);
    lamps.update(0, 0, true);
    expect(flames().every((flame) => !flame.visible)).toBe(true);
    lamps.update(100, 0.45, true);
    const lit = flames().map((flame) => flame.visible);
    expect(lit[0]).toBe(true);
    expect(lit.at(-1)).toBe(false);
    expect(lamps.update(200, 1, false)).toBe(true);
    expect(flames().every((flame) => flame.visible)).toBe(true);
    // Without a new reason to move, the window closes on a lit, resting pose.
    expect(lamps.update(100 + FLICKER_WINDOW + 1, 1, false)).toBe(false);
    expect(flames().every((f) => f.rotation.z === 0 && f.visible)).toBe(true);
    // Pointer movement re-kindles a shorter flicker.
    expect(
      lamps.update(20000, 1, false, { nx: 0.2, ny: 0.1, active: true }),
    ).toBe(true);
    releases.forEach((release) => release());
    expect(assets.size).toBe(0);
  });
});
