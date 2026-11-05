"use server";

import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { randomUUID } from "node:crypto";
import { mutate, readAll, now } from "@/lib/store";
import { refreshSite } from "@/lib/revalidate";
import { cleanFaqs, str } from "@/lib/validate";
import type { FaqGroup, Review } from "@/types/content";
import { saveItem } from "./actions";

export type ImportRow = { kind: string; title: string; slug: string; result: "created" | "updated" | "error"; message?: string };
export type ImportResult = { ok: boolean; message?: string; rows: ImportRow[] };

const KINDS = ["services", "countries", "posts"] as const;
type Kind = (typeof KINDS)[number];
const MAX_ITEMS = 400;

/**
 * Import a content pack: { "services": [...], "countries": [...], "posts": [...] } where every item has the same fields as the
 * dashboard editor. Items go through the normal validation. An item whose URL slug already exists is updated, otherwise created.
 * mode "draft": everything (also updated items) is saved as a draft for review. mode "keep": updated items keep their live status.
 */
export async function importPack(json: string, mode: "draft" | "keep"): Promise<ImportResult> {
  const me = await requirePerm("content.edit");
  let pack: Record<string, unknown>;
  try { pack = JSON.parse(json); } catch { return { ok: false, message: "That file is not valid JSON.", rows: [] }; }
  if (!pack || typeof pack !== "object" || Array.isArray(pack)) return { ok: false, message: "The pack must be an object with services, countries and/or posts lists.", rows: [] };

  const rows: ImportRow[] = [];
  let total = 0;
  for (const k of ["servicePatches", "countryPatches", "faqs", "reviews"] as const) { const l = pack[k]; if (l !== undefined) { if (!Array.isArray(l)) return { ok: false, message: `"${k}" must be a list.`, rows }; total += l.length; } }
  for (const kind of KINDS) {
    const list = pack[kind];
    if (list === undefined) continue;
    if (!Array.isArray(list)) return { ok: false, message: `"${kind}" must be a list.`, rows };
    total += list.length;
  }
  if (total === 0) return { ok: false, message: "The pack has no services, countries or posts.", rows };
  if (total > MAX_ITEMS) return { ok: false, message: `Too many items (${total}). Import at most ${MAX_ITEMS} at a time.`, rows };

  for (const kind of KINDS) {
    const list = (pack[kind] as Record<string, unknown>[] | undefined) ?? [];
    for (const raw of list) {
      const title = String(raw.title ?? raw.name ?? "(untitled)");
      const slug = String(raw.slug ?? "");
      const existing = (await readAll(kind as Kind)).find((x) => (x as { slug: string }).slug === slug) as { id?: string; status?: string } | undefined;
      let status: string = "draft";
      if (existing && mode === "keep") status = existing.status ?? "published";
      if (status === "published" && !can(me, "content.publish")) status = "draft";
      const full = existing as Record<string, unknown> | undefined;
      const merged = full ? { ...full, ...raw } : raw; // fields the pack leaves out (e.g. a country's states) are kept
      const r = await saveItem(kind, JSON.stringify({ ...merged, status, publishAt: "" }), existing?.id);
      rows.push({ kind, title, slug, result: r.ok ? (existing ? "updated" : "created") : "error", message: r.ok ? undefined : [r.message, ...Object.values(r.errors ?? {})].filter(Boolean).join(" · ") });
    }
  }

  /* ---- small changes to existing services / countries: { slug, featured?, status? } ---- */
  for (const [key, coll, label] of [["servicePatches", "services", "service change"], ["countryPatches", "countries", "country change"]] as const) {
    for (const p of (pack[key] as Record<string, unknown>[] | undefined) ?? []) {
      const slug = String(p.slug ?? "");
      const ex = ((await readAll(coll)) as unknown as { slug: string; title?: string; name?: string }[]).find((x) => x.slug === slug);
      if (!ex) { rows.push({ kind: label, title: slug, slug, result: "error", message: "No page with this URL" }); continue; }
      const status = p.status === "draft" || p.status === "published" ? p.status : undefined;
      await mutate(coll, (all) => (all as unknown as { slug: string }[]).map((x) => (x.slug === slug ? { ...x, ...(typeof p.featured === "boolean" ? { featured: p.featured } : {}), ...(status ? { status } : {}), updatedAt: now() } : x)) as never);
      rows.push({ kind: label, title: ex.title ?? ex.name ?? slug, slug, result: "updated", message: [typeof p.featured === "boolean" ? `featured: ${p.featured}` : "", status ? `status: ${status}` : ""].filter(Boolean).join(", ") });
    }
  }

  /* ---- general FAQ groups (matched by title, saved as drafts) ---- */
  for (const g of (pack.faqs as Record<string, unknown>[] | undefined) ?? []) {
    const title = str(g.title, 120);
    const faqs = cleanFaqs(g.faqs);
    if (!title || faqs.length === 0) { rows.push({ kind: "faq group", title: title || "(untitled)", slug: "", result: "error", message: "A group needs a title and at least one question" }); continue; }
    const ex = (await readAll("faqs")).find((x) => x.title.toLowerCase() === title.toLowerCase());
    const group: FaqGroup = { id: ex?.id ?? randomUUID(), title, faqs, status: ex && mode === "keep" ? ex.status ?? "published" : "draft", createdAt: ex?.createdAt ?? now(), updatedAt: now() };
    await mutate("faqs", (all) => (ex ? all.map((x) => (x.id === ex.id ? group : x)) : [...all, group]));
    rows.push({ kind: "faq group", title, slug: "", result: ex ? "updated" : "created" });
  }

  /* ---- reviews (real customer reviews only, saved as drafts) ---- */
  for (const r of (pack.reviews as Record<string, unknown>[] | undefined) ?? []) {
    const name = str(r.name, 80), text = str(r.text, 1200);
    if (!name || !text) { rows.push({ kind: "review", title: name || "(no name)", slug: "", result: "error", message: "A review needs the customer's name and the review text" }); continue; }
    const dup = (await readAll("reviews")).find((x) => x.name === name && x.text === text);
    if (dup) { rows.push({ kind: "review", title: name, slug: "", result: "updated", message: "already exists, skipped" }); continue; }
    const rating = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    const rev: Review = { id: randomUUID(), name, role: str(r.role, 120), text, rating, status: "draft", createdAt: now(), updatedAt: now() } as Review;
    await mutate("reviews", (all) => [...all, rev]);
    rows.push({ kind: "review", title: name, slug: "", result: "created" });
  }
  refreshSite();
  return { ok: rows.every((r) => r.result !== "error"), rows };
}
