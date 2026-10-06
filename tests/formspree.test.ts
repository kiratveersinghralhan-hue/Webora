import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enquirySchema } from "../shared/enquiry";
import { formspreePayload, sendEnquiry } from "../src/services/enquiries";
import { validLead } from "./fixture";

const lead = enquirySchema.parse({
  ...validLead,
  source: "instagram",
  utm: {
    utm_source: "instagram",
    utm_medium: "social",
    utm_campaign: "launch",
    utm_content: "bio",
    utm_term: "studio",
    ref: "partner",
  },
  referrer: "https://www.instagram.com/webora/?private=omit#omit",
  landing_page: "https://webora.example/?utm_source=instagram#omit",
});

describe("active Formspree enquiry service — all network calls mocked", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubEnv("VITE_FORMSPREE_FORM_ID", "testfixture");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps every useful field into a readable payload, without recipient or credentials", () => {
    const payload = formspreePayload(lead);
    for (const field of [
      "full_name",
      "business_name",
      "email",
      "phone",
      "instagram",
      "business_category",
      "business_description",
      "existing_website_url",
      "project_type",
      "estimated_pages",
      "budget_range",
      "timeline",
      "additional_requirements",
      "source",
      "submission_id",
    ] as const)
      expect(payload[field]).toBe(lead[field]);
    expect(payload).toMatchObject({
      features: "Enquiry forms, WhatsApp",
      existing_website: "No",
      _gotcha: "",
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "launch",
      utm_content: "bio",
      utm_term: "studio",
      ref: "partner",
      referrer: "https://www.instagram.com/webora/",
      landing_page: "https://webora.example/",
    });
    expect(payload.consent).toContain("Agreed");
    expect(
      Object.values(payload).every((value) => typeof value === "string"),
    ).toBe(true);
    expect(JSON.stringify(payload)).not.toContain("kiratveersinghralhan");
    for (const key of ["website", "utm", "apikey", "_replyto", "to"])
      expect(payload).not.toHaveProperty(key);
    expect(
      formspreePayload({ ...lead, existing_website: true }).existing_website,
    ).toBe("Yes");
  });

  it("only confirms after a successful AJAX response from the fixed endpoint", async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((done) => {
        resolve = done;
      }),
    );
    let confirmed = false;
    const pending = sendEnquiry(lead).then((result) => {
      confirmed = true;
      return result;
    });
    await Promise.resolve();
    expect(confirmed).toBe(false);
    resolve(new Response('{"ok":true}', { status: 200 }));
    await expect(pending).resolves.toEqual({ received: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://formspree.io/f/testfixture");
    expect(options).toMatchObject({
      method: "POST",
      credentials: "omit",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(options.body)).toEqual(formspreePayload(lead));
  });

  it.each([400, 403, 404, 422, 500, 503])(
    "retains a professional error for provider rejection %i",
    async (status) => {
      fetchMock.mockResolvedValue(
        new Response(
          '{"errors":[{"message":"PRIVATE PROVIDER DETAIL alex@example.com"}]}',
          { status },
        ),
      );
      await expect(sendEnquiry(lead)).rejects.toThrow(
        "Your details are still here",
      );
      await expect(sendEnquiry(lead)).rejects.not.toThrow(
        "PRIVATE PROVIDER DETAIL",
      );
    },
  );
  it("does not invent a rate-limit duration", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 429 }));
    await expect(sendEnquiry(lead)).rejects.toThrow("wait a little");
  });
  it.each(["TypeError", "TimeoutError", "AbortError"])(
    "handles %s without exposing its raw message",
    async (name) => {
      fetchMock.mockRejectedValue(
        Object.assign(new Error("PRIVATE BODY"), { name }),
      );
      await expect(sendEnquiry(lead)).rejects.toThrow(
        "connection was interrupted",
      );
      await expect(sendEnquiry(lead)).rejects.not.toThrow("PRIVATE BODY");
    },
  );
  it.each([
    "",
    "your_form_id_here",
    "https://formspree.io/f/anything",
    "../other",
    "placeholder",
  ])(
    "does not make a request with missing/invalid configuration %s",
    async (value) => {
      vi.stubEnv("VITE_FORMSPREE_FORM_ID", value);
      await expect(sendEnquiry(lead)).rejects.toThrow("not connected yet");
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
  it("rejects invalid input and filled honeypots before any request", async () => {
    await expect(sendEnquiry({ ...lead, website: "spam" })).rejects.toThrow(
      "couldn’t send",
    );
    await expect(sendEnquiry({ ...lead, email: "invalid" })).rejects.toThrow(
      "couldn’t send",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
