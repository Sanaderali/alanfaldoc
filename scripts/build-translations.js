#!/usr/bin/env node
/**
 * Merge per-language translation work files into ONE upload file and check them.
 *
 *   node scripts/build-translations.js [--out content-packs/translations-all.json] [--stage 1|2|all]
 *
 * Reads translation-work/source.json (the English units) and translation-work/<lang>.json (an object { "English unit": "translation" })
 * for ar, zh, hi, de, fr, ja, ko, it, es, nl. Writes the combined file { "ar": { ... }, "de": { ... } } (existing entries of the
 * output file are kept unless a work file has a newer translation) and prints a coverage + quality report, also saved to
 * translation-work/report.txt. Quality checks per entry: numbers kept, same HTML tags and link addresses.
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const out = opt("--out", "content-packs/translations-all.json");
const stage = opt("--stage", "all");
const dir = "translation-work";
const LANGS = ["ar", "zh", "hi", "de", "fr", "ja", "ko", "it", "es", "nl"];

const src = JSON.parse(fs.readFileSync(path.join(dir, "source.json"), "utf8"));
const units = stage === "1" ? src.stage1 : stage === "2" ? src.stage2 : [...src.stage1, ...src.stage2];
const unitSet = new Set(units);
let combined = {};
try { combined = JSON.parse(fs.readFileSync(out, "utf8")); } catch { /* new file */ }

const digits = (s) => (s.replace(/<[^>]+>/g, " ").match(/\d[\d.,]*/g) || []).map((x) => x.replace(/[.,]+$/, ""));
const acronyms = (s) => (s.replace(/<[^>]+>/g, " ").match(/\b(AED|DET|DED|MOHRE|GDRFA|ICP|PRO|MOA|POA|NOC|VAT|MOFA|LLC|HACCP|IBAN)\b/g) || []).sort().join(",");
const tags = (s) => (s.match(/<\/?[a-z]+/gi) || []).map((t) => t.toLowerCase()).sort().join(",");
const hrefs = (s) => (s.match(/href="[^"]*"/g) || []).sort().join(",");

const lines = [];
let problems = 0;
for (const lang of LANGS) {
  const f = path.join(dir, `${lang}.json`);
  if (!fs.existsSync(f)) { lines.push(`${lang}: no work file`); continue; }
  const work = JSON.parse(fs.readFileSync(f, "utf8"));
  const res = (combined[lang] ||= {});
  let added = 0, missing = 0, bad = 0, same = 0;
  const badList = [];
  for (const u of units) {
    const t = work[u];
    if (typeof t !== "string" || !t.trim()) { missing++; continue; }
    const issues = [];
    if (digits(u).join("|") !== digits(t).join("|") && digits(u).some((d) => !digits(t).includes(d))) issues.push("numbers changed");
    if (u.includes("<") && (tags(u) !== tags(t) || hrefs(u) !== hrefs(t))) issues.push("HTML tags or links changed");
    if (t.trim() === u.trim() && /[a-z]{4,}/i.test(u) && !["de", "fr", "it", "es", "nl"].includes(lang)) same++;
    if (issues.length) { bad++; badList.push(`  - ${issues.join(", ")}: ${u.slice(0, 90)}`); continue; }
    res[u] = t; added++;
  }
  for (const k of Object.keys(work)) if (!unitSet.has(k) && typeof work[k] === "string" && work[k].trim()) { res[k] = work[k]; } // extra entries (e.g. sentences from a newer export)
  lines.push(`${lang}: ${added}/${units.length} translated (${Math.round((100 * added) / units.length)}%), ${missing} missing, ${bad} flagged, ${same} unchanged-English`);
  if (badList.length) lines.push(...badList.slice(0, 15), badList.length > 15 ? `  ... and ${badList.length - 15} more` : "");
  problems += bad;
}
fs.writeFileSync(out, JSON.stringify(combined, null, 1));
const report = [`Source units: ${units.length} (stage ${stage})`, ...lines, `Written: ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`].join("\n");
fs.writeFileSync(path.join(dir, "report.txt"), report + "\n");
console.log(report);
process.exit(problems ? 0 : 0);
