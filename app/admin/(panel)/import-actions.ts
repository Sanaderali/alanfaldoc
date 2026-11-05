"use server";

import { requirePerm } from "@/lib/auth";
import { runImport, type ImportMode, type ImportResult } from "./import-core";

export type { ImportRow, ImportResult } from "./import-core";

/** Import a content pack passed as text. (Large files use the /admin/api/data/import route, because server actions cap their input size.) */
export async function importPack(json: string, mode: ImportMode): Promise<ImportResult> {
  const me = await requirePerm("content.edit");
  let pack: Record<string, unknown>;
  try { pack = JSON.parse(json); } catch { return { ok: false, message: "That file is not valid JSON.", rows: [] }; }
  return runImport(me, pack, mode);
}
