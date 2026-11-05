import { assertAdminRequest } from "@/lib/auth";
import { getJob, startWarm } from "@/lib/translate-site";

export const dynamic = "force-dynamic";

/** GET = progress of the current run. POST { langs: string[], scope: "main" | "all" } = start translating the site in the background. */
export async function GET(req: Request) {
  const auth = await assertAdminRequest(req, "settings.manage");
  if ("error" in auth) return auth.error;
  return Response.json({ job: getJob(), ai: !!process.env.GROQ_API_KEY });
}

export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "settings.manage");
  if ("error" in auth) return auth.error;
  if (!process.env.GROQ_API_KEY) return Response.json({ ok: false, message: "GROQ_API_KEY is not set on the server." }, { status: 400 });
  const b = (await req.json().catch(() => ({}))) as { langs?: unknown; scope?: unknown };
  const base = (process.env.WARM_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const r = await startWarm(base, Array.isArray(b.langs) ? b.langs.map(String) : [], b.scope === "all" ? "all" : b.scope === "core" ? "core" : "main");
  return Response.json(r, { status: r.ok ? 200 : 400 });
}
