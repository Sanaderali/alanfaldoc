import { assertAdminRequest } from "@/lib/auth";
import { importTranslations } from "@/lib/translate";

export const dynamic = "force-dynamic";

/** Upload ONE translations file for all languages: POST the JSON { "ar": { "English": "translation" }, "de": { ... } } */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "settings.manage");
  if ("error" in auth) return auth.error;
  let data: unknown;
  try { data = await req.json(); } catch { return Response.json({ ok: false, message: "That file is not valid JSON." }, { status: 400 }); }
  const r = await importTranslations(data);
  return Response.json(r, { status: r.ok ? 200 : 400 });
}
