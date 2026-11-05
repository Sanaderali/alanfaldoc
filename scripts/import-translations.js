#!/usr/bin/env node
/**
 * Import ONE translations file for all languages (no website upload needed):
 *   CONTENT_DIR=/home/alanuucp/alanfaldoc-content node scripts/import-translations.js translations-all.json
 * File format: { "ar": { "English sentence": "translation", ... }, "de": { ... } }
 * Writes content/translations/<lang>.json (the same cache the website uses). Newer translations replace older ones.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const file = process.argv[2];
if (!file) { console.error("Usage: CONTENT_DIR=<content folder> node scripts/import-translations.js <translations-all.json>"); process.exit(1); }
const home = process.env.HOME || "";
const base = path.resolve(process.env.CONTENT_DIR || (fs.existsSync(path.join(home, "alanfaldoc-content")) ? path.join(home, "alanfaldoc-content") : "content"));
const dir = path.join(base, "translations");
let data;
try { data = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error("Not valid JSON:", e.message); process.exit(1); }
const LANGS = ["ar", "zh", "hi", "de", "fr", "ja", "ko", "it", "es", "nl"];
const key = (t) => crypto.createHash("sha1").update(t).digest("hex").slice(0, 16);
fs.mkdirSync(dir, { recursive: true });
let total = 0;
for (const [lang, entries] of Object.entries(data)) {
  if (!LANGS.includes(lang) || !entries || typeof entries !== "object") { console.error(`skipped "${lang}" (unknown language code)`); continue; }
  const f = path.join(dir, `${lang}.json`);
  let cache = {};
  try { cache = JSON.parse(fs.readFileSync(f, "utf8")); } catch { /* new */ }
  let n = 0;
  for (const [en, tr] of Object.entries(entries)) {
    const s = en.trim(), t = typeof tr === "string" ? tr.trim() : "";
    if (!s || !t || s.length > 600) continue;
    if (cache[key(s)] !== t) { cache[key(s)] = t; n++; }
  }
  fs.writeFileSync(f + ".tmp", JSON.stringify(cache)); fs.renameSync(f + ".tmp", f);
  console.log(`${lang}: ${n} sentences added or updated`); total += n;
}
console.log(`Done. ${total} in total. Restart the app if it is running, then pick the language on the site.`);
