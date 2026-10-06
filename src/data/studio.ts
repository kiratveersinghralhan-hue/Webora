export const contact = {
  email: "kiratveersinghralhan@gmail.com",
  phone: "+91 98148 00017",
  whatsapp:
    "https://wa.me/919814800017?text=Hello%20Webora%2C%20I%27m%20interested%20in%20discussing%20a%20website%20project.",
  instagram: "https://www.instagram.com/webora.web.design/",
};
export const services = [
  {
    name: "Business websites",
    detail: "A digital home that makes your business feel as good as it is.",
    deliverables:
      "Brand-led design · Clear service pages · Enquiry journey · Responsive development",
    shape: "presence",
  },
  {
    name: "Landing pages",
    detail: "One focused page. One clear offer. A purposeful path to action.",
    deliverables:
      "Campaign strategy · Persuasive content structure · Focused calls to action · Analytics foundations",
    shape: "landing",
  },
  {
    name: "E-commerce",
    detail:
      "Turn browsing into a shopping experience people want to return to.",
    deliverables:
      "Product discovery · Catalogue design · Checkout integration · Store management",
    shape: "commerce",
  },
  {
    name: "Portfolio & personal brands",
    detail:
      "Your work, your story, and a presence that feels unmistakably you.",
    deliverables:
      "Editorial storytelling · Work presentation · Personal identity · Contact experience",
    shape: "portfolio",
  },
  {
    name: "Website redesign",
    detail: "Keep what works. Rethink what holds your business back.",
    deliverables:
      "Experience audit · Information architecture · Visual refresh · Responsive rebuild",
    shape: "redesign",
  },
  {
    name: "Custom interactive websites",
    detail:
      "Distinctive digital experiences that people feel, explore and remember.",
    deliverables:
      "Creative direction · Spatial interfaces · Purposeful motion · Performance engineering",
    shape: "interactive",
  },
];
export const process = [
  [
    "Discover",
    "The right questions first.",
    "Your business, audience, goals and requirements give the project its foundation.",
  ],
  [
    "Direction",
    "A shared vision.",
    "We define the structure, strategy and visual direction before the details.",
  ],
  [
    "Design",
    "Make it unmistakably yours.",
    "Key interfaces turn the direction into a complete, considered digital experience.",
  ],
  [
    "Develop",
    "Bring the idea to life.",
    "Responsive engineering and purposeful interactions connect every detail.",
  ],
  [
    "Refine",
    "The details make the difference.",
    "We test real devices, review content and polish the experience.",
  ],
  [
    "Launch",
    "Ready for the real world.",
    "Final QA, domain configuration and deployment bring your new presence online.",
  ],
];
export const engagements = [
  [
    "Essential web presence",
    "A considered introduction to your business.",
    "Core pages, responsive design, contact flow and SEO foundations.",
  ],
  [
    "Business growth website",
    "A deeper experience built around your offer.",
    "Service architecture, conversion journeys, content structure and tailored integrations.",
  ],
  [
    "E-commerce",
    "A storefront with a point of view.",
    "Product catalogue, shopping journey, secure payment integration and store management.",
  ],
  [
    "Custom digital experience",
    "For an ambition beyond the expected.",
    "Original art direction, interactive storytelling, spatial design and custom development.",
  ],
];
const conceptProjects = [
  {
    slug: "form-and-field",
    name: "Form & Field",
    category: "Architecture & interiors",
    type: "Concept Project",
    number: "01",
    theme: "architecture",
    tagline: "Space to make an impression.",
    overview:
      "An independent design exploration for an imagined architecture practice. An editorial approach gives the spaces room to breathe and makes the studio’s philosophy easy to understand.",
    problem:
      "Explore how an architecture studio can communicate its approach and present a body of work without overwhelming the visitor.",
    approach:
      "A quiet palette, oversized typography and a deliberate project hierarchy create a clear journey from discovery to enquiry.",
    direction:
      "Warm stone tones, architectural geometry and generous negative space.",
    development:
      "A responsive interface study with reusable project layouts and a direct enquiry pathway. This is a design concept, not a deployed client website.",
    features: [
      "Editorial project presentation",
      "Studio storytelling",
      "Responsive compositions",
      "Clear enquiry journey",
    ],
  },
  {
    slug: "off-script",
    name: "Off Script",
    category: "Fashion & e-commerce",
    type: "Concept Project",
    number: "02",
    theme: "fashion",
    tagline: "An identity that refuses to blend in.",
    overview:
      "An independent storefront exploration for an imagined clothing label. Bold art direction meets a straightforward shopping structure.",
    problem:
      "Explore a shopping experience where a distinctive brand identity supports product discovery instead of competing with it.",
    approach:
      "Strong contrast and a campaign-led opening lead into a focused collection layout with readable product information.",
    direction:
      "Acid green, ink black and sculptural apparel forms, paired with an expressive typographic voice.",
    development:
      "A responsive storefront design study. Payments, catalogue inventory and customer accounts are proposed scope, not live integrations in this concept.",
    features: [
      "Collection discovery",
      "Campaign-led storytelling",
      "Product layout system",
      "Mobile shopping direction",
    ],
  },
] as const;

export type ProjectStatus = "LIVE" | "CASE STUDY" | "IN PROGRESS" | "CONCEPT";
export interface Project {
  slug: string;
  name: string;
  category: string;
  status: ProjectStatus;
  number: string;
  theme: string;
  tagline: string;
  description: string;
  overview: string;
  problem: string;
  approach: string;
  direction: string;
  development: string;
  features: readonly string[];
  services: readonly string[];
  websiteUrl: string | null;
  image: string | null;
  imageNote: string;
  featured: boolean;
  caseStudy: boolean;
  year: number | null;
}
/** Facts/URLs and captures reused from the supplied previous portfolio. No inferred launch claims. */
export const projects: Project[] = [
  {
    slug: "harvester-parts",
    name: "Harvester Parts",
    category: "Agricultural marketplace",
    status: "LIVE",
    number: "01",
    theme: "industrial",
    tagline: "A specialist world. A clear way in.",
    description:
      "A website and product catalogue for agricultural machinery and spare parts.",
    overview:
      "A specialist catalogue brought into a focused web experience, helping farmers, dealers and workshops find their way to machinery and parts.",
    problem:
      "Make a specialist catalogue approachable without losing the detail buyers need.",
    approach:
      "Organize product discovery around clear categories and a credible business presence.",
    direction:
      "Practical navigation, clear product hierarchy and a focused industrial identity.",
    development:
      "The public marketplace website is available. This presentation describes the website and catalogue experience; it does not claim verified payment or fulfilment operations.",
    features: [
      "Product discovery",
      "Machinery and parts categories",
      "Responsive marketplace interface",
    ],
    services: ["Web design", "Catalogue experience", "B2B presentation"],
    websiteUrl: "https://harvesterparts.in",
    image: "/projects/screen-harvesterparts.webp",
    imageNote: "Actual website capture · September 2026",
    featured: true,
    caseStudy: true,
    year: null,
  },
  {
    slug: "veyrath",
    name: "VEYRATH",
    category: "Fashion / E-commerce",
    status: "IN PROGRESS",
    number: "02",
    theme: "fashion",
    tagline: "An editorial world, built for the web.",
    description:
      "An ongoing print-on-demand storefront with a dark editorial direction.",
    overview:
      "An ongoing fashion-commerce website connecting an editorial visual identity with product discovery and catalogue development.",
    problem:
      "Carry a distinctive fashion identity through a clear storefront journey.",
    approach:
      "Develop storefront presentation and catalogue structure as connected parts of the experience.",
    direction:
      "Dark imagery, expressive type and considered product composition.",
    development:
      "Storefront and commerce work remain in development. Live checkout, payments and fulfilment are not claimed. No public URL was supplied in the previous portfolio.",
    features: [
      "Storefront direction",
      "Product catalogue development",
      "Responsive web experience",
    ],
    services: ["Web design", "E-commerce development", "Catalogue systems"],
    websiteUrl: null,
    image: "/projects/project-veyrath.webp",
    imageNote: "Portfolio artwork · storefront in development",
    featured: true,
    caseStudy: true,
    year: null,
  },
  {
    slug: "glossboss",
    name: "Gloss Boss",
    category: "Automotive / Business website",
    status: "LIVE",
    number: "03",
    theme: "automotive",
    tagline: "A sharper presence. A clearer next step.",
    description:
      "A service-led automotive website with a direct path to booking.",
    overview:
      "A business website for automotive detailing, focused on presenting services and helping visitors find the booking pathway.",
    problem:
      "Help visitors understand detailing services and take the next step with confidence.",
    approach:
      "Bring service information, visual presentation and enquiry paths into a clear website structure.",
    direction: "Bold automotive imagery and a direct service hierarchy.",
    development:
      "The public website and booking links are available. This case study covers the website portion of the original project only, with no conversion metrics claimed.",
    features: [
      "Service presentation",
      "Booking pathway",
      "Responsive business website",
    ],
    services: ["Web design", "Service architecture", "Enquiry experience"],
    websiteUrl: "https://glossbossautomotive.online",
    image: "/projects/screen-glossboss.webp",
    imageNote: "Actual website capture · September 2026",
    featured: true,
    caseStudy: true,
    year: null,
  },
  {
    slug: "article-project",
    name: "Article Project",
    category: "Editorial website",
    status: "IN PROGRESS",
    number: "04",
    theme: "editorial",
    tagline: "The next chapter is taking shape.",
    description:
      "An article-led website currently being built. More to share as it develops.",
    overview:
      "An article-related website currently in development. The final name, scope and preview are still to be confirmed.",
    problem: "Project details to follow.",
    approach: "Currently building.",
    direction: "Editorial web experience.",
    development:
      "In progress; no public website or completed functionality is claimed.",
    features: [],
    services: ["Website development"],
    websiteUrl: null,
    image: null,
    imageNote: "Project preview to follow",
    featured: true,
    caseStudy: false,
    year: null,
  },
  ...conceptProjects.map((project): Project => ({
    ...project,
    status: "CONCEPT",
    description: project.tagline,
    services: ["UI/UX", "Development direction"],
    websiteUrl: null,
    image: null,
    imageNote: "Independent website concept",
    featured: false,
    caseStudy: true,
    year: null,
  })),
];
export const featuredProjects = projects.filter((project) => project.featured);
