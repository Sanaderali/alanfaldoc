import type { Country, FaqGroup, PageSettings, Post, Service } from "@/types/content";

/** SEO / content health checks used by the dashboard. Pure functions, no I/O. */

export type Issue = { level: "error" | "warn" | "info"; text: string };

const len = (s?: string) => (s ?? "").trim().length;

type Auditable = {
  title: string;
  slug?: string;
  image?: string;
  imageAlt?: string;
  faqSchema?: boolean;
  schemaCustom?: string;
  faqs?: { question: string; answer: string }[];
  seo?: { title?: string; description?: string; image?: string; canonical?: string };
};

export function auditItem(item: Auditable, kind: "service" | "country" | "post" | "page", fallbackDescription: string): Issue[] {
  const out: Issue[] = [];
  const title = item.seo?.title ?? item.title;
  const desc = item.seo?.description ?? fallbackDescription;
  if (!item.seo?.description) out.push({ level: "warn", text: "No custom meta description (using the summary)" });
  if (len(desc) < 70) out.push({ level: "warn", text: `Meta description is short (${len(desc)} chars, aim for 120-160)` });
  if (len(desc) > 160) out.push({ level: "warn", text: `Meta description is long (${len(desc)} chars, Google truncates ~160)` });
  if (len(title) > 60) out.push({ level: "warn", text: `Meta title is long (${len(title)} chars, aim for under 60)` });
  if (len(title) < 15) out.push({ level: "warn", text: "Meta title is very short" });
  if (item.image && !len(item.imageAlt)) out.push({ level: "error", text: "Image has no alt text" });
  if (kind !== "page" && !item.image) out.push({ level: "info", text: "No cover image" });
  if ((kind === "service" || kind === "country") && !(item.faqs && item.faqs.length)) out.push({ level: "info", text: "No FAQs (FAQ rich results need at least one)" });
  if (item.faqSchema === false && item.faqs?.length) out.push({ level: "info", text: "FAQ schema is switched off" });
  if (item.schemaCustom) {
    try { JSON.parse(item.schemaCustom); } catch { out.push({ level: "error", text: "Custom schema is not valid JSON" }); }
  }
  return out;
}

export const auditService = (s: Service) => auditItem(s, "service", s.summary);
export const auditCountry = (c: Country) => auditItem({ ...c, title: c.headline }, "country", c.intro);
export const auditPost = (p: Post) => auditItem(p, "post", p.excerpt);
export const auditPage = (p: PageSettings) => auditItem({ title: p.name, seo: p.seo, schemaCustom: p.schemaCustom }, "page", "");
export const auditFaqGroup = (g: FaqGroup): Issue[] => (g.faqs.length ? [] : [{ level: "warn", text: "Group has no questions" }]);

export const score = (issues: Issue[]) => Math.max(0, 100 - issues.filter((i) => i.level === "error").length * 25 - issues.filter((i) => i.level === "warn").length * 10 - issues.filter((i) => i.level === "info").length * 3);

/** live / draft / scheduled for any managed item */
export function visibility(x: { status?: string; publishAt?: string }, at = Date.now()): "live" | "draft" | "scheduled" {
  if ((x.status ?? "published") !== "published") return "draft";
  return x.publishAt && new Date(x.publishAt).getTime() > at ? "scheduled" : "live";
}
