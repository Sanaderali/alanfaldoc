/**
 * Content shapes used across the site.
 * Pages only depend on these types + lib/content.ts, so the data source
 * (local files today, a CMS / database / API later) can change freely.
 */

/** Publishing + audit fields shared by everything managed in the dashboard (filled in by lib/store.ts). */
export type Status = "draft" | "published" | "trash";
export type Managed = {
  id?: string;
  /** missing = published (keeps hand-written data/*.ts content working) */
  status?: Status;
  /** ISO datetime. status "published" + a future date = scheduled, goes live automatically */
  publishAt?: string;
  createdAt?: string;
  updatedAt?: string;
  /** alt text for `image` (accessibility + image SEO) */
  imageAlt?: string;
  /** Rich-text article written in the dashboard visual editor (sanitised HTML). When set it replaces the structured sections/body on the page. */
  contentHtml?: string;
  /** internal: content version marker used by one-time upgrades (do not edit) */
  geoV?: number;
  /** GEO: "answer-first" summary (40-70 words) that AI assistants can quote directly */
  answer?: string;
  /** GEO: scannable key takeaways (bullets) */
  takeaways?: string[];
  /** GEO: "at a glance" summary table rows */
  summaryTable?: { label: string; value: string }[];
  /** GEO: references / sources shown at the bottom and emitted as schema citations */
  sources?: { title: string; url: string }[];
  /** GEO: named author for trust (defaults to the editorial team) */
  author?: string;
  /** emit FAQPage JSON-LD for this item's FAQs (default true) */
  faqSchema?: boolean;
  /** extra JSON-LD (raw JSON) rendered on the page next to the generated schema */
  schemaCustom?: string;
};

export type Fact = { label: string; value: string };

export type ContentSection = {
  heading: string;
  /** h3 (sub-heading) instead of h2 */
  minor?: boolean;
  paragraphs?: string[];
  list?: string[];
  /** render `list` in two columns on wide screens */
  twoColumns?: boolean;
};

export type Faq = { question: string; answer: string };
export type FaqGroup = Managed & { title: string; faqs: Faq[] };

/** Optional per-page SEO overrides. Leave empty to fall back to the page's own title/summary. */
export type Seo = {
  title?: string;
  description?: string;
  keywords?: string[];
  /** absolute or /public path used for og:image */
  image?: string;
  /** overrides the canonical URL (default: the page URL) */
  canonical?: string;
  noindex?: boolean;
};

export type Country = Managed & {
  slug: string;
  name: string;
  flag: string;
  /** flag image (dashboard upload or /flags/xx.svg). Overrides the emoji; when empty a built-in flag is derived from the emoji */
  flagImage?: string;
  /** banner subtitle, e.g. "Great Destination to Study and Live" */
  tagline: string;
  /** page headline, e.g. "Study. Work. Live in Canada" */
  headline: string;
  /** short text for cards */
  summary: string;
  intro: string;
  facts: Fact[];
  sections: ContentSection[];
  /** tailwind gradient classes for the banner when no image is set */
  gradient: string;
  /** optional photo in /public (or remote). Falls back to the gradient banner */
  image?: string;
  /** sidebar "Visa Categories" list, specific to this country. Falls back to related services */
  categories?: { title: string; href: string }[];
  /** services most relevant to this country (slugs) */
  serviceSlugs?: string[];
  featured?: boolean;
  /** key statistics shown as cards at the top of the country page, e.g. { value: "3.5M", label: "Indians in the UAE", note: "2023, Government of India" } */
  stats?: { value: string; label: string; note?: string }[];
  /** "States", "Provinces", "Regions"... heading for the regions section */
  regionsLabel?: string;
  /** states / provinces / regions: each gets its own heading + text on the country page (good for local search) */
  regions?: Region[];
  faqs?: Faq[];
  seo?: Seo;
};

/**
 * A state / province / region. It always shows as a card on the country page. When `page` is "published" it also gets its own page
 * at /countries/<country>/<slug> (the long-form content below), which the card then links to.
 */
export type Region = {
  name: string;
  summary: string;
  /** comma separated main cities */
  cities?: string;
  /** URL part of the state page (auto from the name when empty) */
  slug?: string;
  /** "published" = the state page is live; anything else = card only */
  page?: "draft" | "published";
  headline?: string;
  /** answer-first summary (40-70 words) for search and AI assistants */
  answer?: string;
  /** short facts shown as bullets ("Community in the UAE: ...") */
  facts?: Fact[];
  /** article written in the visual editor (sanitised HTML) */
  contentHtml?: string;
  faqs?: Faq[];
  sources?: { title: string; url: string }[];
  seo?: Seo;
  /** internal: seed version this region was last filled from */
  v?: number;
  updatedAt?: string;
};

/**
 * A service page written for one country, e.g. "Company formation in Dubai for Indian investors".
 * Lives at /services/<service>/<country> (slug is "<service>/<country>"). Created by importing a content pack.
 */
export type Landing = Managed & {
  slug: string;
  /** slug of the service */
  service: string;
  /** slug of the country */
  country: string;
  title: string;
  headline: string;
  summary: string;
  faqs?: Faq[];
  seo?: Seo;
};

/** Password-recovery code state for one team member (stored hashed; see lib/otp.ts). */
export type Otp = { id: string; salt: string; codeHash: string; expiresAt: number; attempts: number; requests: number[]; resetHash?: string; resetExpires?: number };

/** A social media profile link shown in the header, footer and structured data (Dashboard -> Social media). */
export type SocialLink = { id: string; platform: string; url: string; active: boolean };

/** WhatsApp contact numbers (Dashboard -> WhatsApp). The first active number is the default for buttons. */
export type WhatsAppNumber = {
  id: string;
  /** shown to visitors, e.g. "Visa enquiries" */
  label: string;
  /** digits with country code, e.g. 971508051192 (a leading + and spaces are accepted when saving) */
  number: string;
  /** which team role looks after this number (internal) */
  role?: Role;
  /** message pre-filled in the visitor's WhatsApp */
  message?: string;
  active: boolean;
};

export type Service = Managed & {
  slug: string;
  title: string;
  /** Font Awesome icon: short name ("building") or full class ("fa-solid fa-building") */
  icon: string;
  summary: string;
  intro: string;
  highlights: string[];
  sections: ContentSection[];
  faqs: Faq[];
  relatedSlugs?: string[];
  image?: string;
  /** schema.org serviceType, defaults to the title */
  serviceType?: string;
  /** starred in the dashboard: shown first in "Our Services" on the home page */
  featured?: boolean;
  seo?: Seo;
};

export type Post = Managed & {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, e.g. 2026-11-01 */
  date: string;
  category: string;
  /**
   * Article body. Each entry is a paragraph. Prefix with "## " for a heading, or write
   * "- item" lines (one entry, newline-separated) for a bullet list.
   */
  body: string[];
  author?: string;
  tags?: string[];
  /** override the auto-calculated reading time */
  readMinutes?: number;
  image?: string;
  /** ISO date of last edit (used for schema + sitemap) */
  updated?: string;
  seo?: Seo;
};

/** Customer review / success story shown on the home page ("Our Success Stories"). Managed in Dashboard -> Reviews. */
export type Review = Managed & {
  name: string;
  /** e.g. "Canada Study Visa" */
  role: string;
  text: string;
  /** 1-5, shown as stars */
  rating?: number;
  /** optional photo (media library or /public path) */
  image?: string;
};

/** An answer the team approved for the chat assistant ("Learn from this reply" in Live chat). */
export type Knowledge = { id?: string; status?: "published" | "draft"; question: string; answer: string; fromChat?: string; addedBy?: string; createdAt?: string; updatedAt?: string };

export type NavItem = { label: string; href: string };

/** SEO + schema settings for the fixed pages (home, about, services list…). */
export type PageKey = "home" | "about" | "services" | "countries" | "blog" | "faqs" | "contact" | "sitemap";
export type PageSettings = Managed & {
  key: PageKey;
  name: string;
  path: string;
  seo?: Seo;
};

/** Categories / tags created in the dashboard (they also exist implicitly through the posts that use them). */
export type Term = { id: string; type: "category" | "tag"; name: string; createdAt: string };

export type MediaItem = {
  id: string;
  file: string; // stored filename, served at /uploads/<file>
  alt: string;
  caption?: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
};

/* ---------------- staff accounts, tickets, live chat ---------------- */
export type Role = "super_admin" | "administrator" | "manager" | "support_agent" | "content_editor";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  /** scrypt$salt$hash (never the plain password) */
  passwordHash: string;
  role: Role;
  /** extra permissions granted on top of the role (granular overrides set by the Super Admin) */
  extraPermissions?: string[];
  /** permissions of the role that the Super Admin switched off for this person */
  removedPermissions?: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

export type TicketReply = { id: string; by: "customer" | "staff"; staffName?: string; staffId?: string; body: string; at: string };
export type Ticket = {
  id: string;
  number: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "open" | "pending" | "closed";
  source: "contact" | "chat";
  createdAt: string;
  updatedAt: string;
  ip?: string;
  replies: TicketReply[];
  unreadStaff: boolean;
  /** team member responsible for this ticket (set on first reply, or assigned by staff) */
  assignedTo?: string;
  /** when the team first replied (used for response-time stats) */
  firstResponseAt?: string;
  closedBy?: string;
  closedAt?: string;
};

export type ChatMessage = { id: string; from: "visitor" | "staff" | "system" | "ai"; name?: string; staffId?: string; text: string; at: string };
export type ChatProfile = {
  name?: string;
  email?: string;
  nationality?: string;
  /** where the client says they are based */
  basedIn?: string;
  businessType?: string;
  companyName?: string;
  /** "inside UAE" / "outside UAE" and the visa type if mentioned */
  visaStatus?: string;
  stayDuration?: string;
  travelHistory?: string;
  /** what the client wants, in one short sentence */
  query?: string;
  updatedAt?: string;
};
export type Chat = {
  id: string;
  /** sha256 of the visitor's secret token (the token itself lives only in the visitor's browser) */
  tokenHash: string;
  phone: string;
  name?: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  ip?: string;
  country?: string;
  city?: string;
  page?: string;
  referrer?: string;
  userAgent?: string;
  language?: string;
  messages: ChatMessage[];
  /** messages from the visitor that staff have not seen yet */
  unreadStaff: number;
  /** staff replies the visitor has not seen yet */
  unreadVisitor: number;
  assignedTo?: string;
  /** the AI assistant stays silent while true (set when staff reply or the assistant hands over) */
  aiPaused?: boolean;
  /** how many replies the assistant has sent in this chat */
  aiReplies?: number;
  /** facts the visitor mentioned in conversation (filled automatically, shown in Dashboard -> Enquiries) */
  profile?: ChatProfile;
  /** short summary of the whole conversation */
  summary?: string;
  summaryAt?: string;
  closedBy?: "visitor" | "staff";
  closedAt?: string;
  closedByName?: string;
  feedback?: { rating: number; comment?: string; at: string; reviewId?: string };
};
