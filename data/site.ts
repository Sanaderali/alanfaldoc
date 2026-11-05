import type { NavItem } from "@/types/content";

/** Global site settings. Edit here once, updates header, footer, SEO, contact page. */
export const site = {
  name: "Al Anfal Doc",
  tagline: "Document Clearing & Business Setup in Dubai",
  description:
    "Dubai company formation, trade licence renewal, government approvals, document attestation and visa application support for business owners, investors and expatriates.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://alanfaldoc.com",
  legalName: "Al Anfal Documents Clearing Services LLC",
  /** default byline when an item has no named author */
  defaultAuthor: "Al Anfal Doc Team",
  locale: "en_AE",
  address: "Dubai, UAE",
  /** structured address for schema.org. Add street / postal code / geo when known */
  addressParts: { street: "", locality: "Dubai", region: "Dubai", country: "AE" },
  geo: null as null | { lat: number; lng: number },
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:30" },
    { days: ["Saturday"], opens: "08:30", closes: "15:30" },
  ],
  areaServed: ["United Arab Emirates", "Dubai", "Abu Dhabi", "Sharjah"],
  twitterHandle: "" as string, // e.g. "@alanfaldoc"
  phone: "+971 50 805 1192",
  email: "info@alanfaldoc.com",
  hours: ["Mon-Fri: 9:00AM - 6:30PM", "Saturday: 8:30AM - 3:30PM", "Sunday: Closed"],
  /** Put the real profile URLs here. "#" entries are ignored by schema `sameAs`. */
  social: [
    { label: "Facebook", href: "#", icon: "fa-brands fa-facebook-f" },
    { label: "X (Twitter)", href: "#", icon: "fa-brands fa-x-twitter" },
    { label: "Instagram", href: "#", icon: "fa-brands fa-instagram" },
    { label: "LinkedIn", href: "#", icon: "fa-brands fa-linkedin-in" },
  ],
};

/**
 * Search + AI crawler policy. Flip a value to false to block that bot in robots.txt.
 * Set SITE_INDEXING=off in the environment to block everything (staging / preview).
 */
export const crawlers = {
  search: true,
  ai: {
    GPTBot: true,
    "OAI-SearchBot": true,
    "ChatGPT-User": true,
    ClaudeBot: true,
    "Claude-SearchBot": true,
    "Claude-User": true,
    PerplexityBot: true,
    "Perplexity-User": true,
    "Google-Extended": true,
    "Applebot-Extended": true,
    CCBot: false,
  } as Record<string, boolean>,
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Countries", href: "/countries" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Facts about the website's own scope (not performance claims). */
export const stats = [
  { value: "17", label: "Core Dubai services" },
  { value: "20", label: "Country guides for investors" },
  { value: "2", label: "Languages for documents: Arabic and English" },
  { value: "1", label: "Team following each file end to end" },
];

/** Blog category -> Font Awesome icon (used on post covers). Add your own categories here. */
export const categoryIcons: Record<string, string> = {
  Visa: "passport",
  Documents: "file-circle-check",
  "Company Formation": "building",
  Banking: "building-columns",
  default: "newspaper",
};
