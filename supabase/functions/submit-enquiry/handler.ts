import type {} from "../_shared/runtime.d.ts";
import { enquirySchema } from "../_shared/enquiry.ts";
import {
  corsHeaders,
  database,
  json,
  rateKey,
  sha256,
} from "../_shared/http.ts";
import { deliverEmails } from "../_shared/emails.ts";

export async function handleEnquiry(request: Request) {
  const headers = corsHeaders(request);
  if (!headers["Access-Control-Allow-Origin"])
    return json({ error: "origin_not_allowed" }, 403);
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST")
    return json({ error: "method_not_allowed" }, 405, headers);
  if (!(request.headers.get("content-type") || "").includes("application/json"))
    return json({ error: "invalid_content_type" }, 415, headers);
  try {
    // Stream-limit the actual bytes; Content-Length may be omitted or spoofed.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "missing_body" }, 400, headers);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24000) {
        await reader.cancel();
        return json({ error: "payload_too_large" }, 413, headers);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let input: unknown;
    try {
      input = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return json({ error: "invalid_json" }, 400, headers);
    }
    const parsed = enquirySchema.safeParse(input);
    if (!parsed.success)
      return json({ error: "invalid_enquiry" }, 400, headers);
    const { consent, website, ...lead } = parsed.data;
    if (!consent || website)
      return json({ error: "invalid_enquiry" }, 400, headers);
    const payloadHash = await sha256(JSON.stringify(lead));
    const response = await database("rpc/intake_project_enquiry", {
      p_lead: lead,
      p_rate_key: await rateKey(request),
      p_payload_hash: payloadHash,
    });
    if (!response.ok) {
      console.error("enquiry_storage_failed");
      return json({ error: "storage_unavailable" }, 503, headers);
    }
    const result = await response.json();
    if (result.rate_limited)
      return json({ error: "rate_limited" }, 429, {
        ...headers,
        "Retry-After": "600",
      });
    if (result.conflict)
      return json({ error: "submission_conflict" }, 409, headers);
    if (!result.id) return json({ error: "storage_unavailable" }, 503, headers);
    // Email queue is committed in the same database transaction as the enquiry.
    // Delivery failure cannot turn a stored enquiry into a failed submission.
    EdgeRuntime.waitUntil(
      deliverEmails(result.id).catch(() =>
        console.error("enquiry_email_delivery_deferred"),
      ),
    );
    return json({ received: true }, 200, headers);
  } catch {
    console.error("enquiry_request_failed");
    return json({ error: "temporarily_unavailable" }, 503, headers);
  }
}
