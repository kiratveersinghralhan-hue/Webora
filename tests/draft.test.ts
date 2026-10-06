import { describe, expect, it } from "vitest";
import { restoreDraft } from "../src/lib/draft";
describe("untrusted browser draft restoration", () => {
  it("drops invalid types and unknown fields", () => {
    expect(
      restoreDraft({
        full_name: null,
        features: ["Enquiry forms", {}, "Unknown", "Enquiry forms"],
        consent: true,
        status: "won",
        submission_id: "bad",
      }),
    ).toEqual({ features: ["Enquiry forms"] });
  });
  it("bounds text and campaign data", () => {
    const restored = restoreDraft({
      full_name: "x".repeat(600),
      utm: { utm_source: "x".repeat(300), invalid: 20 },
    });
    expect(restored.full_name?.length).toBe(500);
    expect(restored.utm?.utm_source.length).toBe(200);
    expect(restored.utm).not.toHaveProperty("invalid");
  });
  it("ignores non-object storage", () => {
    expect(restoreDraft(null)).toEqual({});
    expect(restoreDraft("broken")).toEqual({});
  });
});
