import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Country, FaqGroup, MediaItem, PageSettings, Post, Service } from "@/types/content";
import { countries as seedCountries } from "@/data/countries";
import { services as seedServices } from "@/data/services";
import { posts as seedPosts } from "@/data/posts";
import { faqGroups as seedFaqs } from "@/data/faqs";

/**
 * File-based content store (no database needed, works on cPanel Node hosting).
 * - JSON files live in CONTENT_DIR (default ./content). That folder is git-ignored so deployments never overwrite edits.
 * - First run: each collection is seeded from the hand-written data/*.ts files.
 * - Writes are atomic (temp file + rename) and serialised per collection.
 * To move to a real database later, only this file needs to change.
 */

export const CONTENT_DIR = path.resolve(process.env.CONTENT_DIR ?? "content");
export const UPLOAD_DIR = path.join(CONTENT_DIR, "uploads");

export type CollectionMap = {
  services: Service;
  countries: Country;
  posts: Post;
  faqs: FaqGroup;
  pages: PageSettings;
  media: MediaItem;
};
export type CollectionName = keyof CollectionMap;

const now = () => new Date().toISOString();
const stamp = <T extends object>(x: T): T & { id: string; status: "published"; createdAt: string; updatedAt: string } => ({
  status: "published",
  createdAt: now(),
  updatedAt: now(),
  ...x,
  id: (x as { id?: string }).id ?? randomUUID(),
} as never);

const seedPages = (): PageSettings[] =>
  (
    [
      ["home", "Home", "/"],
      ["about", "About Us", "/about"],
      ["services", "Services list", "/services"],
      ["countries", "Countries list", "/countries"],
      ["blog", "Blog list", "/blog"],
      ["faqs", "FAQs", "/faqs"],
      ["contact", "Contact", "/contact"],
      ["sitemap", "Sitemap", "/sitemap"],
    ] as const
  ).map(([key, name, p]) => stamp({ key, name, path: p, seo: {}, faqSchema: true }));

function seed<K extends CollectionName>(name: K): CollectionMap[K][] {
  const data: Record<CollectionName, unknown[]> = {
    services: seedServices.map(stamp),
    countries: seedCountries.map(stamp),
    posts: seedPosts.map((p) => stamp({ ...p, updatedAt: p.updated ? p.updated + "T00:00:00.000Z" : undefined })),
    faqs: seedFaqs.map(stamp),
    pages: seedPages(),
    media: [],
  };
  return data[name] as CollectionMap[K][];
}

const file = (n: CollectionName) => path.join(CONTENT_DIR, `${n}.json`);
const locks = new Map<string, Promise<unknown>>();

/** Built-in fixed pages added in later versions are merged into an existing pages.json automatically. */
function withMissingPages(items: PageSettings[]): PageSettings[] {
  const have = new Set(items.map((p) => p.key));
  const missing = seedPages().filter((p) => !have.has(p.key));
  return missing.length ? [...items, ...missing] : items;
}

export async function readAll<K extends CollectionName>(name: K): Promise<CollectionMap[K][]> {
  try {
    const data = JSON.parse(await fs.readFile(file(name), "utf8"));
    return (name === "pages" ? withMissingPages(data) : data) as CollectionMap[K][];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const data = seed(name);
    try {
      await writeAll(name, data);
    } catch {
      /* read-only file system: serve the seed from memory */
    }
    return data;
  }
}

export async function writeAll<K extends CollectionName>(name: K, items: CollectionMap[K][]): Promise<void> {
  const run = async () => {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    const tmp = `${file(name)}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(items, null, 2), "utf8");
    await fs.rename(tmp, file(name));
  };
  const prev = locks.get(name) ?? Promise.resolve();
  const next = prev.catch(() => undefined).then(run);
  locks.set(name, next);
  return next;
}

/** read-modify-write helper so concurrent saves cannot lose data */
export async function mutate<K extends CollectionName, R>(name: K, fn: (items: CollectionMap[K][]) => CollectionMap[K][] | Promise<CollectionMap[K][]>): Promise<CollectionMap[K][]> {
  const items = await readAll(name);
  const out = await fn(items);
  await writeAll(name, out);
  return out;
}

export { now, stamp };

/* ---------------- previews (dashboard "Preview" button) ---------------- */
const PREVIEW_DIR = path.join(CONTENT_DIR, "previews");
const safeId = (id: string) => /^[a-zA-Z0-9-]{1,64}$/.test(id);

/** Unsaved/draft copy of an item, so the editor can show a real preview without touching live content. */
export async function writePreview(id: string, item: unknown): Promise<void> {
  if (!safeId(id)) throw new Error("bad id");
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  await fs.writeFile(path.join(PREVIEW_DIR, `${id}.json`), JSON.stringify(item), "utf8");
  // housekeeping: drop previews older than a day
  const now = Date.now();
  for (const f of await fs.readdir(PREVIEW_DIR)) {
    const fp = path.join(PREVIEW_DIR, f);
    if (now - (await fs.stat(fp)).mtimeMs > 24 * 3600 * 1000) await fs.rm(fp, { force: true });
  }
}
export async function readPreview<T = unknown>(id: string): Promise<T | undefined> {
  if (!safeId(id)) return undefined;
  try {
    return JSON.parse(await fs.readFile(path.join(PREVIEW_DIR, `${id}.json`), "utf8"));
  } catch {
    return undefined;
  }
}
