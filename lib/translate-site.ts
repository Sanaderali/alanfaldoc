import "server-only";
import { parseDocument } from "htmlparser2";
import type { ChildNode, Element } from "domhandler";
import { LANGUAGES } from "@/lib/languages";
import { countMissing, translateBatch } from "@/lib/translate";

/**
 * Pre-translation: read the site's own pages (from the sitemap), collect every sentence the browser would translate and
 * translate them in the background, so visitors get their language instantly instead of waiting for the first translation.
 * The text collection mirrors components/Translator.tsx exactly (same skipped elements, same length rules, and the same rule
 * that a paragraph with links or bold text inside an article is translated as ONE unit, written as canonical HTML).
 */
const SKIP_TAGS = new Set(["script", "style", "noscript", "code", "pre", "textarea", "svg", "title"]);
const ATTRS = ["placeholder", "alt", "aria-label", "title"];
const INLINE = new Set(["a", "strong", "em", "b", "i", "u", "br", "span", "code", "sup", "sub"]);
const BLOCKS = new Set(["p", "li", "h2", "h3", "h4", "blockquote"]);
const VOID = new Set(["br"]);
export const MAX_UNIT = 1800;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escA = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
/** Canonical HTML of a node list: the same text the browser produces in Translator.tsx (attributes sorted, text escaped). */
export function canon(nodes: ChildNode[]): string {
  return nodes.map((n) => {
    if (n.type === "text") return esc((n as unknown as { data: string }).data);
    if (n.type === "tag") {
      const el = n as Element;
      const attrs = Object.entries(el.attribs).sort(([x], [y]) => x.localeCompare(y)).map(([k, v]) => ` ${k}="${escA(v)}"`).join("");
      return VOID.has(el.name) ? `<${el.name}${attrs}>` : `<${el.name}${attrs}>${canon(el.children as ChildNode[])}</${el.name}>`;
    }
    return "";
  }).join("");
}
const isSkipped = (el: Element) => SKIP_TAGS.has(el.name) || "data-notranslate" in el.attribs || el.attribs.translate === "no" || el.attribs.contenteditable === "true";
const hasClass = (el: Element, c: string) => (el.attribs.class ?? "").split(/\s+/).includes(c);
const onlyInline = (el: Element): boolean => (el.children as ChildNode[]).every((c) => c.type !== "tag" || (INLINE.has((c as Element).name) && onlyInline(c as Element)));

export function collectStrings(html: string): string[] {
  const out = new Set<string>();
  const doc = parseDocument(html, { decodeEntities: true });
  const addText = (t: string) => { const s = t.trim(); if (s.length >= 2 && s.length <= 600 && /\p{L}/u.test(s)) out.add(s); };
  const walk = (nodes: ChildNode[], inRich: boolean) => {
    for (const n of nodes) {
      if (n.type === "text") { addText((n as unknown as { data: string }).data); continue; }
      if (n.type !== "tag" && n.type !== "script" && n.type !== "style") continue;
      const el = n as Element;
      if (isSkipped(el)) continue;
      for (const a of ATTRS) if (el.attribs[a]) addText(el.attribs[a]);
      const rich = inRich || hasClass(el, "rich-content");
      // inside an article: a paragraph with links / bold text is one unit
      if (rich && BLOCKS.has(el.name) && (el.children as ChildNode[]).some((c) => c.type === "tag") && onlyInline(el)) {
        const unit = canon(el.children as ChildNode[]).trim();
        if (unit.length >= 2 && unit.length <= MAX_UNIT && /\p{L}/u.test(unit)) out.add(unit);
        continue;
      }
      walk(el.children as ChildNode[], rich);
    }
  };
  walk(doc.children as ChildNode[], false);
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
