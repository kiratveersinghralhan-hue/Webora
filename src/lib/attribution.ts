import type { Enquiry } from "../../shared/enquiry";

const KEY = "webora-entry-v1";
export const campaignKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
] as const;
export type Attribution = Pick<
  Enquiry,
  "source" | "utm" | "referrer" | "landing_page"
>;
let entry: Attribution | undefined;

/** Keep the origin/path only: no fragments, query parameters or credentials. */
export function pageAddress(value: string): string {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol)
      ? `${url.origin}${url.pathname}`.slice(0, 500)
      : "";
  } catch {
    return "";
  }
}

export function attributionFrom(url: string, referrer: string): Attribution {
  const params = new URL(url).searchParams;
  const utm = Object.fromEntries(
    campaignKeys
      .filter((key) => params.has(key))
      .map((key) => [key, params.get(key)!.slice(0, 200)]),
  );
  const hint = (
    params.get("utm_source") ||
    params.get("source") ||
    referrer
  ).toLowerCase();
  const source = hint.includes("instagram")
    ? "instagram"
    : hint.includes("google")
      ? "google"
      : params.has("ref") || referrer
        ? "referral"
        : hint
          ? "other"
          : "direct";
  return {
    source,
    utm,
    referrer: pageAddress(referrer),
    landing_page: pageAddress(url),
  };
}

/** First entry per tab session; called before React can navigate away from it. */
export function captureAttribution(): Attribution {
  if (entry) return entry;
  const current = attributionFrom(window.location.href, document.referrer);
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (
      saved &&
      typeof saved === "object" &&
      typeof saved.landing_page === "string"
    ) {
      const source = [
        "instagram",
        "google",
        "referral",
        "other",
        "direct",
      ].includes(saved.source)
        ? (saved.source as Attribution["source"])
        : "direct";
      const utm = Object.fromEntries(
        campaignKeys
          .filter((key) => typeof saved.utm?.[key] === "string")
          .map((key) => [key, saved.utm[key].slice(0, 200)]),
      );
      entry = {
        source,
        utm,
        referrer: pageAddress(saved.referrer),
        landing_page: pageAddress(saved.landing_page),
      };
    }
  } catch {
    /* Session storage is optional. Keep the in-memory entry. */
  }
  entry ??= current;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(entry));
  } catch {
    /* optional */
  }
  return entry;
}
