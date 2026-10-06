import { z } from "zod";

export const projectTypes = [
  "Business website",
  "Landing page",
  "E-commerce",
  "Portfolio",
  "Website redesign",
  "Custom interactive website",
  "Not sure",
] as const;
export const pageCounts = ["1", "2–5", "6–10", "10+", "Not sure"] as const;
export const featureOptions = [
  "Enquiry forms",
  "WhatsApp",
  "Payments",
  "E-commerce",
  "Booking",
  "Product catalogue",
  "Blog / CMS",
  "Maps",
  "Customer accounts",
  "Admin / dashboard",
  "Animations",
  "Interactive 3D",
  "SEO foundations",
  "Analytics",
  "Other",
  "Not sure",
] as const;
export const timelines = [
  "ASAP",
  "2–4 weeks",
  "1–2 months",
  "2+ months",
  "Flexible / unsure",
] as const;
// These are qualification preferences, not a public price list.
export const budgetOptions = [
  "Recommend a budget",
  "I have a budget in mind",
  "Let’s discuss the scope first",
] as const;
export const categories = [
  "Retail / fashion",
  "Restaurant / café",
  "Real estate",
  "Automotive",
  "Professional services",
  "Health / beauty",
  "Personal brand",
  "Startup",
  "Other",
] as const;
const text = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .min(min, message)
    .max(max, `Keep this under ${max} characters.`);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => !v || /^https?:\/\/[^\s]+$/i.test(v),
    "Use a full URL starting with https://.",
  );

export const enquirySchema = z
  .object({
    full_name: text(2, 100, "Please enter your full name."),
    business_name: text(2, 150, "Please enter your business or brand name."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address.")
      .max(254),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (v) =>
          /^[+\d\s().-]+$/.test(v) &&
          v.replace(/\D/g, "").length >= 7 &&
          v.replace(/\D/g, "").length <= 15,
        "Enter a valid phone number, including your country code.",
      ),
    instagram: optionalUrl,
    business_category: z.enum(categories, {
      error: "Choose your business category.",
    }),
    business_description: text(
      15,
      2000,
      "Tell us a little more about your business (at least 15 characters).",
    ),
    existing_website: z.boolean(),
    existing_website_url: optionalUrl,
    project_type: z.enum(projectTypes, { error: "Choose a project type." }),
    estimated_pages: z.enum(pageCounts, {
      error: "Choose an estimated page count.",
    }),
    features: z
      .array(z.enum(featureOptions))
      .min(1, "Choose a feature, or select Not sure.")
      .max(featureOptions.length)
      .refine((v) => new Set(v).size === v.length, "Choose each feature once."),
    budget_range: z.enum(budgetOptions, {
      error: "Choose a budget preference.",
    }),
    timeline: z.enum(timelines, { error: "Choose your preferred timeline." }),
    additional_requirements: z.string().trim().max(4000),
    source: z
      .enum(["instagram", "direct", "referral", "google", "other"])
      .default("direct"),
    utm: z
      .record(z.string().max(50), z.string().max(200))
      .refine((v) => Object.keys(v).length <= 6)
      .default({}),
    referrer: z.string().max(500).default(""),
    landing_page: z.string().max(500).default(""),
    consent: z.literal(true, {
      error: "Please agree so we can contact you about your project.",
    }),
    website: z.string().max(0),
    submission_id: z.uuid(),
  })
  .refine((v) => !v.existing_website || !!v.existing_website_url, {
    path: ["existing_website_url"],
    message: "Add your current website URL.",
  });

export type Enquiry = z.infer<typeof enquirySchema>;
export type Draft = Omit<
  Enquiry,
  | "consent"
  | "business_category"
  | "project_type"
  | "estimated_pages"
  | "budget_range"
  | "timeline"
> & {
  consent: boolean;
  business_category: string;
  project_type: string;
  estimated_pages: string;
  budget_range: string;
  timeline: string;
};
export const stepFields: (keyof Draft)[][] = [
  ["full_name", "business_name", "email", "phone", "instagram"],
  [
    "business_category",
    "business_description",
    "existing_website",
    "existing_website_url",
  ],
  ["project_type", "estimated_pages"],
  ["features"],
  ["budget_range", "timeline", "additional_requirements"],
  ["consent"],
];
export function validateStep(
  draft: Draft,
  step: number,
): Record<string, string> {
  const result = enquirySchema.safeParse(draft);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues
      .filter((i) => stepFields[step].includes(i.path[0] as keyof Draft))
      .map((i) => [i.path[0], i.message]),
  );
}
