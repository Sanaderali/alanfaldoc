import { can } from "@/lib/rbac";
import { randomUUID } from "node:crypto";
import { mutate, readAll, now } from "@/lib/store";
import { refreshSite } from "@/lib/revalidate";
import { cleanFaqs, cleanLanding, cleanRegions, str, type Errors } from "@/lib/validate";
import { importTranslations } from "@/lib/translate";
import { cleanPage } from "@/lib/validate";
import type { FaqGroup, Knowledge, Landing, Review, User } from "@/types/content";
import { saveItem } from "./actions";

export type ImportRow = { kind: string; title: string; slug: string; result: "created" | "updated" | "error"; message?: string };
export type ImportResult = { ok: boolean; message?: string; rows: ImportRow[] };

export type ImportMode = "draft" | "keep" | "schedule" | "restore";
const KINDS = ["services", "countries", "posts"] as const;
type Kind = (typeof KINDS)[number];
const MAX_ITEMS = 3000;

/**
 * Import a content pack: { "services": [...], "countries": [...], "posts": [...] } where every item has the same fields as the
 * dashboard editor. Items go through the normal validation. An item whose URL slug already exists is updated, otherwise created.
 * mode "draft": everything (also updated items) is saved as a draft for review. mode "keep": updated items keep their live status.
 */
/** Dubai (UTC+4) calendar: day 1 = tomorrow, time "HH:MM" Dubai time -> ISO UTC. */
function scheduleAt(day: number, time: string): string {
  const [hh, mm] = /^\d{1,2}:\d{2}$/.test(time) ? time.split(":").map(Number) : [9, 0];
  const dubai = new Date(Date.now() + 4 * 3600_000);
  return new Date(Date.UTC(dubai.getUTCFullYear(), dubai.getUTCMonth(), dubai.getUTCDate() + Math.max(1, Math.round(day)), hh - 4, mm)).toISOString();
}

export async function runImport(me: User, pack: Record<string, unknown>, mode: ImportMode): Promise<ImportResult> {
  if (!pack || typeof pack !== "object" || Array.isArray(pack)) return { ok: false, message: "The file must be an object with services, countries, posts and/or other lists.", rows: [] };

  const rows: ImportRow[] = [];
  let total = 0;
  for (const k of ["servicePatches", "countryPatches", "landings", "regions", "faqs", "reviews", "pages", "knowledge"] as const) { const l = pack[k]; if (l !== undefined) { if (!Array.isArray(l)) return { ok: false, message: `"${k}" must be a list.`, rows }; total += l.length; } }
  for (const kind of KINDS) {
    const list = pack[kind];
    if (list === undefined) continue;
    if (!Array.isArray(list)) return { ok: false, message: `"${kind}" must be a list.`, rows };
    total += list.length;
  }
  const hasTranslations = !!pack.translations && typeof pack.translations === "object" && !Array.isArray(pack.translations) && Object.keys(pack.translations as object).length > 0;
  if (total === 0 && !hasTranslations) return { ok: false, message: "The file has nothing to import (no services, countries, posts, pages, FAQs, reviews or translations).", rows };
  if (total > MAX_ITEMS) return { ok: false, message: `Too many items (${total}). Import at most ${MAX_ITEMS} at a time.`, rows };

  for (const kind of KINDS) {
    const list = (pack[kind] as Record<string, unknown>[] | undefined) ?? [];
    for (const raw of list) {
      const title = String(raw.title ?? raw.name ?? "(untitled)");
      const slug = String(raw.slug ?? "");
      const existing = (await readAll(kind as Kind)).find((x) => (x as { slug: string }).slug === slug) as { id?: string; status?: string } | undefined;
      let status: string = "draft";
      let publishAt = "";
      if (existing && mode === "keep") status = existing.status ?? "published";
      if (mode === "restore") { status = raw.status === "published" ? "published" : "draft"; publishAt = typeof raw.publishAt === "string" ? raw.publishAt : ""; }
      if (kind === "posts" && mode === "schedule" && Number(raw.scheduleDay) > 0) { status = "published"; publishAt = scheduleAt(Number(raw.scheduleDay), String(raw.scheduleTime ?? "09:00")); }
      if (status === "published" && !can(me, "content.publish")) { status = "draft"; publishAt = ""; }
      const full = existing as Record<string, unknown> | undefined;
      const merged = full ? { ...full, ...raw } : raw; // fields the pack leaves out (e.g. a country's states) are kept
      const r = await saveItem(kind, JSON.stringify({ ...merged, status, publishAt }), existing?.id);
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
      await mutate(coll, (all) => (all as unknown as { slug: string }[]).map((x) => (x.slug === slug ? { ...x, ...(coll === "services" && Array.isArray(p.faqs) ? { faqs: cleanFaqs(p.faqs) } : {}), ...(typeof p.featured === "boolean" ? { featured: p.featured } : {}), ...(status ? { status } : {}), updatedAt: now() } : x)) as never);
      rows.push({ kind: label, title: ex.title ?? ex.name ?? slug, slug, result: "updated", message: [typeof p.featured === "boolean" ? `featured: ${p.featured}` : "", status ? `status: ${status}` : ""].filter(Boolean).join(", ") });
    }
  }

  /* ---- states / provinces with their own pages: merged into the country, existing states are kept ---- */
  for (const raw of (pack.regions as Record<string, unknown>[] | undefined) ?? []) {
    const countrySlug = String(raw.country ?? ""), name = String(raw.name ?? "");
    const country = (await readAll("countries")).find((c) => c.slug === countrySlug);
    const label = `${name}${country ? `, ${country.name}` : ""}`;
    if (!country || !name) { rows.push({ kind: "region", title: label || "(unnamed)", slug: countrySlug, result: "error", message: !country ? `No country with the URL "${countrySlug}"` : "A region needs a name" }); continue; }
    const list = country.regions ?? [];
    const i = list.findIndex((r) => r.name.toLowerCase() === name.toLowerCase() || (!!raw.slug && r.slug === raw.slug));
    const { country: _c, ...fields } = raw; void _c;
    const incoming = { ...(i >= 0 ? list[i] : {}), ...fields, page: i >= 0 && mode === "keep" ? list[i].page ?? "draft" : "draft" };
    const errs: Errors = {};
    const clean = cleanRegions([incoming], errs)?.[0];
    if (!clean || Object.keys(errs).length) { rows.push({ kind: "region", title: label, slug: String(raw.slug ?? ""), result: "error", message: Object.values(errs).join(" · ") || "Invalid region" }); continue; }
    const next = { ...clean, updatedAt: now() };
    const regions = i >= 0 ? list.map((r, n) => (n === i ? next : r)) : [...list, next];
    await mutate("countries", (all) => all.map((c) => (c.slug === countrySlug ? { ...c, regions, updatedAt: now() } : c)));
    rows.push({ kind: "region", title: label, slug: `${countrySlug}/${clean.slug}`, result: i >= 0 ? "updated" : "created" });
  }

  /* ---- service x country pages (always drafts) ---- */
  if (Array.isArray(pack.landings) && pack.landings.length) {
    const [services, countries] = await Promise.all([readAll("services"), readAll("countries")]);
    for (const raw of pack.landings as Record<string, unknown>[]) {
      const { item, errors } = cleanLanding(raw);
      const label = String(raw.title ?? `${raw.service}/${raw.country}`);
      if (!services.some((x) => x.slug === item.service)) errors.service = `No service with the URL "${item.service}"`;
      if (!countries.some((x) => x.slug === item.country)) errors.country = `No country with the URL "${item.country}"`;
      if (Object.keys(errors).length) { rows.push({ kind: "landing", title: label, slug: item.slug, result: "error", message: Object.values(errors).join(" · ") }); continue; }
      const ex = (await readAll("landings")).find((x) => x.slug === item.slug);
      const status = mode === "restore" ? (raw.status === "published" && can(me, "content.publish") ? "published" : "draft") : ex && mode === "keep" ? ex.status ?? "published" : "draft";
      const next = { ...(ex ?? {}), ...item, id: ex?.id ?? randomUUID(), status, createdAt: ex?.createdAt ?? now(), updatedAt: now() } as Landing;
      await mutate("landings", (all) => (ex ? all.map((x) => (x.id === ex.id ? next : x)) : [...all, next]));
      rows.push({ kind: "landing", title: item.title, slug: item.slug, result: ex ? "updated" : "created" });
    }
  }

  /* ---- general FAQ groups (matched by title, saved as drafts) ---- */
  for (const g of (pack.faqs as Record<string, unknown>[] | undefined) ?? []) {
    const title = str(g.title, 120);
    const faqs = cleanFaqs(g.faqs);
    if (!title || faqs.length === 0) { rows.push({ kind: "faq group", title: title || "(untitled)", slug: "", result: "error", message: "A group needs a title and at least one question" }); continue; }
    const ex = (await readAll("faqs")).find((x) => x.title.toLowerCase() === title.toLowerCase());
    const group: FaqGroup = { id: ex?.id ?? randomUUID(), title, faqs, status: mode === "restore" ? (g.status === "published" && can(me, "content.publish") ? "published" : "draft") : ex && mode === "keep" ? ex.status ?? "published" : "draft", createdAt: ex?.createdAt ?? now(), updatedAt: now() };
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
    const rev: Review = { id: randomUUID(), name, role: str(r.role, 120), text, rating, status: mode === "restore" && r.status === "published" && can(me, "content.publish") ? "published" : "draft", createdAt: now(), updatedAt: now() } as Review;
    await mutate("reviews", (all) => [...all, rev]);
    rows.push({ kind: "review", title: name, slug: "", result: "created" });
  }
  /* ---- Page SEO settings (matched by page key) ---- */
  for (const raw of (pack.pages as Record<string, unknown>[] | undefined) ?? []) {
    const key = String(raw.key ?? "");
    if (!can(me, "seo.manage")) { rows.push({ kind: "page SEO", title: key, slug: key, result: "error", message: "You need the SEO permission to import page settings" }); continue; }
    const base = (await readAll("pages")).find((p) => p.key === key);
    if (!base) { rows.push({ kind: "page SEO", title: key || "(no key)", slug: key, result: "error", message: "Unknown page" }); continue; }
    const { item, errors } = cleanPage(raw, base);
    if (Object.keys(errors).length) { rows.push({ kind: "page SEO", title: base.name, slug: key, result: "error", message: Object.values(errors).join(" · ") }); continue; }
    await mutate("pages", (all) => all.map((p) => (p.key === key ? { ...item, updatedAt: now() } : p)));
    rows.push({ kind: "page SEO", title: base.name, slug: key, result: "updated" });
  }

  /* ---- AI knowledge (matched by question) ---- */
  for (const raw of (pack.knowledge as Record<string, unknown>[] | undefined) ?? []) {
    const question = str(raw.question, 300), answer = str(raw.answer, 1200);
    if (!can(me, "chat.reply")) { rows.push({ kind: "AI knowledge", title: question, slug: "", result: "error", message: "You need the chat permission to import AI knowledge" }); continue; }
    if (!question || !answer) { rows.push({ kind: "AI knowledge", title: question || "(empty)", slug: "", result: "error", message: "Needs a question and an answer" }); continue; }
    const ex = (await readAll("knowledge")).find((k) => k.question === question);
    const item: Knowledge = { id: ex?.id ?? randomUUID(), status: "published", question, answer, addedBy: ex?.addedBy ?? me.name, createdAt: ex?.createdAt ?? now(), updatedAt: now() };
    await mutate("knowledge", (all) => (ex ? all.map((k) => (k.id === ex.id ? item : k)) : [item, ...all]));
    rows.push({ kind: "AI knowledge", title: question, slug: "", result: ex ? "updated" : "created" });
  }

  /* ---- translations: { lang: { "English sentence": "translation" } } ---- */
  if (hasTranslations) {
    if (!can(me, "settings.manage")) rows.push({ kind: "translations", title: "Translations", slug: "", result: "error", message: "You need the settings permission to import translations" });
    else {
      const t = await importTranslations(pack.translations);
      if (!t.ok) rows.push({ kind: "translations", title: "Translations", slug: "", result: "error", message: t.message });
      else for (const [lang, n] of Object.entries(t.result)) rows.push({ kind: "translations", title: lang, slug: "", result: n ? "updated" : "updated", message: `${n} sentence${n === 1 ? "" : "s"} added or changed` });
    }
  }
  refreshSite();
  return { ok: rows.every((r) => r.result !== "error"), rows };
}
