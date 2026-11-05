"use server";

import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { readAll } from "@/lib/store";
import { saveItem } from "./actions";

export type ImportRow = { kind: string; title: string; slug: string; result: "created" | "updated" | "error"; message?: string };
export type ImportResult = { ok: boolean; message?: string; rows: ImportRow[] };

const KINDS = ["services", "countries", "posts"] as const;
type Kind = (typeof KINDS)[number];
const MAX_ITEMS = 300;

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
      const r = await saveItem(kind, JSON.stringify({ ...raw, status, publishAt: "" }), existing?.id);
      rows.push({ kind, title, slug, result: r.ok ? (existing ? "updated" : "created") : "error", message: r.ok ? undefined : [r.message, ...Object.values(r.errors ?? {})].filter(Boolean).join(" · ") });
    }
  }
  return { ok: rows.every((r) => r.result !== "error"), rows };
}
