import { deliverEmails } from "../_shared/emails.ts";
import { json, sha256 } from "../_shared/http.ts";

Deno.serve(async (request: Request) => {
  if (request.method !== "POST")
    return json({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("EMAIL_WORKER_SECRET");
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  if (!secret || secret.length < 32)
    return json({ error: "worker_not_configured" }, 503);
  // Compare fixed-length digests to avoid disclosing prefix matches.
  const expectedHash = await sha256(secret),
    suppliedHash = await sha256(supplied);
  let difference = 0;
  for (let i = 0; i < expectedHash.length; i++)
    difference |= expectedHash.charCodeAt(i) ^ suppliedHash.charCodeAt(i);
  if (difference !== 0) return json({ error: "unauthorized" }, 401);
  try {
    return json(await deliverEmails());
  } catch {
    console.error("email_worker_failed");
    return json({ error: "temporarily_unavailable" }, 503);
  }
});
