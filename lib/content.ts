import type { Country, FaqGroup, Post, Service } from "@/types/content";
import { faqGroups } from "@/data/faqs";
import { countries } from "@/data/countries";
import { posts } from "@/data/posts";
import { services } from "@/data/services";

/**
 * Single data-access layer for the whole site.
 *
 * Pages ONLY call these functions. Today they read local files in /data.
 * To move to a CMS / database / REST API later, change the bodies below
 * (e.g. `fetch(process.env.CMS_URL + "/countries")`) and keep the return types.
 * No page or component needs to be touched.
 */

export async function getCountries(): Promise<Country[]> {
  return countries;
}
export async function getCountry(slug: string): Promise<Country | undefined> {
  return (await getCountries()).find((c) => c.slug === slug);
}

export async function getServices(): Promise<Service[]> {
  return services;
}
export async function getService(slug: string): Promise<Service | undefined> {
  return (await getServices()).find((s) => s.slug === slug);
}

export async function getPosts(): Promise<Post[]> {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}
export const POSTS_PER_PAGE = 4;

export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function readingMinutes(p: Post): number {
  if (p.readMinutes) return p.readMinutes;
  const words = (p.title + " " + p.body.join(" ")).split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export async function getPostsPage(page: number, size = POSTS_PER_PAGE) {
  const all = await getPosts();
  return { posts: all.slice((page - 1) * size, page * size), total: all.length, pages: Math.max(1, Math.ceil(all.length / size)) };
}

export async function getCategories(): Promise<{ name: string; slug: string; count: number }[]> {
  const map = new Map<string, number>();
  for (const p of await getPosts()) map.set(p.category, (map.get(p.category) ?? 0) + 1);
  return [...map].map(([name, count]) => ({ name, slug: slugify(name), count }));
}

export async function getTags(): Promise<{ name: string; slug: string }[]> {
  const set = new Set<string>();
  for (const p of await getPosts()) p.tags?.forEach((t) => set.add(t));
  return [...set].map((name) => ({ name, slug: slugify(name) }));
}

export async function getPostsByCategory(slug: string) {
  return (await getPosts()).filter((p) => slugify(p.category) === slug);
}
export async function getPostsByTag(slug: string) {
  return (await getPosts()).filter((p) => p.tags?.some((t) => slugify(t) === slug));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.slug === slug);
}

export async function getFaqGroups(): Promise<FaqGroup[]> {
  return faqGroups;
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
