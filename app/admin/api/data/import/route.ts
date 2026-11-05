import { assertAdminRequest } from "@/lib/auth";
import { runImport, type ImportMode } from "@/app/admin/(panel)/import-core";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Import a selection from an export or content pack: POST { pack: {...}, mode: "draft" | "keep" | "restore" | "schedule" } */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "content.edit");
  if ("error" in auth) return auth.error;
  let body: { pack?: unknown; mode?: unknown };
  try { body = await req.json(); } catch { return Response.json({ ok: false, message: "The request was not valid JSON.", rows: [] }, { status: 400 }); }
  const mode = (["draft", "keep", "restore", "schedule"].includes(String(body.mode)) ? body.mode : "draft") as ImportMode;
  const result = await runImport(auth.user, (body.pack ?? {}) as Record<string, unknown>, mode);
  return Response.json(result);
}
