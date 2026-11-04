/**
 * Content shapes used across the site.
 * Pages only depend on these types + lib/content.ts, so the data source
 * (local files today, a CMS / database / API later) can change freely.
 */

/** Publishing + audit fields shared by everything managed in the dashboard (filled in by lib/store.ts). */
export type Status = "draft" | "published";
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
  faqs?: Faq[];
  seo?: Seo;
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

export type NavItem = { label: string; href: string };

/** SEO + schema settings for the fixed pages (home, about, services list…). */
export type PageKey = "home" | "about" | "services" | "countries" | "blog" | "faqs" | "contact";
export type PageSettings = Managed & {
  key: PageKey;
  name: string;
  path: string;
  seo?: Seo;
};

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
