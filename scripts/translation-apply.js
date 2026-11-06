#!/usr/bin/env node
/**
 * Merge a chunk of translations into translation-work/<lang>.json.
 *   node scripts/translation-apply.js <lang> <chunk.json>
 * The chunk is { "<id>": "translation", ... } using the ids printed by scripts/translation-todo.js.
 * Entries that change numbers, HTML tags or links are rejected and listed so they can be fixed.
 */
const fs = require("fs");
const [lang, chunkFile] = process.argv.slice(2);
if (!lang || !chunkFile) { console.error("Usage: node scripts/translation-apply.js <lang> <chunk.json>"); process.exit(1); }
const src = JSON.parse(fs.readFileSync("translation-work/source.json", "utf8"));
const all = [...src.stage1, ...src.stage2];
const chunk = JSON.parse(fs.readFileSync(chunkFile, "utf8"));
const file = `translation-work/${lang}.json`;
let work = {};
try { work = JSON.parse(fs.readFileSync(file, "utf8")); } catch { /* new */ }

const digits = (s) => (s.replace(/<[^>]+>/g, " ").match(/\d[\d.,]*/g) || []).map((x) => x.replace(/[.,]+$/, ""));
const acronyms = (s) => (s.replace(/<[^>]+>/g, " ").match(/\b(AED|DET|DED|MOHRE|GDRFA|ICP|PRO|MOA|POA|NOC|VAT|MOFA|LLC|HACCP|IBAN)\b/g) || []).sort().join(",");
const tags = (s) => (s.match(/<\/?[a-z]+/gi) || []).map((t) => t.toLowerCase()).sort().join(",");
const hrefs = (s) => (s.match(/href="[^"]*"/g) || []).sort().join(",");

let ok = 0; const rejected = [];
for (const [id, t] of Object.entries(chunk)) {
  const u = all[Number(id)];
  if (u === undefined || typeof t !== "string" || !t.trim()) { rejected.push(`${id}: unknown id or empty`); continue; }
  const why = [];
  if (digits(u).some((d) => !digits(t).includes(d))) why.push("numbers changed");
  if (u.includes("<") && (tags(u) !== tags(t) || hrefs(u) !== hrefs(t))) why.push("HTML tags or links changed");
  if (why.length) { rejected.push(`${id}: ${why.join(", ")} | ${u.slice(0, 80)}`); continue; }
  work[u] = t; ok++;
}
fs.writeFileSync(file, JSON.stringify(work));
console.log(`[${lang}] merged ${ok}; rejected ${rejected.length}; total in ${file}: ${Object.keys(work).length}`);
if (rejected.length) console.log(rejected.join("\n"));
