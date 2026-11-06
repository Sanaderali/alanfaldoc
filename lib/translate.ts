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
/** English source of every cached sentence (hash -> English), so translations can be exported with readable keys. */
let srcMem: Record<string, string> | null = null;
async function loadSrc(): Promise<Record<string, string>> {
  if (srcMem) return srcMem;
  try { srcMem = JSON.parse(await fs.readFile(path.join(DIR, "_en.json"), "utf8")); } catch { srcMem = {}; }
  return srcMem!;
}
async function saveSrc() {
  try { await fs.mkdir(DIR, { recursive: true }); const f = path.join(DIR, "_en.json"); await fs.writeFile(f + ".tmp", JSON.stringify(srcMem ?? {})); await fs.rename(f + ".tmp", f); } catch { /* read-only disk */ }
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
const MODEL = () => process.env.GROQ_TRANSLATE_MODEL || "openai/gpt-oss-20b"; // own model: translations never use up the chat assistant's rate limit

async function callGroq(lang: string, items: string[]): Promise<string[] | null> {
  const key2 = process.env.GROQ_API_KEY;
  if (!key2) return null;
  const language = LANGUAGES.find((l) => l.code === lang)!.english;
  const bodyFor = (model: string) => JSON.stringify({
    model, temperature: 0.2, max_tokens: 4000, response_format: { type: "json_object" },
    ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
    messages: [
      { role: "system", content: `You translate website text for Al Anfal Documents Clearing Services LLC, a Dubai business-setup and document-clearing company, into ${language}. Use natural, professional wording a native speaker would use. Keep brand names (Al Anfal Doc), phone numbers, email addresses, URLs, numbers, currency codes (AED) and official UAE authority abbreviations (DET, MOHRE, GDRFA, ICP, DLD, PRO, Ejari) unchanged. Some inputs are short pieces of HTML (tags such as a, strong, em, br): keep every tag and attribute exactly as given and translate only the visible text, placing the tags where they belong in the translated sentence. Do not add or remove information. Input is a JSON object {"0": "text", ...}. Return ONLY a JSON object with the same keys and the translated text as values.` },
      { role: "user", content: JSON.stringify(Object.fromEntries(items.map((t, i) => [String(i), t]))) },
    ],
  });
  // the translation model first; if the project blocks it, the main model does the job
  const models = [...new Set([MODEL(), process.env.GROQ_MODEL || "openai/gpt-oss-120b"])];
  let mi = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${BASE()}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${key2}`, "Content-Type": "application/json" }, body: bodyFor(models[mi]), signal: AbortSignal.timeout(40000) });
      if (res.status === 429 && attempt === 0) { await new Promise((r) => setTimeout(r, Math.min(8, Number(res.headers.get("retry-after")) || 3) * 1000)); continue; }
      if ((res.status === 403 || res.status === 404) && mi < models.length - 1) { mi++; continue; }
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
  const src = await loadSrc();
  // groups of up to 20 strings (and about 5,000 characters) per request
  const groups: string[][] = [];
  let cur: string[] = [], size = 0;
  for (const t of todo) { if (cur.length >= 20 || size + t.length > 6000) { groups.push(cur); cur = []; size = 0; } cur.push(t); size += t.length; }
  if (cur.length) groups.push(cur);
  let next = 0;
  const worker = async () => {
    while (next < groups.length) {
      const g = groups[next++];
      const r = await callGroq(lang, g);
      if (!r) continue;
      g.forEach((t, i) => { if (r[i]) { cache[key(t)] = r[i]; out[t] = r[i]; fresh++; src[key(t)] = t; } });
    }
  };
  await Promise.all([worker(), worker()]);
  if (fresh) { await save(lang, cache); await saveSrc(); }
  return { out, fresh };
}

/** how many strings of this list are not translated yet (used by the pre-translation tool) */
export async function countMissing(lang: string, texts: string[]): Promise<number> {
  const cache = await load(lang);
  return texts.filter((t) => !cache[key(t)]).length;
}

/**
 * Import translations from one file: { "ar": { "English sentence": "translation", ... }, "de": { ... }, ... }.
 * Entries are matched to the website by sentence, so one file can hold every language and be uploaded again at any time
 * (newer translations replace older ones). Returns how many sentences were added or changed per language.
 */
export async function importTranslations(data: unknown): Promise<{ ok: boolean; message?: string; result: Record<string, number> }> {
  const result: Record<string, number> = {};
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, message: "The file must be an object with language codes as keys, for example {\"ar\": {\"Home\": \"الرئيسية\"}}.", result };
  const codes = new Set(LANGUAGES.map((l) => l.code).filter((c) => c !== "en"));
  for (const [lang, entries] of Object.entries(data as Record<string, unknown>)) {
    if (!codes.has(lang) || !entries || typeof entries !== "object" || Array.isArray(entries)) continue;
    const cache = await load(lang);
    const src = await loadSrc();
    let n = 0;
    for (const [en, tr] of Object.entries(entries as Record<string, unknown>)) {
      const source = en.trim(), text = typeof tr === "string" ? tr.trim() : "";
      if (!source || !text || source.length > 600 || text.length > 2000) continue;
      if (src[key(source)] !== source) src[key(source)] = source;
      if (cache[key(source)] !== text) { cache[key(source)] = text; n++; }
    }
    if (n) await save(lang, cache);
    result[lang] = n;
  }
  await saveSrc();
  if (!Object.keys(result).length) return { ok: false, message: "No supported language codes found. Use: " + [...codes].join(", ") + ".", result };
  return { ok: true, result };
}

/** Translations that can be exported with their English text: { lang: { english: translation } }. */
export async function exportTranslations(langs: string[]): Promise<Record<string, Record<string, string>>> {
  const src = await loadSrc();
  const out: Record<string, Record<string, string>> = {};
  for (const lang of langs) {
    if (!LANGUAGES.some((l) => l.code === lang && l.code !== "en")) continue;
    const cache = await load(lang);
    const m: Record<string, string> = {};
    for (const [h, tr] of Object.entries(cache)) if (src[h]) m[src[h]] = tr;
    if (Object.keys(m).length) out[lang] = m;
  }
  return out;
}

/** How many sentences each language has (and how many of those can be exported). */
export async function translationStats(): Promise<{ code: string; name: string; total: number; exportable: number }[]> {
  const src = await loadSrc();
  const rows: { code: string; name: string; total: number; exportable: number }[] = [];
  for (const l of LANGUAGES) {
    if (l.code === "en") continue;
    const cache = await load(l.code);
    const keys = Object.keys(cache);
    rows.push({ code: l.code, name: l.english, total: keys.length, exportable: keys.filter((h) => src[h]).length });
  }
  return rows;
}

/** A translation already in the cache (never calls the AI): used by the local chat library to answer in the visitor's language. */
export async function cachedTranslation(lang: string, text: string): Promise<string | undefined> {
  if (lang === "en") return text;
  const cache = await load(lang);
  return cache[key(text.trim())];
}
