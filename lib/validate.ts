import { cleanRichHtml, htmlToText } from "@/lib/html";
import type { ContentSection, Country, Faq, PageSettings, Post, Seo, Service } from "@/types/content";

/** Server-side cleaning + validation of everything the dashboard saves. Never trust the browser. */

export type Errors = Record<string, string>;

export const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "");
export const strList = (v: unknown, max = 300, cap = 100) => (Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, cap) : []);
export const bool = (v: unknown, d = false) => (typeof v === "boolean" ? v : d);
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RESERVED_POST_SLUGS = ["page", "category", "tag", "search-index.json"];

export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export function isoDate(v: unknown): string | undefined {
  const s = str(v, 40);
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function imagePath(v: unknown): string {
  const s = str(v, 500);
  if (!s) return "";
  return /^(https:\/\/|\/(?!\/))/.test(s) ? s : "";
}

export function cleanSeo(v: unknown, errors: Errors): Seo {
  const o = (v ?? {}) as Record<string, unknown>;
  const seo: Seo = {};
  const title = str(o.title, 120), description = str(o.description, 320), image = imagePath(o.image), canonical = str(o.canonical, 500);
  if (title) seo.title = title;
  if (description) seo.description = description;
  const kw = strList(typeof o.keywords === "string" ? (o.keywords as string).split(",") : o.keywords, 60, 30);
  if (kw.length) seo.keywords = kw;
  if (image) seo.image = image;
  if (canonical) {
    if (/^https:\/\/[^\s]+$/.test(canonical)) seo.canonical = canonical;
    else errors["seo.canonical"] = "Canonical must be a full https:// URL";
  }
  if (bool(o.noindex)) seo.noindex = true;
  return seo;
}

export function cleanSchemaCustom(v: unknown, errors: Errors): string | undefined {
  const s = str(v, 20000);
  if (!s) return undefined;
  try {
    const parsed = JSON.parse(s);
    if (typeof parsed !== "object" || parsed === null) throw new Error();
    return JSON.stringify(parsed, null, 2);
  } catch {
    errors.schemaCustom = "Custom schema must be valid JSON (an object or an array)";
    return s;
  }
}

export function cleanFaqs(v: unknown): Faq[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((f) => ({ question: str((f as Faq)?.question, 300), answer: str((f as Faq)?.answer, 3000) }))
    .filter((f) => f.question && f.answer)
    .slice(0, 50);
}

export function cleanSections(v: unknown): ContentSection[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => {
      const o = s as ContentSection;
      const sec: ContentSection = { heading: str(o?.heading, 200) };
      if (bool(o?.minor)) sec.minor = true;
      const paragraphs = strList(o?.paragraphs, 4000, 30);
      const list = strList(o?.list, 400, 60);
      if (paragraphs.length) sec.paragraphs = paragraphs;
      if (list.length) sec.list = list;
      if (list.length && bool(o?.twoColumns)) sec.twoColumns = true;
      return sec;
    })
    .filter((s) => s.heading)
    .slice(0, 40);
}

type Common = { id?: string; status: "draft" | "published"; publishAt?: string; image?: string; imageAlt?: string; faqSchema: boolean; schemaCustom?: string; seo?: Seo };

function common(o: Record<string, unknown>, errors: Errors): Common {
  const status = o.status === "published" ? "published" : "draft";
  const publishAtRaw = str(o.publishAt, 40);
  const publishAt = isoDate(o.publishAt);
  if (publishAtRaw && !publishAt) errors.publishAt = "Invalid date";
  const image = imagePath(o.image);
  const imageAlt = str(o.imageAlt, 300);
  if (image && !imageAlt) errors.imageAlt = "Describe the image (alt text) for accessibility and image SEO";
  const seo = cleanSeo(o.seo, errors);
  return { status, publishAt, image: image || undefined, imageAlt: imageAlt || undefined, faqSchema: bool(o.faqSchema, true), schemaCustom: cleanSchemaCustom(o.schemaCustom, errors), seo: Object.keys(seo).length ? seo : undefined };
}

/** When the visual editor sent HTML it replaces the old structured fields; otherwise keep them. */
function htmlOrLegacy<T extends object>(o: Record<string, unknown>, legacy: T): T | Record<string, unknown> {
  const html = cleanRichHtml(o.contentHtml);
  if (htmlToText(html) || /<img/.test(html)) return { contentHtml: html, intro: "", sections: [], ...("highlights" in legacy ? { highlights: [] } : {}) };
  return legacy;
}

function slugField(o: Record<string, unknown>, fallbackFrom: string, errors: Errors, reserved: string[] = []) {
  const slug = str(o.slug, 80) || slugify(fallbackFrom);
  if (!SLUG_RE.test(slug)) errors.slug = "Use lowercase letters, numbers and hyphens only";
  else if (reserved.includes(slug)) errors.slug = `"${slug}" is reserved`;
  return slug;
}

export function cleanService(o: Record<string, unknown>): { item: Omit<Service, "createdAt" | "updatedAt">; errors: Errors } {
  const errors: Errors = {};
  const title = str(o.title, 120);
  if (!title) errors.title = "Title is required";
  const summary = str(o.summary, 600);
  if (!summary) errors.summary = "Summary is required";
  const c = common(o, errors);
  const icon = str(o.icon, 80) || "briefcase";
  if (!/^[a-z0-9 -]+$/.test(icon)) errors.icon = "Use a Font Awesome icon name, e.g. building";
  return {
    errors,
    item: {
      ...c,
      slug: slugField(o, title, errors),
      title,
      icon,
      summary,
      ...htmlOrLegacy(o, { intro: str(o.intro, 3000), highlights: strList(o.highlights, 300), sections: cleanSections(o.sections) }),
      faqs: cleanFaqs(o.faqs),
      relatedSlugs: strList(o.relatedSlugs, 80, 12),
      serviceType: str(o.serviceType, 120) || undefined,
    } as never,
  };
}

export function cleanCountry(o: Record<string, unknown>): { item: Omit<Country, "createdAt" | "updatedAt">; errors: Errors } {
  const errors: Errors = {};
  const name = str(o.name, 120);
  if (!name) errors.name = "Name is required";
  const summary = str(o.summary, 400);
  if (!summary) errors.summary = "Summary is required";
  const c = common(o, errors);
  const facts = Array.isArray(o.facts) ? (o.facts as { label?: string; value?: string }[]).map((f) => ({ label: str(f?.label, 80), value: str(f?.value, 300) })).filter((f) => f.label && f.value).slice(0, 30) : [];
  const categories = Array.isArray(o.categories)
    ? (o.categories as { title?: string; href?: string }[]).map((x) => ({ title: str(x?.title, 120), href: str(x?.href, 300) })).filter((x) => x.title && /^(\/|https:\/\/)/.test(x.href)).slice(0, 30)
    : [];
  return {
    errors,
    item: {
      ...c,
      slug: slugField(o, name, errors),
      name,
      flag: str(o.flag, 16),
      flagImage: imagePath(o.flagImage) || undefined,
      tagline: str(o.tagline, 200),
      headline: str(o.headline, 200) || name,
      summary,
      ...htmlOrLegacy(o, { intro: str(o.intro, 3000), sections: cleanSections(o.sections) }),
      facts,
      gradient: str(o.gradient, 120) || "from-gray-100 to-gray-200",
      categories: categories.length ? categories : undefined,
      serviceSlugs: strList(o.serviceSlugs, 80, 20),
      featured: bool(o.featured),
      faqs: cleanFaqs(o.faqs),
    } as never,
  };
}

export function cleanPost(o: Record<string, unknown>): { item: Omit<Post, "createdAt" | "updatedAt">; errors: Errors } {
  const errors: Errors = {};
  const title = str(o.title, 160);
  if (!title) errors.title = "Title is required";
  const excerpt = str(o.excerpt, 500);
  if (!excerpt) errors.excerpt = "Excerpt is required";
  const contentHtml = cleanRichHtml(o.contentHtml);
  const legacyBody = strList(o.body, 8000, 400);
  if (!htmlToText(contentHtml) && !legacyBody.length) errors.contentHtml = "Write the article";
  const category = str(o.category, 80);
  if (!category) errors.category = "Category is required";
  const c = common(o, errors);
  const date = (c.publishAt ?? isoDate(o.date) ?? new Date().toISOString()).slice(0, 10);
  const rm = Number(o.readMinutes);
  return {
    errors,
    item: {
      ...c,
      slug: slugField(o, title, errors, RESERVED_POST_SLUGS),
      title,
      excerpt,
      date,
      category,
      author: str(o.author, 80) || undefined,
      tags: strList(typeof o.tags === "string" ? (o.tags as string).split(",") : o.tags, 40, 20),
      readMinutes: Number.isFinite(rm) && rm > 0 ? Math.min(120, Math.round(rm)) : undefined,
      contentHtml: contentHtml || undefined,
      body: contentHtml ? [] : legacyBody,
    } as never,
  };
}

export function cleanPage(o: Record<string, unknown>, base: PageSettings): { item: PageSettings; errors: Errors } {
  const errors: Errors = {};
  const seo = cleanSeo(o.seo, errors);
  return { errors, item: { ...base, seo: Object.keys(seo).length ? seo : undefined, faqSchema: bool(o.faqSchema, true), schemaCustom: cleanSchemaCustom(o.schemaCustom, errors) } };
}
