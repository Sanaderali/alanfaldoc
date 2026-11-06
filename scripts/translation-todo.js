#!/usr/bin/env node
/**
 * Show the next English units that still need a translation, numbered by their id.
 *   node scripts/translation-todo.js <lang> [--stage 1|2|all] [--count 120] [--max-chars 14000]
 * Translate them into a file { "<id>": "translation", ... } and merge it with scripts/translation-apply.js.
 */
const fs = require("fs");
const lang = process.argv[2];
const args = process.argv.slice(3);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
if (!lang) { console.error("Usage: node scripts/translation-todo.js <lang> [--stage 1|2|all] [--count 120] [--max-chars 14000]"); process.exit(1); }
const src = JSON.parse(fs.readFileSync("translation-work/source.json", "utf8"));
const all = [...src.stage1, ...src.stage2];
const stage = opt("--stage", "1");
const range = stage === "1" ? [0, src.stage1.length] : stage === "2" ? [src.stage1.length, all.length] : [0, all.length];
let work = {};
try { work = JSON.parse(fs.readFileSync(`translation-work/${lang}.json`, "utf8")); } catch { /* none yet */ }
const count = Number(opt("--count", 120)), maxChars = Number(opt("--max-chars", 14000));
let shown = 0, chars = 0, left = 0;
for (let i = range[0]; i < range[1]; i++) {
  if (work[all[i]]) continue;
  left++;
  if (shown < count && chars + all[i].length <= maxChars) { console.log(`${i}\t${all[i]}`); shown++; chars += all[i].length; }
}
console.error(`\n[${lang}] showing ${shown}; ${left} units left in stage ${stage} (of ${range[1] - range[0]})`);
