import type { Country, Post, Service } from "@/types/content";
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
export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
