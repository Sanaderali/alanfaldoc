#!/usr/bin/env node
/**
 * List every English sentence a visitor can see, exactly as the translator sees it (the same units the website translates).
 *   node scripts/export-translation-source.js <site url, e.g. http://localhost:3000> [out file]
 * Writes { stage1: [...], stage2: [...] }:
 *   stage1 = fixed pages, header/footer, every service page, country page and state/region page
 *   stage2 = service x country pages and blog posts (long tail), without sentences already in stage1
 * Set CONTENT_DIR=<content folder> to take the list of pages from the content files (exact); otherwise the sitemap is used.
 * Run it against a copy of the site where everything is published, or against the live site.
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const base = (process.argv[2] || "").replace(/\/$/, "");
const out = process.argv[3] || "translation-work/source.json";
if (!base) { console.error("Usage: node scripts/export-translation-source.js <site url> [out file]"); process.exit(1); }

// the collector is the one the pre-translation tool uses (lib/translate-site.ts), loaded without a build step
const file = path.join(__dirname, "..", "lib", "translate-site.ts");
const js = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
new Function("module", "exports", "require", js)(mod, mod.exports, (n) => (n === "server-only" ? {} : n.startsWith("@/") ? { LANGUAGES: [], countMissing: async () => 0, translateBatch: async () => ({}) } : require(path.join(__dirname, "..", "node_modules", n))));
const { collectStrings } = mod.exports;

const KEEP = /^(info@alanfaldoc\.com|\+?[\d\s()./:-]+|Al Anfal Doc|AED|DET|MOHRE|GDRFA|ICP|PRO|Ejari|EN|[A-Z]{2,5})$/;
(async () => {
  const fixed = ["/", "/about", "/contact", "/services", "/countries", "/blog", "/faqs", "/sitemap"];
  let listed = [];
  if (process.env.CONTENT_DIR) {
    // exact list of published pages from the content files (the sitemap can be a few minutes old)
    const rd = (n) => { try { return JSON.parse(fs.readFileSync(path.join(process.env.CONTENT_DIR, n + ".json"), "utf8")); } catch { return []; } };
    const live = (x) => x.status === undefined || x.status === "published";
    for (const x of rd("services").filter(live)) listed.push(`/services/${x.slug}`);
    for (const c of rd("countries").filter(live)) { listed.push(`/countries/${c.slug}`); for (const r of c.regions || []) if (r.page === "published" && r.slug) listed.push(`/countries/${c.slug}/${r.slug}`); }
    for (const x of rd("landings").filter(live)) listed.push(`/services/${x.slug}`);
    for (const x of rd("posts").filter(live)) listed.push(`/blog/${x.slug}`);
  } else {
    const xml = await (await fetch(base + "/sitemap.xml")).text();
    listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => { try { return new URL(m[1]).pathname; } catch { return ""; } }).filter(Boolean);
  }
  const paths = [...new Set([...fixed, ...listed])];
  const stageOf = (p) => { const s = p.split("/").filter(Boolean); if (s[0] === "blog" && s.length >= 2 && !["category", "tag", "page"].includes(s[1])) return 2; if (s[0] === "services" && s.length >= 3) return 2; return 1; };
  const seen = new Set();
  const res = { stage1: [], stage2: [] };
  const pages = { stage1: 0, stage2: 0 };
  for (const stage of [1, 2]) {
    for (const p of paths.filter((x) => stageOf(x) === stage)) {
      let html = "";
      try { const r = await fetch(base + p); if (!r.ok) continue; html = await r.text(); } catch { continue; }
      pages["stage" + stage]++;
      for (const s of collectStrings(html)) if (!seen.has(s) && !KEEP.test(s)) { seen.add(s); res["stage" + stage].push(s); }
    }
  }
  const words = (a) => a.reduce((n, s) => n + s.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length, 0);
  const meta = { generatedAt: new Date().toISOString(), site: base, pages, stage1: { units: res.stage1.length, words: words(res.stage1) }, stage2: { units: res.stage2.length, words: words(res.stage2) } };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ meta, ...res }, null, 1));
  console.log(JSON.stringify(meta, null, 1));
})();
