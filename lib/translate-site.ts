import "server-only";
import { Parser } from "htmlparser2";
import { LANGUAGES } from "@/lib/languages";
import { countMissing, translateBatch } from "@/lib/translate";

/**
 * Pre-translation: read the site's own pages (from the sitemap), collect every sentence the browser would translate and
 * translate them in the background, so visitors get their language instantly instead of waiting for the first translation.
 * The text collection mirrors components/Translator.tsx (same skipped elements, same length rules).
 */
const SKIP_TAGS = new Set(["script", "style", "noscript", "code", "pre", "textarea", "svg"]);
const ATTRS = ["placeholder", "alt", "aria-label", "title"];
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

export function collectStrings(html: string): string[] {
  const out = new Set<string>();
  const stack: boolean[] = []; // true = this element (or an ancestor) is skipped
  let buf = ""; // the parser hands over text in pieces (it splits at entities such as &#x27;); a browser text node is the whole run
  const add = (t: string) => { const s = t.trim(); if (s.length >= 2 && s.length <= 600 && /\p{L}/u.test(s)) out.add(s); };
  const flush = () => { if (buf && !(stack[stack.length - 1] ?? false)) add(buf); buf = ""; };
  const p = new Parser({
    onopentag(name, attrs) {
      flush();
      const skipped = (stack[stack.length - 1] ?? false) || SKIP_TAGS.has(name) || "data-notranslate" in attrs || attrs.translate === "no" || attrs.contenteditable === "true";
      if (!skipped) for (const a of ATTRS) if (attrs[a]) add(attrs[a]);
      if (!VOID.has(name)) stack.push(skipped);
    },
    onclosetag(name) { flush(); if (!VOID.has(name)) stack.pop(); },
    oncomment() { flush(); }, // React puts <!-- --> between adjacent text pieces: those are separate text nodes in the browser too
    ontext(text) { buf += text; },
  }, { decodeEntities: true });
  p.write(html); p.end(); flush();
  return [...out];
}

export type Job = { running: boolean; lang: string; langs: string[]; pagesDone: number; pagesTotal: number; stringsDone: number; stringsTotal: number; startedAt: number; finishedAt?: number; error?: string; log: string[] };
let job: Job | null = null;
export const getJob = () => job;

async function sitemapPaths(base: string, scope: "core" | "main" | "all"): Promise<string[]> {
  const xml = await (await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(30000) })).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => { try { return new URL(m[1].replace(/&amp;/g, "&")).pathname; } catch { return ""; } }).filter(Boolean);
  const paths = [...new Set(["/", "/about", "/contact", "/services", "/countries", "/blog", "/faqs", ...urls])];
  if (scope === "all") return paths;
  if (scope === "core") return ["/", "/about", "/contact", "/services", "/countries", "/blog", "/faqs"];
  // main = the fixed pages, each service page and each country guide (not service x country pages, regions or articles)
  return paths.filter((p) => { const seg = p.split("/").filter(Boolean); return seg.length <= 1 || (seg.length === 2 && (seg[0] === "services" || seg[0] === "countries")); }).filter((p) => !p.startsWith("/blog/"));
}

export async function startWarm(base: string, langs: string[], scope: "core" | "main" | "all"): Promise<{ ok: boolean; message?: string }> {
  if (job?.running) return { ok: false, message: "A translation run is already in progress." };
  const chosen = langs.filter((l) => l !== "en" && LANGUAGES.some((x) => x.code === l));
  if (!chosen.length) return { ok: false, message: "Choose at least one language." };
  job = { running: true, lang: chosen[0], langs: chosen, pagesDone: 0, pagesTotal: 0, stringsDone: 0, stringsTotal: 0, startedAt: Date.now(), log: [] };
  void (async () => {
    const j = job!;
    try {
      const paths = await sitemapPaths(base, scope);
      j.pagesTotal = paths.length;
      const all = new Set<string>();
      for (const p of paths) {
        try {
          const r = await fetch(base + p, { headers: { "x-translate-crawl": "1" }, signal: AbortSignal.timeout(30000) });
          if (r.ok) collectStrings(await r.text()).forEach((s) => all.add(s));
        } catch { j.log.push(`could not read ${p}`); }
        j.pagesDone++;
      }
      const texts = [...all];
      j.stringsTotal = texts.length * chosen.length;
      for (const lang of chosen) {
        j.lang = lang;
        for (let i = 0; i < texts.length; i += 40) {
          const chunk = texts.slice(i, i + 40);
          let tries = 0;
          while (tries < 4) { // a busy AI service answers with nothing: wait and retry
            const { fresh } = await translateBatch(lang, chunk);
            if ((await countMissing(lang, chunk)) === 0) break;
            tries++; if (!fresh) await new Promise((r) => setTimeout(r, 5000));
          }
          j.stringsDone += chunk.length;
        }
      }
    } catch (e) { j.error = e instanceof Error ? e.message : "failed"; }
    j.running = false; j.finishedAt = Date.now();
  })();
  return { ok: true };
}
