import type { NavItem } from "@/types/content";

/** Global site settings. Edit here once, updates header, footer, SEO, contact page. */
export const site = {
  name: "Al Anfal Doc",
  tagline: "Dubai Business Setup & Document Services",
  description:
    "Expert consultation for company formation, PRO services, visa processing and document clearing in Dubai & UAE.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://alanfaldoc.com",
  legalName: "Al Anfal Doc",
  locale: "en_AE",
  address: "Business Bay, Dubai, UAE",
  /** structured address for schema.org. Add street / postal code / geo when known */
  addressParts: { street: "", locality: "Dubai", region: "Dubai", country: "AE" },
  geo: null as null | { lat: number; lng: number },
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:30" },
    { days: ["Saturday"], opens: "08:30", closes: "15:30" },
  ],
  areaServed: ["United Arab Emirates", "Dubai", "Abu Dhabi", "Sharjah"],
  twitterHandle: "" as string, // e.g. "@alanfaldoc"
  phone: "+971 50 123 4567",
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

/** Placeholder figures. Replace with your real numbers. */
export const stats = [
  { value: "20+", label: "Years of experience" },
  { value: "5,000+", label: "Documents processed" },
  { value: "200+", label: "Companies served" },
  { value: "6", label: "Countries covered" },
];

/** Blog category -> Font Awesome icon (used on post covers). Add your own categories here. */
export const categoryIcons: Record<string, string> = {
  Visa: "passport",
  Documents: "file-circle-check",
  "Company Formation": "building",
  Banking: "building-columns",
  default: "newspaper",
};
