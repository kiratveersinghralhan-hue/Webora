import { enquirySchema, type Enquiry } from "../../shared/enquiry";
import { campaignKeys, pageAddress } from "../lib/attribution";

const FAILED =
  "We couldn’t send your enquiry. Your details are still here. Please try again or contact us directly.";

export function formspreePayload(enquiry: Enquiry): Record<string, string> {
  const {
    website,
    utm,
    consent,
    features,
    existing_website,
    referrer,
    landing_page,
    ...fields
  } = enquiry;
  return {
    ...fields,
    // `email` is deliberately preserved for Formspree's Reply-To convention.
    features: features.join(", "),
    existing_website: existing_website ? "Yes" : "No",
    consent: consent ? "Agreed to contact about this project" : "",
    _gotcha: website,
    subject: "New project enquiry — Webora",
    ...Object.fromEntries(campaignKeys.map((key) => [key, utm[key] || ""])),
    referrer: pageAddress(referrer),
    landing_page: pageAddress(landing_page),
  };
}

export async function sendEnquiry(
  enquiry: Enquiry,
): Promise<{ received: true }> {
  const formId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim();
  if (
    !formId ||
    !/^[a-z0-9]+$/i.test(formId) ||
    /^(your|placeholder)/i.test(formId)
  )
    throw new Error(
      "Online enquiries are not connected yet. Your details are still here. Please contact Webora by WhatsApp or email.",
    );
  const validated = enquirySchema.safeParse(enquiry);
  if (!validated.success) throw new Error(FAILED);
  let response: Response;
  try {
    response = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formspreePayload(validated.data)),
      signal: AbortSignal.timeout(20000),
      redirect: "error",
      credentials: "omit",
    });
  } catch {
    // Never surface/log provider errors, request bodies or private contact data.
    throw new Error(
      "The connection was interrupted. Your details are still here. Please try again or contact Webora directly.",
    );
  }
  if (response.status === 429)
    throw new Error(
      "Too many attempts. Please wait a little before trying again, or contact Webora on WhatsApp.",
    );
  if (!response.ok) throw new Error(FAILED);
  // Formspree's AJAX contract confirms receipt with a successful HTTP response.
  // Notification/inbox delivery and autoresponses are separate dashboard actions.
  return { received: true };
}
