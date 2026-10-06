import { database } from "./http.ts";

type Job = {
  id: string;
  enquiry_id: string;
  kind: "studio" | "client";
  lease_token: string;
  attempts: number;
  enquiry: Record<string, unknown>;
};
function escapeHtml(value: unknown) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}
function message(job: Job) {
  const lead = job.enquiry;
  const name = escapeHtml(lead.full_name);
  if (job.kind === "client")
    return {
      to: [String(lead.email)],
      subject: "Your project enquiry — Webora",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#20202c"><h2>WEBORA</h2><h1>Project received.</h1><p>Thanks, ${name}. We’ve received your enquiry for ${escapeHtml(lead.business_name)}.</p><p>We’ll review your requirements and contact you using the details you provided.</p><p>Have something to add? Reply to this email or <a href="https://wa.me/919814800017">message Webora on WhatsApp</a>.</p><p>Webora · Web Design Studio<br/>+91 98148 00017</p></div>`,
    };
  const rows = [
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
    "features",
    "budget_range",
    "timeline",
    "additional_requirements",
    "source",
  ];
  return {
    to: ["kiratveersinghralhan@gmail.com"],
    subject: "New project enquiry — Webora",
    html: `<h2>New Webora project enquiry</h2><table>${rows.map((key) => `<tr><th style="text-align:left;vertical-align:top;padding:8px">${escapeHtml(key.replaceAll("_", " "))}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(Array.isArray(lead[key]) ? (lead[key] as string[]).join(", ") : lead[key])}</td></tr>`).join("")}</table>`,
  };
}
export async function deliverEmails(enquiryId?: string) {
  const key = Deno.env.get("RESEND_API_KEY"),
    from = Deno.env.get("RESEND_FROM");
  // Jobs stay queued if credentials are absent, never pretend delivery succeeded.
  if (!key || !from) return { sent: 0, configured: false };
  const response = await database("rpc/claim_enquiry_emails", {
    p_enquiry_id: enquiryId || null,
    p_limit: 8,
  });
  if (!response.ok) throw new Error("email_queue_unavailable");
  const jobs = (await response.json()) as Job[];
  let sent = 0;
  for (const job of jobs) {
    let succeeded = false;
    try {
      const result = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `webora-${job.id}`,
        },
        body: JSON.stringify({
          ...message(job),
          from,
          reply_to: "kiratveersinghralhan@gmail.com",
        }),
        signal: AbortSignal.timeout(10000),
      });
      succeeded = result.ok;
    } catch {
      /* Do not log email addresses, payloads or provider errors. */
    }
    const status = succeeded
      ? "sent"
      : job.attempts >= 8
        ? "failed"
        : "pending";
    const update = await database(
      `enquiry_email_jobs?id=eq.${job.id}&lease_token=eq.${job.lease_token}&status=eq.processing`,
      {
        status,
        sent_at: succeeded ? new Date().toISOString() : null,
        next_attempt_at: new Date(
          Date.now() + Math.min(3600, 30 * 2 ** job.attempts) * 1000,
        ).toISOString(),
        lease_token: null,
        lease_until: null,
      },
      "PATCH",
    );
    if (!update.ok) throw new Error("email_queue_update_failed");
    if (succeeded) sent++;
  }
  return { sent, configured: true };
}
