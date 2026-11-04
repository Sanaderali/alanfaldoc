import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getCountries, getPosts, getServices } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [countries, services, posts] = await Promise.all([getCountries(), getServices(), getPosts()]);
  const url = (p: string) => `${site.url}${p}`;
  return [
    ...["", "/about", "/services", "/countries", "/blog", "/contact"].map((p) => ({ url: url(p) })),
    ...countries.map((c) => ({ url: url(`/countries/${c.slug}`) })),
    ...services.map((s) => ({ url: url(`/services/${s.slug}`) })),
    ...posts.map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: p.date })),
  ];
}
