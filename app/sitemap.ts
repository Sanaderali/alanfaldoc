import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";
import { getCategories, getCountries, regionHasPage, regionHref, getPageSeo, getPosts, getPostsPage, getServices } from "@/lib/content";

export const revalidate = 900;

const img = (src: string) => (src.startsWith("http") ? src : abs(src));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [countries, services, posts, cats, { pages }] = await Promise.all([getCountries(), getServices(), getPosts(), getCategories(), getPostsPage(1)]);
  const idx = (s: { seo?: { noindex?: boolean } }) => !s.seo?.noindex;
  const keys = [["/about", "about"], ["/services", "services"], ["/countries", "countries"], ["/blog", "blog"], ["/faqs", "faqs"], ["/contact", "contact"], ["/sitemap", "sitemap"]] as const;
  const fixed = (await Promise.all(keys.map(async ([p, k]) => ((await getPageSeo(k)).seo?.noindex ? "" : p as string)))).filter(Boolean);
  return [
    { url: abs("/"), changeFrequency: "weekly", priority: 1 },
    ...fixed.map((p) => ({ url: abs(p), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...services.filter(idx).map((s) => ({ url: abs(`/services/${s.slug}`), lastModified: s.updatedAt, changeFrequency: "monthly" as const, priority: 0.9, ...(s.image ? { images: [img(s.image)] } : {}) })),
    ...countries.filter(idx).map((c) => ({ url: abs(`/countries/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "monthly" as const, priority: 0.8, ...(c.image ? { images: [img(c.image)] } : {}) })),
    ...countries.filter(idx).flatMap((c) => (c.regions ?? []).filter(regionHasPage).filter((r) => !r.seo?.noindex).map((r) => ({ url: abs(regionHref(c.slug, r)), lastModified: r.updatedAt ?? c.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 }))),
    ...Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ url: abs(`/blog/page/${i + 2}`), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...cats.map((c) => ({ url: abs(`/blog/category/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...posts.filter(idx).map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.updatedAt ?? p.updated ?? p.date, ...(p.image ? { images: [img(p.image)] } : {}), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
