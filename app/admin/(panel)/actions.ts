"use server";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { getCurrentUser, requirePerm } from "@/lib/auth";
import { can } from "@/lib/rbac";
import type { Permission } from "@/lib/rbac";
import { mutate, readAll, now, UPLOAD_DIR, writePreview, removePreview, type CollectionMap } from "@/lib/store";
import { refreshSite } from "@/lib/revalidate";
import { cleanCountry, cleanPage, cleanPost, cleanService, str, cleanFaqs, type Errors } from "@/lib/validate";
import type { FaqGroup, Review } from "@/types/content";

export type SaveResult = { ok: boolean; id?: string; errors?: Errors; message?: string };
type Kind = "services" | "countries" | "posts";

const cleaners = { services: cleanService, countries: cleanCountry, posts: cleanPost } as const;
const adminPath = (k: Kind) => `/admin/${k}`;

/** Create or update a service / country / post. `payload` is JSON from the editor. */
export async function saveItem(kind: Kind, payload: string, id?: string): Promise<SaveResult> {
  await requirePerm("content.edit");
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  const { item, errors } = cleaners[kind](raw) as { item: CollectionMap[Kind]; errors: Errors };
  // only people who may publish can publish or schedule; others always save as draft
  const me = await getCurrentUser();
  if ((item as { status?: string }).status === "published" && !can(me, "content.publish")) (item as { status?: string }).status = "draft";

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
    const next = { ...(prev ?? {}), ...item, id: savedId, geoV: 1, createdAt: prev?.createdAt ?? now(), updatedAt: now() } as CollectionMap[Kind];
    // fields the editor can clear must really be cleared
    for (const k of ["image", "imageAlt", "publishAt", "schemaCustom", "seo", "serviceType", "categories", "author", "readMinutes", "contentHtml", "flagImage", "answer", "takeaways", "summaryTable", "sources"] as const) {
      if (!(k in item)) delete (next as Record<string, unknown>)[k];
    }
    if (kind === "posts" && prev) (next as { updated?: string }).updated = now().slice(0, 10);
    return i >= 0 ? items.map((x, n) => (n === i ? next : x)) : [...items, next];
  });
  if (savedId) await removePreview(savedId);
  refreshSite();
  return { ok: true, id: savedId, message: "Saved" };
}

export async function deleteItem(kind: Kind, id: string) {
  await requirePerm("content.delete");
  await mutate(kind, (items) => items.filter((x) => x.id !== id));
  refreshSite();
  redirect(adminPath(kind));
}

export async function duplicateItem(kind: Kind, id: string) {
  await requirePerm("content.edit");
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
  await requirePerm("content.publish");
  await mutate(kind, (items) => items.map((x) => (x.id === id && x.status !== "trash" ? { ...x, status, updatedAt: now() } : x)));
  refreshSite();
  redirect(adminPath(kind));
}

/* ---------------- FAQ groups (page /faqs) ---------------- */
export async function saveFaqGroups(payload: string): Promise<SaveResult> {
  await requirePerm("faqs.manage");
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
  await requirePerm("seo.manage");
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
  await requirePerm("media.manage");
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
  await requirePerm("media.manage");
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


/**
 * Preview: stores the editor's CURRENT (even unsaved) content as a private preview copy, so you can see the real page
 * without changing the live site. Validation problems are ignored here (a preview can be incomplete).
 */
export async function savePreview(kind: Kind | "faqs", payload: string, id?: string): Promise<{ ok: boolean; id?: string; message?: string }> {
  await requirePerm("content.edit");
  let raw: unknown;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  if (kind === "faqs") {
    const groups = (Array.isArray(raw) ? raw : []).map((g: Record<string, unknown>, i) => ({ id: `g${i}`, title: str(g.title, 120) || "Untitled group", faqs: cleanFaqs(g.faqs), status: "published" }));
    await writePreview("faqs", groups);
    return { ok: true, id: "faqs" };
  }
  const { item } = cleaners[kind](raw as Record<string, unknown>) as { item: Record<string, unknown> };
  const pid = id && /^[a-zA-Z0-9-]{1,64}$/.test(id) ? id : `new-${randomUUID()}`;
  const existing = (await readAll(kind)).find((x) => x.id === id);
  await writePreview(pid, { ...(existing ?? {}), ...item, id: pid, createdAt: existing?.createdAt ?? now(), updatedAt: now() });
  return { ok: true, id: pid };
}

/* ---------------- Trash, restore, bulk (WordPress-style lists) ---------------- */
const back = (kind: Kind, qs = "") => redirect(`${adminPath(kind)}${qs}`);

export async function trashItem(kind: Kind, id: string) {
  await requirePerm("content.delete");
  await mutate(kind, (items) => items.map((x) => (x.id === id ? { ...x, status: "trash", updatedAt: now() } : x)));
  refreshSite();
  back(kind);
}
export async function restoreItem(kind: Kind, id: string) {
  await requirePerm("content.delete");
  await mutate(kind, (items) => items.map((x) => (x.id === id ? { ...x, status: "draft", updatedAt: now() } : x)));
  refreshSite();
  back(kind, "?status=trash");
}
export async function deletePermanently(kind: Kind, id: string) {
  await requirePerm("content.delete");
  await mutate(kind, (items) => items.filter((x) => !(x.id === id && x.status === "trash")));
  await removePreview(id);
  refreshSite();
  back(kind, "?status=trash");
}

/** Bulk actions from the list tables. Form fields: kind, action, ids[] */
export async function bulkAction(formData: FormData) {
  await requirePerm("content.edit");
  const kind = String(formData.get("kind")) as Kind;
  if (!["services", "countries", "posts"].includes(kind)) return;
  const action = String(formData.get("action") ?? "");
  if (action === "publish") await requirePerm("content.publish");
  if (["trash", "restore", "delete"].includes(action)) await requirePerm("content.delete");
  const ids = new Set(formData.getAll("ids").map(String));
  if (!ids.size || !action) return back(kind);
  await mutate(kind, (items) => {
    if (action === "delete") return items.filter((x) => !(ids.has(x.id!) && x.status === "trash"));
    const status = action === "publish" ? "published" : action === "draft" ? "draft" : action === "trash" ? "trash" : action === "restore" ? "draft" : null;
    if (!status) return items;
    return items.map((x) => (ids.has(x.id!) ? { ...x, status, updatedAt: now() } : x));
  });
  refreshSite();
  back(kind, `?status=${action === "delete" || action === "restore" ? "trash" : "all"}`);
}

export async function emptyTrash(kind: Kind) {
  await requirePerm("content.delete");
  await mutate(kind, (items) => items.filter((x) => x.status !== "trash"));
  refreshSite();
  back(kind, "?status=all");
}

/** Star / un-star a service or country (featured items are listed first on the home page). */
export async function toggleFeatured(kind: "services" | "countries", id: string) {
  await requirePerm("content.edit");
  await mutate(kind, (items) => items.map((x) => (x.id === id ? { ...x, featured: !(x as { featured?: boolean }).featured, updatedAt: now() } : x)));
  refreshSite();
  refresh();
}

/* ---------------- Reviews ("Our Success Stories" on the home page) ---------------- */
export async function saveReviews(payload: string): Promise<SaveResult> {
  await requirePerm("content.edit");
  let raw: unknown;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  if (!Array.isArray(raw)) return { ok: false, message: "Invalid data" };
  const errors: Errors = {};
  const prev = await readAll("reviews");
  const items: Review[] = raw.slice(0, 100).map((r: Record<string, unknown>, i) => {
    const name = str(r.name, 80);
    const text = str(r.text, 1200);
    if (!name) errors[`r${i}`] = "Every review needs a name";
    else if (!text) errors[`r${i}`] = "Every review needs the review text";
    const old = prev.find((p) => p.id === r.id);
    const rating = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    const image = str(r.image, 300);
    return { id: old?.id ?? randomUUID(), name, role: str(r.role, 120), text, rating, ...(image && /^(\/|https:\/\/)/.test(image) ? { image } : {}), status: r.status === "draft" ? "draft" : "published", createdAt: old?.createdAt ?? now(), updatedAt: now() } as Review;
  });
  if (Object.keys(errors).length) return { ok: false, errors, message: "Every review needs a name and the review text" };
  await mutate("reviews", () => items);
  refreshSite();
  return { ok: true, message: "Reviews saved" };
}

/* ---------------- Categories & tags ---------------- */
export type TermResult = { ok: boolean; message?: string };
const cleanName = (v: unknown) => str(v, 60);

export async function addTerm(type: "category" | "tag", name: string): Promise<TermResult> {
  await requirePerm("taxonomy.manage");
  const n = cleanName(name);
  if (!n) return { ok: false, message: "Enter a name" };
  await mutate("terms", (items) => (items.some((t) => t.type === type && t.name.toLowerCase() === n.toLowerCase()) ? items : [...items, { id: randomUUID(), type, name: n, createdAt: now() }]));
  return { ok: true };
}

export async function renameTerm(type: "category" | "tag", oldName: string, newName: string): Promise<TermResult> {
  await requirePerm("taxonomy.manage");
  const n = cleanName(newName);
  if (!n) return { ok: false, message: "Enter a name" };
  await mutate("terms", (items) => {
    const has = items.some((t) => t.type === type && t.name === oldName);
    const renamed = items.map((t) => (t.type === type && t.name === oldName ? { ...t, name: n } : t));
    return has ? renamed : [...renamed, { id: randomUUID(), type, name: n, createdAt: now() }];
  });
  await mutate("posts", (posts) =>
    posts.map((p) => (type === "category" ? (p.category === oldName ? { ...p, category: n, updatedAt: now() } : p) : p.tags?.includes(oldName) ? { ...p, tags: [...new Set(p.tags.map((t) => (t === oldName ? n : t)))], updatedAt: now() } : p))
  );
  refreshSite();
  return { ok: true };
}

export async function deleteTerm(type: "category" | "tag", name: string): Promise<TermResult> {
  await requirePerm("taxonomy.manage");
  await mutate("terms", (items) => items.filter((t) => !(t.type === type && t.name === name)));
  await mutate("posts", (posts) =>
    posts.map((p) => (type === "category" ? (p.category === name ? { ...p, category: "Uncategorized", updatedAt: now() } : p) : p.tags?.includes(name) ? { ...p, tags: p.tags.filter((t) => t !== name), updatedAt: now() } : p))
  );
  refreshSite();
  return { ok: true };
}
