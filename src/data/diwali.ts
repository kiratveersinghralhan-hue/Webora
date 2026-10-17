import type { Draft } from "../../shared/enquiry";

/**
 * Diwali Edition 2026: seasonal Memory Gift packages. Personal websites given
 * as gifts, enquired through the existing six-step brief (?gift=<id>).
 * All sample content shown with these packages is fictional demonstration copy.
 */
export const diwaliEdition = {
  name: "Diwali Edition",
  year: 2026,
  greeting: "Shubh Deepavali",
  route: "/diwali-gifts",
} as const;

export type GiftId = "little-moments" | "our-story" | "forever-edition";
export interface GiftPackage {
  id: GiftId;
  name: string;
  price: string;
  priceValue: number;
  lamps: number;
  tagline: string;
  story: string;
  idealFor: string;
  includes: string[];
  sample: { title: string; lines: string[] };
}

export const giftPackages: GiftPackage[] = [
  {
    id: "little-moments",
    name: "Little Moments",
    price: "₹999",
    priceValue: 999,
    lamps: 1,
    tagline: "One page. One lamp. Everything you meant to say.",
    story:
      "A single, beautifully lit page that gathers a handful of photographs and the words you never quite find time to say out loud.",
    idealFor: "A sibling, a best friend, a first Diwali together",
    includes: [
      "A one-page memory website",
      "Up to 15 photographs",
      "A personal letter, set in festive typography",
      "Animated diya opening",
      "A private link to share on WhatsApp",
    ],
    sample: {
      title: "For Meera, from Arjun",
      lines: [
        "The year we burnt the first batch of laddoos.",
        "The terrace, the rockets, the power cut.",
        "Still my favourite person to light lamps with.",
      ],
    },
  },
  {
    id: "our-story",
    name: "Our Story",
    price: "₹2,499",
    priceValue: 2499,
    lamps: 3,
    tagline: "Your years together, told in chapters of light.",
    story:
      "A scrolling story in chapters: where it began, the ordinary days that mattered, and the festivals that became traditions, with a timeline of milestones.",
    idealFor: "Partners, parents, a family celebrating together",
    includes: [
      "Everything in Little Moments",
      "Up to 5 story chapters",
      "Up to 50 photographs",
      "A milestone timeline",
      "A background song of your choice",
      "Password-protected link",
      "One round of revisions",
    ],
    sample: {
      title: "The Sharma Family, 1998 — 2026",
      lines: [
        "Chapter 1 · A small flat in Ludhiana",
        "Chapter 2 · The scooter years",
        "Chapter 3 · Every rangoli Dadi ever drew",
      ],
    },
  },
  {
    id: "forever-edition",
    name: "Forever Edition",
    price: "₹4,999",
    priceValue: 4999,
    lamps: 5,
    tagline: "A keepsake world, made to be opened for years.",
    story:
      "Our most personal edition: a cinematic opening, an immersive gallery with video moments, a wall of wishes from family and friends, and a printed QR keepsake card.",
    idealFor: "Milestone anniversaries, grandparents, a gift to be kept",
    includes: [
      "Everything in Our Story",
      "Cinematic lit opening sequence",
      "Up to 150 photographs and short video clips",
      "A wishes wall from family and friends",
      "Printable QR keepsake card",
      "Two rounds of revisions",
      "Priority delivery before Diwali",
    ],
    sample: {
      title: "Nani & Nana · Fifty Diwalis",
      lines: [
        "Opening · The courtyard, lit",
        "Gallery · 1976 to today",
        "Wishes · From twelve grandchildren",
      ],
    },
  },
];

/** Comparison rows: feature, then availability per package in order. */
export const giftComparison: [string, ...(string | boolean)[]][] = [
  ["Pages", "One page", "Up to 5 chapters", "Immersive world"],
  ["Photographs", "Up to 15", "Up to 50", "Up to 150 + video"],
  ["Personal letter", true, true, true],
  ["Diya opening animation", true, true, "Cinematic"],
  ["Milestone timeline", false, true, true],
  ["Background song", false, true, true],
  ["Password protection", false, true, true],
  ["Wishes wall", false, false, true],
  ["QR keepsake card", false, false, true],
  ["Revisions", "—", "One round", "Two rounds"],
];

export const findGift = (id: string | null | undefined) =>
  giftPackages.find((gift) => gift.id === id);

/** The line added to the enquiry so the studio sees the chosen package. */
export const giftEnquiryNote = (gift: GiftPackage) =>
  `Diwali Memory Gift: ${gift.name} (${gift.price}).`;

/** A Memory Gift arrives through the same brief, with its package noted. */
export function applyGift(draft: Draft, gift: GiftPackage | undefined): Draft {
  if (!gift) return draft;
  const note = giftEnquiryNote(gift);
  const others = draft.additional_requirements
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("Diwali Memory Gift:"))
    .join("\n")
    .trim();
  return {
    ...draft,
    business_category: draft.business_category || "Other",
    project_type: "Custom interactive website",
    estimated_pages: draft.estimated_pages || "1",
    features: draft.features.length ? draft.features : ["Animations"],
    additional_requirements: (others ? `${note}\n${others}` : note).slice(
      0,
      4000,
    ),
  };
}
