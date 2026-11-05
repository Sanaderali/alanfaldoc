import { assertAdminRequest } from "@/lib/auth";
import { buildExport, EXPORT_TYPES } from "@/lib/data-transfer";

export const dynamic = "force-dynamic";

/** Download a selection of the site's content as one JSON file: POST { types, ids?, status?, langs? } */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "backup.export");
  if ("error" in auth) return auth.error;
  const b = (await req.json().catch(() => ({}))) as { types?: unknown; ids?: unknown; status?: unknown; langs?: unknown };
  const allowed = EXPORT_TYPES.map((t) => t.key as string);
  const types = Array.isArray(b.types) ? b.types.map(String).filter((t) => allowed.includes(t)) : [];
  if (!types.length) return Response.json({ error: "Choose at least one type of content to export." }, { status: 400 });
  const ids: Record<string, string[] | null> = {};
  if (b.ids && typeof b.ids === "object") for (const [k, v] of Object.entries(b.ids as Record<string, unknown>)) ids[k] = Array.isArray(v) ? v.map(String) : null;
  const pack = await buildExport({ types, ids, status: b.status === "published" ? "published" : "all", langs: Array.isArray(b.langs) ? b.langs.map(String) : undefined });
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(pack, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="alanfaldoc-export-${stamp}.json"`, "Cache-Control": "no-store" } });
}
