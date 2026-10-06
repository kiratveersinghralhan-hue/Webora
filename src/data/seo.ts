import { projects } from "./studio";
export function metadata(path: string) {
  const pages: Record<string, [string, string]> = {
    "/": [
      "Premium Web Design Studio",
      "Premium websites for businesses ready to look the part. Strategy, design and development by Webora.",
    ],
    "/work": [
      "Selected Work",
      "Explore Webora website work: Harvester Parts, Gloss Boss, VEYRATH and an editorial website in progress.",
    ],
    "/services": [
      "Services",
      "Business websites, landing pages, e-commerce, redesigns and custom interactive experiences, scoped around your business.",
    ],
    "/studio": [
      "The Studio",
      "Meet the thinking behind Webora: business-first strategy, custom design and purposeful digital experiences.",
    ],
    "/start-project": [
      "Start a Project",
      "Tell Webora about your business and website goals. Start a considered project conversation with a simple six-step brief.",
    ],
    "/privacy": [
      "Privacy",
      "How Webora handles your enquiry, contact details, optional saved drafts and privacy choices.",
    ],
  };
  const project = projects.find((p) => path === `/work/${p.slug}`);
  const [name, description] = project
    ? [
        project.name,
        `${project.tagline} ${project.description} Status: ${project.status}.`,
      ]
    : pages[path] || [
        "Page Not Found",
        "Find your way back to the Webora studio.",
      ];
  return { title: `${name} — WEBORA`, description };
}
