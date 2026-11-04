/**
 * Content shapes used across the site.
 * Pages only depend on these types + lib/content.ts, so the data source
 * (local files today, a CMS / database / API later) can change freely.
 */

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

export type Country = {
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
  /** services most relevant to this country (slugs) */
  serviceSlugs?: string[];
  featured?: boolean;
};

export type Service = {
  slug: string;
  title: string;
  icon: string;
  summary: string;
  intro: string;
  highlights: string[];
  sections: ContentSection[];
  faqs: Faq[];
  relatedSlugs?: string[];
  image?: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, e.g. 2026-11-01 */
  date: string;
  category: string;
  body: string[];
  image?: string;
};

export type NavItem = { label: string; href: string };
