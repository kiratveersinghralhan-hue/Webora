import { featureOptions, type Draft } from "../../shared/enquiry";

/** Browser storage is untrusted and may contain older or damaged drafts. */
export function restoreDraft(input: unknown): Partial<Draft> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const values = input as Record<string, unknown>;
  const restored: Partial<Draft> = {};
  const strings = [
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
    "referrer",
    "landing_page",
  ] as const;
  for (const field of strings)
    if (typeof values[field] === "string")
      restored[field] = values[field].slice(
        0,
        field === "additional_requirements"
          ? 4000
          : field === "business_description"
            ? 2000
            : 500,
      );
  if (typeof values.existing_website === "boolean")
    restored.existing_website = values.existing_website;
  if (Array.isArray(values.features))
    restored.features = [
      ...new Set(
        values.features.filter((value): value is Draft["features"][number] =>
          featureOptions.includes(value),
        ),
      ),
    ];
  if (
    typeof values.submission_id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      values.submission_id,
    )
  )
    restored.submission_id = values.submission_id;
  if (
    ["instagram", "direct", "referral", "google", "other"].includes(
      String(values.source),
    )
  )
    restored.source = values.source as Draft["source"];
  if (
    values.utm &&
    typeof values.utm === "object" &&
    !Array.isArray(values.utm)
  )
    restored.utm = Object.fromEntries(
      Object.entries(values.utm)
        .filter(([key, value]) => key.length <= 50 && typeof value === "string")
        .slice(0, 6)
        .map(([key, value]) => [key, (value as string).slice(0, 200)]),
    );
  return restored;
}
