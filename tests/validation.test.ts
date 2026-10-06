import { describe, expect, it } from "vitest";
import { enquirySchema, validateStep, type Draft } from "../shared/enquiry";
import { validLead } from "./fixture";
describe("enquiry validation", () => {
  it("normalizes contact fields and strips untrusted status", () => {
    const result = enquirySchema.parse({
      ...validLead,
      full_name: "  Alex Example ",
      email: "ALEX@EXAMPLE.COM",
      status: "won",
    });
    expect(result.full_name).toBe("Alex Example");
    expect(result.email).toBe("alex@example.com");
    expect(result).not.toHaveProperty("status");
  });
  it.each([
    { email: "broken" },
    { phone: "123" },
    { phone: "abcdefg" },
    { business_description: "too short" },
    { existing_website: true },
    { existing_website_url: "javascript:alert(1)" },
    { instagram: "instagram.com/example" },
    { project_type: "unknown" },
    { features: [] },
    { features: ["Enquiry forms", "Enquiry forms"] },
    { consent: false },
    { website: "bot" },
    { submission_id: "invalid" },
    { additional_requirements: "x".repeat(4001) },
    { utm: { a: "x".repeat(201) } },
  ])("rejects invalid inputs %j", (change) => {
    expect(enquirySchema.safeParse({ ...validLead, ...change }).success).toBe(
      false,
    );
  });
  it("shows only errors belonging to the active step", () => {
    const errors = validateStep(
      {
        ...validLead,
        full_name: "",
        business_description: "",
        features: [],
      } as Draft,
      0,
    );
    expect(Object.keys(errors)).toEqual(["full_name"]);
  });
  it("accepts a valid existing website", () => {
    expect(
      enquirySchema.safeParse({
        ...validLead,
        existing_website: true,
        existing_website_url: "https://example.com",
      }).success,
    ).toBe(true);
  });
});
