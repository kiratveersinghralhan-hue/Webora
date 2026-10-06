import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { handleEnquiry } from "../supabase/functions/submit-enquiry/handler";
import { deliverEmails } from "../supabase/functions/_shared/emails";
import { validLead } from "./fixture";

const env: Record<string, string> = {
  ALLOWED_ORIGINS: "https://webora.example",
  RATE_LIMIT_SALT: "local-test-fixture-".repeat(4),
  SUPABASE_URL: "https://database.example.invalid",
  SUPABASE_SERVICE_ROLE_KEY: "server-test-fixture",
};
const request = (
  body: unknown = validLead,
  options: { origin?: string; method?: string; raw?: string } = {},
) =>
  new Request("https://edge.example.invalid", {
    method: options.method || "POST",
    headers: {
      origin: options.origin || "https://webora.example",
      "Content-Type": "application/json",
      "x-forwarded-for": "192.0.2.1",
    },
    body:
      options.method === "GET" || options.method === "OPTIONS"
        ? undefined
        : (options.raw ?? JSON.stringify(body)),
  });
beforeEach(() => {
  vi.stubGlobal("Deno", { env: { get: (key: string) => env[key] } });
  vi.stubGlobal("EdgeRuntime", {
    waitUntil: (promise: Promise<unknown>) => promise.catch(() => {}),
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  delete env.RESEND_API_KEY;
  delete env.RESEND_FROM;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("public Edge intake with all outbound network mocked", () => {
  it("rejects unwanted origins before database access", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(
      (
        await handleEnquiry(
          request(validLead, { origin: "https://attacker.example" }),
        )
      ).status,
    ).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("handles preflight and disallows GET", async () => {
    expect(
      (await handleEnquiry(request(undefined, { method: "OPTIONS" }))).status,
    ).toBe(204);
    expect(
      (await handleEnquiry(request(undefined, { method: "GET" }))).status,
    ).toBe(405);
  });
  it.each([
    { email: "bad" },
    { website: "spam" },
    { consent: false },
    { features: ["Unknown"] },
  ])("rejects invalid bodies %j without storage", async (change) => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(
      (await handleEnquiry(request({ ...validLead, ...change }))).status,
    ).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects oversized streamed bodies and invalid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn());
    expect(
      (await handleEnquiry(request(undefined, { raw: "x".repeat(24001) })))
        .status,
    ).toBe(413);
    expect(
      (await handleEnquiry(request(undefined, { raw: "{invalid" }))).status,
    ).toBe(400);
  });
  it("only returns a generic receipt after committed storage", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json({ id: crypto.randomUUID() }));
    vi.stubGlobal("fetch", fetcher);
    const response = await handleEnquiry(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    const sent = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(sent.p_rate_key).toHaveLength(64);
    expect(JSON.stringify(sent)).not.toContain("192.0.2.1");
    expect(sent.p_lead).not.toHaveProperty("consent");
  });
  it.each([
    [{ rate_limited: true }, 429],
    [{ conflict: true }, 409],
    [{}, 503],
  ])("maps intake outcome %j to status %s", async (result, status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(result)));
    expect((await handleEnquiry(request())).status).toBe(status);
  });
  it("does not report success when storage fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );
    expect((await handleEnquiry(request())).status).toBe(503);
  });
});
describe("durable email delivery", () => {
  it("keeps jobs pending without email credentials", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await deliverEmails()).toEqual({ sent: 0, configured: false });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("escapes lead content, uses provider idempotency and leases the update", async () => {
    env.RESEND_API_KEY = "email-test-fixture";
    env.RESEND_FROM = "Webora <projects@example.invalid>";
    const job = {
      id: crypto.randomUUID(),
      enquiry_id: crypto.randomUUID(),
      lease_token: crypto.randomUUID(),
      kind: "client",
      attempts: 1,
      enquiry: { ...validLead, full_name: "<script>alert(1)</script>" },
    };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json([job]))
      .mockResolvedValueOnce(Response.json({ id: "provider-test-id" }))
      .mockResolvedValueOnce(Response.json([]));
    vi.stubGlobal("fetch", fetcher);
    expect((await deliverEmails()).sent).toBe(1);
    const email = JSON.parse(fetcher.mock.calls[1][1].body);
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(fetcher.mock.calls[1][1].headers["Idempotency-Key"]).toBe(
      `webora-${job.id}`,
    );
    expect(fetcher.mock.calls[2][0]).toContain(
      `lease_token=eq.${job.lease_token}`,
    );
    expect(JSON.parse(fetcher.mock.calls[2][1].body).status).toBe("sent");
  });
  it("reschedules provider failures without losing a lead", async () => {
    env.RESEND_API_KEY = "email-test-fixture";
    env.RESEND_FROM = "Webora <projects@example.invalid>";
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json([
          {
            id: crypto.randomUUID(),
            enquiry_id: crypto.randomUUID(),
            lease_token: crypto.randomUUID(),
            kind: "studio",
            attempts: 2,
            enquiry: validLead,
          },
        ]),
      )
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(Response.json([]));
    vi.stubGlobal("fetch", fetcher);
    expect((await deliverEmails()).sent).toBe(0);
    expect(JSON.parse(fetcher.mock.calls[2][1].body).status).toBe("pending");
  });
});
