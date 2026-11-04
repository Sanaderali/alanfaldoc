import "server-only";
import { readAll } from "@/lib/store";
import { auditCountry, auditFaqGroup, auditPage, auditPost, auditService, score, visibility, type Issue } from "@/lib/audit";

export type Row = {
  kind: "service" | "country" | "post" | "faq" | "page";
  id: string;
  title: string;
  slug: string;
  status?: string;
  publishAt?: string;
  updatedAt?: string;
  createdAt?: string;
  href: string; // admin edit url
  publicHref?: string;
  issues: Issue[];
};

const kindLabel = { service: "Service", country: "Country", post: "Blog post", faq: "FAQ group", page: "Page" } as const;
export const labelOf = (k: Row["kind"]) => kindLabel[k];

export async function allRows(): Promise<Row[]> {
  const [services, countries, posts, faqs, pages] = await Promise.all([readAll("services"), readAll("countries"), readAll("posts"), readAll("faqs"), readAll("pages")]);
  return [
    ...services.map((s): Row => ({ kind: "service", id: s.id!, title: s.title, slug: s.slug, status: s.status, publishAt: s.publishAt, updatedAt: s.updatedAt, createdAt: s.createdAt, href: `/admin/services/${s.id}`, publicHref: `/services/${s.slug}`, issues: auditService(s) })),
    ...countries.map((c): Row => ({ kind: "country", id: c.id!, title: c.name, slug: c.slug, status: c.status, publishAt: c.publishAt, updatedAt: c.updatedAt, createdAt: c.createdAt, href: `/admin/countries/${c.id}`, publicHref: `/countries/${c.slug}`, issues: auditCountry(c) })),
    ...posts.map((p): Row => ({ kind: "post", id: p.id!, title: p.title, slug: p.slug, status: p.status, publishAt: p.publishAt ?? p.date, updatedAt: p.updatedAt, createdAt: p.createdAt, href: `/admin/posts/${p.id}`, publicHref: `/blog/${p.slug}`, issues: auditPost(p) })),
    ...faqs.map((g): Row => ({ kind: "faq", id: g.id!, title: g.title, slug: "", status: g.status, updatedAt: g.updatedAt, createdAt: g.createdAt, href: `/admin/faqs`, issues: auditFaqGroup(g) })),
    ...pages.map((p): Row => ({ kind: "page", id: p.id!, title: p.name, slug: p.path, status: p.status, updatedAt: p.updatedAt, createdAt: p.createdAt, href: `/admin/pages/${p.key}`, publicHref: p.path, issues: auditPage(p) })),
  ];
}

export { score, visibility };
