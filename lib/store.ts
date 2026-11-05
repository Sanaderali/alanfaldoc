import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Chat, Country, FaqGroup, MediaItem, PageSettings, Post, Review, Service, WhatsAppNumber, Term, Ticket, User } from "@/types/content";
import { countries as seedCountries } from "@/data/countries";
import { services as seedServices } from "@/data/services";
import { posts as seedPosts } from "@/data/posts";
import { faqGroups as seedFaqs } from "@/data/faqs";
import { site } from "@/data/site";

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
  terms: Term;
  users: User;
  tickets: Ticket;
  chats: Chat;
  reviews: Review;
  whatsapp: WhatsAppNumber;
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
    terms: [],
    users: [],
    tickets: [],
    chats: [],
    reviews: [],
    whatsapp: [{ id: "wa-main", label: "Main line", number: site.phone.replace(/\D/g, ""), active: true }],
  };
  return data[name] as CollectionMap[K][];
}

const file = (n: CollectionName) => path.join(CONTENT_DIR, `${n}.json`);
const locks = new Map<string, Promise<unknown>>();

/**
 * One-time upgrade: items stored before the GEO fields existed receive the sample answer/takeaways/table/sources
 * from the built-in content (matched by slug). Each item is marked (geoV) so it never runs twice and never
 * overwrites anything you edit or clear later.
 */
const GEO_KEYS = ["answer", "takeaways", "summaryTable", "sources"] as const;
function backfillGeo<T extends { slug: string; geoV?: number }>(items: T[], seedItems: T[]): { items: T[]; changed: boolean } {
  let changed = false;
  const out = items.map((it) => {
    if (it.geoV) return it;
    changed = true;
    const seedItem = seedItems.find((x) => x.slug === it.slug) as Record<string, unknown> | undefined;
    const patch: Record<string, unknown> = { geoV: 1 };
    if (seedItem) for (const k of GEO_KEYS) if (seedItem[k] !== undefined && (it as Record<string, unknown>)[k] === undefined) patch[k] = seedItem[k];
    return { ...it, ...patch };
  });
  return { items: out, changed };
}

/** Built-in fixed pages added in later versions are merged into an existing pages.json automatically. */
function withMissingPages(items: PageSettings[]): PageSettings[] {
  const have = new Set(items.map((p) => p.key));
  const missing = seedPages().filter((p) => !have.has(p.key));
  return missing.length ? [...items, ...missing] : items;
}

/**
 * Built-in countries added in later versions (e.g. India) are merged ONCE into an existing countries.json.
 * A small marker file remembers which built-in slugs were already offered, so anything you delete never comes back.
 */
const LEGACY_COUNTRY_SLUGS = ["united-arab-emirates", "canada", "united-kingdom", "united-states", "australia", "saudi-arabia"];
async function mergeNewBuiltInCountries(items: Country[]): Promise<{ items: Country[]; changed: boolean }> {
  const marker = path.join(CONTENT_DIR, ".offered-countries.json");
  let offered: string[];
  try { offered = JSON.parse(await fs.readFile(marker, "utf8")); } catch { offered = LEGACY_COUNTRY_SLUGS; }
  const fresh = seedCountries.filter((c) => !offered.includes(c.slug));
  if (fresh.length === 0 && offered !== LEGACY_COUNTRY_SLUGS) return { items, changed: false };
  const add = fresh.filter((c) => !items.some((x) => x.slug === c.slug)).map((c) => stamp(c) as unknown as Country);
  try { await fs.writeFile(marker, JSON.stringify([...new Set([...offered, ...seedCountries.map((c) => c.slug)])])); } catch { /* read-only disk */ }
  return { items: [...items, ...add], changed: add.length > 0 };
}

/**
 * Region pages shipped with the built-in content (e.g. the Punjab guide) are copied ONCE into a stored country whose state has no
 * page content yet. Only empty fields are filled, and `v` records it, so your own edits are never overwritten.
 */
const REGION_FIELDS = ["slug", "page", "headline", "answer", "facts", "contentHtml", "faqs", "sources", "updatedAt"] as const;
function backfillRegions(items: Country[]): { items: Country[]; changed: boolean } {
  let changed = false;
  const out = items.map((c) => {
    const seedC = seedCountries.find((x) => x.slug === c.slug);
    if (!seedC?.regions?.some((r) => r.v)) return c;
    const regions = [...(c.regions ?? [])];
    let touched = false;
    for (const sr of seedC.regions) {
      if (!sr.v) continue;
      const i = regions.findIndex((r) => r.name === sr.name);
      if (i < 0 || (regions[i].v ?? 0) >= sr.v) continue;
      const cur = regions[i] as unknown as Record<string, unknown>;
      const patch: Record<string, unknown> = { v: sr.v };
      for (const k of REGION_FIELDS) if (cur[k] === undefined || cur[k] === "" ) patch[k] = (sr as unknown as Record<string, unknown>)[k];
      regions[i] = { ...regions[i], ...patch } as typeof regions[number];
      touched = true;
    }
    if (!touched) return c;
    changed = true;
    return { ...c, regions };
  });
  return { items: out, changed };
}

/** parsed JSON is cached until the file changes (cheap stat), so frequent polling (chat) stays fast */
const cache = new Map<string, { sig: string; data: unknown }>();

export async function readAll<K extends CollectionName>(name: K): Promise<CollectionMap[K][]> {
  try {
    const st = await fs.stat(file(name));
    const sig = `${st.mtimeMs}:${st.size}`;
    const hit = cache.get(name);
    if (hit && hit.sig === sig) return structuredClone(hit.data) as CollectionMap[K][];
    const data = JSON.parse(await fs.readFile(file(name), "utf8"));
    let out = (name === "pages" ? withMissingPages(data) : data) as CollectionMap[K][];
    if (name === "countries") {
      const m = await mergeNewBuiltInCountries(out as unknown as Country[]);
      if (m.changed) { out = m.items as unknown as CollectionMap[K][]; try { await writeAll(name, out); } catch { /* read-only disk */ } }
      const b = backfillRegions(out as unknown as Country[]);
      if (b.changed) { out = b.items as unknown as CollectionMap[K][]; try { await writeAll(name, out); } catch { /* read-only disk */ } }
    }
    if (name === "services" || name === "countries" || name === "posts") {
      const seedItems = (name === "services" ? seedServices : name === "countries" ? seedCountries : seedPosts) as unknown as { slug: string; geoV?: number }[];
      const r = backfillGeo(out as unknown as { slug: string; geoV?: number }[], seedItems);
      if (r.changed) {
        out = r.items as unknown as CollectionMap[K][];
        try { await writeAll(name, out); } catch { /* read-only disk: served from memory */ }
        return out;
      }
    }
    cache.set(name, { sig, data: structuredClone(out) });
    return out;
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

export async function removePreview(id: string): Promise<void> {
  if (safeId(id)) await fs.rm(path.join(PREVIEW_DIR, `${id}.json`), { force: true });
}
