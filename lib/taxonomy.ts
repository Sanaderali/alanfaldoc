import "server-only";
import { readAll } from "@/lib/store";
import { slugify } from "@/lib/validate";

export type TermRow = { name: string; slug: string; count: number };

/** Admin view of categories/tags: those used by posts plus ones created in the dashboard (even if still empty). Trashed posts are not counted. */
export async function adminCategories(): Promise<TermRow[]> {
  const [posts, terms] = await Promise.all([readAll("posts"), readAll("terms")]);
  const map = new Map<string, number>();
  for (const t of terms) if (t.type === "category") map.set(t.name, 0);
  for (const p of posts) if (p.status !== "trash" && p.category) map.set(p.category, (map.get(p.category) ?? 0) + 1);
  return [...map].map(([name, count]) => ({ name, slug: slugify(name), count })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function adminTags(): Promise<TermRow[]> {
  const [posts, terms] = await Promise.all([readAll("posts"), readAll("terms")]);
  const map = new Map<string, number>();
  for (const t of terms) if (t.type === "tag") map.set(t.name, 0);
  for (const p of posts) if (p.status !== "trash") for (const t of p.tags ?? []) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map].map(([name, count]) => ({ name, slug: slugify(name), count })).sort((a, b) => a.name.localeCompare(b.name));
}
