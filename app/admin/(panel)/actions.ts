"use server";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { mutate, readAll, now, UPLOAD_DIR, type CollectionMap } from "@/lib/store";
import { refreshSite } from "@/lib/revalidate";
import { cleanCountry, cleanPage, cleanPost, cleanService, str, cleanFaqs, type Errors } from "@/lib/validate";
import type { FaqGroup } from "@/types/content";

export type SaveResult = { ok: boolean; id?: string; errors?: Errors; message?: string };
type Kind = "services" | "countries" | "posts";

const cleaners = { services: cleanService, countries: cleanCountry, posts: cleanPost } as const;
const adminPath = (k: Kind) => `/admin/${k}`;

/** Create or update a service / country / post. `payload` is JSON from the editor. */
export async function saveItem(kind: Kind, payload: string, id?: string): Promise<SaveResult> {
  await requireAdmin();
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  const { item, errors } = cleaners[kind](raw) as { item: CollectionMap[Kind]; errors: Errors };

  const all = await readAll(kind);
  const clash = all.find((x) => x.slug === (item as { slug: string }).slug && x.id !== id);
  if (clash) errors.slug = "Another item already uses this URL slug";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields" };

  let savedId = id;
  await mutate(kind, (items) => {
    const i = id ? items.findIndex((x) => x.id === id) : -1;
    if (id && i === -1) throw new Error("Item not found");
    const prev = i >= 0 ? items[i] : undefined;
    savedId = prev?.id ?? randomUUID();
    const next = { ...(prev ?? {}), ...item, id: savedId, createdAt: prev?.createdAt ?? now(), updatedAt: now() } as CollectionMap[Kind];
    // fields the editor can clear must really be cleared
    for (const k of ["image", "imageAlt", "publishAt", "schemaCustom", "seo", "serviceType", "categories", "author", "readMinutes", "contentHtml"] as const) {
      if (!(k in item)) delete (next as Record<string, unknown>)[k];
    }
    if (kind === "posts" && prev) (next as { updated?: string }).updated = now().slice(0, 10);
    return i >= 0 ? items.map((x, n) => (n === i ? next : x)) : [...items, next];
  });
  refreshSite();
  return { ok: true, id: savedId, message: "Saved" };
}

export async function deleteItem(kind: Kind, id: string) {
  await requireAdmin();
  await mutate(kind, (items) => items.filter((x) => x.id !== id));
  refreshSite();
  redirect(adminPath(kind));
}

export async function duplicateItem(kind: Kind, id: string) {
  await requireAdmin();
  let newId = "";
  await mutate(kind, (items) => {
    const src = items.find((x) => x.id === id);
    if (!src) return items;
    let slug = `${src.slug}-copy`, n = 2;
    while (items.some((x) => x.slug === slug)) slug = `${src.slug}-copy-${n++}`;
    newId = randomUUID();
    const copy = { ...src, id: newId, slug, status: "draft", publishAt: undefined, createdAt: now(), updatedAt: now() } as CollectionMap[Kind];
    const titleKey = "title" in copy ? "title" : "name";
    (copy as unknown as Record<string, string>)[titleKey] = `${(src as unknown as Record<string, string>)[titleKey]} (copy)`;
    return [...items, copy];
  });
  refreshSite();
  redirect(`${adminPath(kind)}/${newId}`);
}

export async function setStatus(kind: Kind, id: string, status: "draft" | "published") {
  await requireAdmin();
  await mutate(kind, (items) => items.map((x) => (x.id === id ? { ...x, status, updatedAt: now() } : x)));
  refreshSite();
  redirect(adminPath(kind));
}

/* ---------------- FAQ groups (page /faqs) ---------------- */
export async function saveFaqGroups(payload: string): Promise<SaveResult> {
  await requireAdmin();
  let raw: unknown;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  if (!Array.isArray(raw)) return { ok: false, message: "Invalid data" };
  const errors: Errors = {};
  const prev = await readAll("faqs");
  const groups: FaqGroup[] = raw.slice(0, 40).map((g: Record<string, unknown>, i) => {
    const title = str(g.title, 120);
    if (!title) errors[`g${i}`] = "Group needs a title";
    const old = prev.find((p) => p.id === g.id);
    return { id: old?.id ?? randomUUID(), title, faqs: cleanFaqs(g.faqs), status: g.status === "draft" ? "draft" : "published", createdAt: old?.createdAt ?? now(), updatedAt: now() } as FaqGroup;
  });
  if (Object.keys(errors).length) return { ok: false, errors, message: "Every group needs a title" };
  await mutate("faqs", () => groups);
  refreshSite();
  return { ok: true, message: "FAQs saved" };
}

/* ---------------- fixed pages SEO ---------------- */
export async function savePage(key: string, payload: string): Promise<SaveResult> {
  await requireAdmin();
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  const pages = await readAll("pages");
  const base = pages.find((p) => p.key === key);
  if (!base) return { ok: false, message: "Unknown page" };
  const { item, errors } = cleanPage(raw, base);
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields" };
  await mutate("pages", (items) => items.map((p) => (p.key === key ? { ...item, updatedAt: now() } : p)));
  refreshSite();
  return { ok: true, message: "Saved" };
}

/* ---------------- media ---------------- */
export async function updateMedia(id: string, alt: string, caption: string): Promise<SaveResult> {
  await requireAdmin();
  const a = str(alt, 300);
  if (!a) return { ok: false, errors: { alt: "Alt text is required" }, message: "Alt text is required" };
  await mutate("media", (items) => items.map((m) => (m.id === id ? { ...m, alt: a, caption: str(caption, 300) || undefined } : m)));
  // keep content that uses this image in sync
  const media = (await readAll("media")).find((m) => m.id === id);
  if (media) {
    const url = `/uploads/${media.file}`;
    for (const kind of ["services", "countries", "posts"] as const) {
      await mutate(kind, (items) => items.map((x) => (x.image === url && !x.imageAlt ? { ...x, imageAlt: a } : x)));
    }
  }
  refreshSite();
  return { ok: true, message: "Saved" };
}

export async function deleteMedia(id: string): Promise<SaveResult> {
  await requireAdmin();
  const media = (await readAll("media")).find((m) => m.id === id);
  if (!media) return { ok: false, message: "Not found" };
  const url = `/uploads/${media.file}`;
  const used: string[] = [];
  for (const kind of ["services", "countries", "posts"] as const) {
    for (const x of await readAll(kind)) if (x.image === url || x.seo?.image === url) used.push((x as { title?: string; name?: string }).title ?? (x as { name?: string }).name ?? x.slug);
  }
  if (used.length) return { ok: false, message: `Still used by: ${used.slice(0, 5).join(", ")}. Replace it there first.` };
  await mutate("media", (items) => items.filter((m) => m.id !== id));
  await fs.rm(path.join(UPLOAD_DIR, media.file), { force: true });
  return { ok: true, message: "Deleted" };
}

