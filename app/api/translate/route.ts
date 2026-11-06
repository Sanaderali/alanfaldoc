import { clientIp } from "@/lib/auth";
import { LANG_CODES } from "@/lib/languages";
import { allow } from "@/lib/ratelimit";
import { translateBatch } from "@/lib/translate";

export const dynamic = "force-dynamic";

/** POST { lang, texts: string[] } -> { map: { original: translated } }. Cached; public, rate limited. */
export async function POST(req: Request) {
  const ip = await clientIp();
  if (!allow(`tr:${ip}`, 40, 60 * 1000)) return Response.json({ error: "Too many requests" }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as { lang?: unknown; texts?: unknown };
  const lang = String(b.lang ?? "");
  if (!LANG_CODES.includes(lang) || lang === "en") return Response.json({ error: "Unsupported language" }, { status: 400 });
  if (!Array.isArray(b.texts)) return Response.json({ error: "texts must be a list" }, { status: 400 });
  const texts = [...new Set(b.texts.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter((t) => t.length >= 2 && t.length <= 1800))].slice(0, 60);
  if (!texts.length) return Response.json({ map: {} });
  // each request may cost an AI call for strings not translated before: cap what one visitor can trigger per hour
  if (!allow(`tr-hour:${ip}`, 150, 60 * 60 * 1000)) return Response.json({ error: "Too many requests" }, { status: 429 });
  const { out } = await translateBatch(lang, texts);
  return Response.json({ map: out }, { headers: { "Cache-Control": "no-store" } });
}
