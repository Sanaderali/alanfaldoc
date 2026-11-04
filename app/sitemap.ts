import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";
import { getCountries, getPosts, getServices } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [countries, services, posts] = await Promise.all([getCountries(), getServices(), getPosts()]);
  const idx = (s: { seo?: { noindex?: boolean } }) => !s.seo?.noindex;
  return [
    { url: abs("/"), changeFrequency: "weekly", priority: 1 },
    ...["/services", "/countries", "/blog", "/faqs", "/about", "/contact"].map((p) => ({ url: abs(p), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...services.filter(idx).map((s) => ({ url: abs(`/services/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...countries.filter(idx).map((c) => ({ url: abs(`/countries/${c.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...posts.filter(idx).map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.updated ?? p.date, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
