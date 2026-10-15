import { projects, type ProjectStatus } from "./studio";

/** Plain-language status for search snippets (never invented outcomes). */
const statusPhrase = {
  LIVE: "Live website case study by Webora.",
  "CASE STUDY": "Website case study by Webora.",
  "IN PROGRESS": "Website in progress, designed and built by Webora.",
  CONCEPT: "Website concept explored by Webora.",
} as const satisfies Record<ProjectStatus, string>;

export function metadata(path: string) {
  const pages: Record<string, [string, string]> = {
    "/": [
      "Premium Web Design & Development Studio",
      "Webora designs and develops distinctive, responsive websites for businesses: business websites, online stores, landing pages and custom interactive experiences.",
    ],
    "/work": [
      "Website Design Work & Case Studies",
      "Explore Webora website work: Harvester Parts, Gloss Boss, VEYRATH and an editorial website in progress, with case studies and live websites.",
    ],
    "/services": [
      "Web Design & Development Services",
      "Business websites, landing pages, e-commerce, website redesigns and custom interactive experiences, each scoped around your business.",
    ],
    "/studio": [
      "About the Studio",
      "Meet the thinking behind Webora: business-first strategy, custom design and purposeful, responsive digital experiences.",
    ],
    "/start-project": [
      "Start a Website Project",
      "Tell Webora about your business and website goals in a short six-step brief, and start a considered project conversation.",
    ],
    "/privacy": [
      "Privacy Policy",
      "How Webora handles your enquiry, contact details, optional saved drafts and privacy choices.",
    ],
  };
  const project = projects.find((p) => path === `/work/${p.slug}`);
  if (project) {
    const lead =
      project.description === project.tagline
        ? project.tagline
        : `${project.tagline} ${project.description}`;
    const kind =
      project.status === "CONCEPT" ? "Website Concept" : "Website Case Study";
    return {
      title: `${project.name}: ${kind} — WEBORA`,
      description: `${lead} ${statusPhrase[project.status]}`,
    };
  }
  const [name, description] = pages[path] || [
    "Page Not Found",
    "Find your way back to the Webora studio.",
  ];
  return { title: `${name} — WEBORA`, description };
}
