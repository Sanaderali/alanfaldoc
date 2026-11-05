import "server-only";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { LANGUAGES } from "@/lib/languages";
import { CONTENT_DIR } from "@/lib/store";

/**
 * Website translation with Groq. Every translated string is cached on disk (content/translations/<lang>.json), so each
 * sentence is translated once and every later visitor gets it instantly. Edit a cache file to correct a translation by hand.
 */
const DIR = path.join(CONTENT_DIR, "translations");
const mem = new Map<string, Record<string, string>>();
const key = (t: string) => createHash("sha1").update(t).digest("hex").slice(0, 16);

async function load(lang: string): Promise<Record<string, string>> {
  const hit = mem.get(lang);
  if (hit) return hit;
  let data: Record<string, string> = {};
  try { data = JSON.parse(await fs.readFile(path.join(DIR, `${lang}.json`), "utf8")); } catch { /* first use */ }
  mem.set(lang, data);
  return data;
}
async function save(lang: string, data: Record<string, string>) {
  try {
    await fs.mkdir(DIR, { recursive: true });
    const f = path.join(DIR, `${lang}.json`);
    await fs.writeFile(f + ".tmp", JSON.stringify(data));
    await fs.rename(f + ".tmp", f);
  } catch { /* read-only disk: cache stays in memory */ }
}

const BASE = () => process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = () => process.env.GROQ_MODEL || "openai/gpt-oss-120b";

async function callGroq(lang: string, items: string[]): Promise<string[] | null> {
  const key2 = process.env.GROQ_API_KEY;
  if (!key2) return null;
  const language = LANGUAGES.find((l) => l.code === lang)!.english;
  const body = JSON.stringify({
    model: MODEL(), temperature: 0.2, max_tokens: 4000, response_format: { type: "json_object" },
    ...(MODEL().startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
    messages: [
      { role: "system", content: `You translate website text for Al Anfal Documents Clearing Services LLC, a Dubai business-setup and document-clearing company, into ${language}. Use natural, professional wording a native speaker would use. Keep brand names (Al Anfal Doc), phone numbers, email addresses, URLs, numbers, currency codes (AED) and official UAE authority abbreviations (DET, MOHRE, GDRFA, ICP, DLD, PRO, Ejari) unchanged. Do not add or remove information. Input is a JSON object {"0": "text", ...}. Return ONLY a JSON object with the same keys and the translated text as values.` },
      { role: "user", content: JSON.stringify(Object.fromEntries(items.map((t, i) => [String(i), t]))) },
    ],
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${BASE()}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${key2}`, "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(40000) });
      if (res.status === 429 && attempt === 0) { await new Promise((r) => setTimeout(r, Math.min(8, Number(res.headers.get("retry-after")) || 3) * 1000)); continue; }
      if (!res.ok) { console.error("[translate] Groq returned", res.status); return null; }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const j = JSON.parse((data.choices?.[0]?.message?.content ?? "{}").replace(/^```json|```$/g, "").trim()) as Record<string, unknown>;
      return items.map((_, i) => (typeof j[String(i)] === "string" ? (j[String(i)] as string) : ""));
    } catch (e) { console.error("[translate] failed:", e instanceof Error ? e.message : "unknown"); return null; }
  }
  return null;
}

/** Translate a list of strings; strings that cannot be translated right now are simply left out of the result. */
export async function translateBatch(lang: string, texts: string[]): Promise<{ out: Record<string, string>; fresh: number }> {
  const cache = await load(lang);
  const out: Record<string, string> = {};
  const todo: string[] = [];
  for (const t of texts) { const c = cache[key(t)]; if (c) out[t] = c; else if (!todo.includes(t)) todo.push(t); }
  let fresh = 0;
  // groups of up to 20 strings (and about 5,000 characters) per request
  const groups: string[][] = [];
  let cur: string[] = [], size = 0;
  for (const t of todo) { if (cur.length >= 20 || size + t.length > 5000) { groups.push(cur); cur = []; size = 0; } cur.push(t); size += t.length; }
  if (cur.length) groups.push(cur);
  await Promise.all(groups.map(async (g) => {
    const r = await callGroq(lang, g);
    if (!r) return;
    g.forEach((t, i) => { if (r[i]) { cache[key(t)] = r[i]; out[t] = r[i]; fresh++; } });
  }));
  if (fresh) await save(lang, cache);
  return { out, fresh };
}
