#!/usr/bin/env node
/**
 * Import a services content pack from the terminal (no website build needed).
 *
 *   CONTENT_DIR=/home/alanuucp/alanfaldoc-content node scripts/import-pack.js content-packs/services-pack-1.json
 *
 * Options:  --dry-run      show what would happen, change nothing
 *           --keep-status  updated pages keep their current status (default: updated pages become drafts for review)
 *
 * New pages are always created as DRAFTS. A page whose URL slug already exists is updated. The current services.json is backed up first.
 * Afterwards open Dashboard -> Services, read each page and press Publish (bulk "Publish" works too).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const dry = args.includes("--dry-run");
const keep = args.includes("--keep-status");
if (!file) { console.error("Usage: CONTENT_DIR=<content folder> node scripts/import-pack.js <pack.json> [--dry-run] [--keep-status]"); process.exit(1); }

const dir = path.resolve(process.env.CONTENT_DIR || (fs.existsSync(path.join(process.env.HOME || "", "alanfaldoc-content")) ? path.join(process.env.HOME, "alanfaldoc-content") : "content"));
const target = path.join(dir, "services.json");
if (!fs.existsSync(target)) { console.error(`No ${target}. Open the website or the dashboard once so it creates its content files, or set CONTENT_DIR to the right folder.`); process.exit(1); }

let pack;
try { pack = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error("Pack is not valid JSON:", e.message); process.exit(1); }
const items = pack.services;
if (!Array.isArray(items) || items.length === 0) { console.error('The pack has no "services" list.'); process.exit(1); }

const strip = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const existing = JSON.parse(fs.readFileSync(target, "utf8"));
const now = new Date().toISOString();
let created = 0, updated = 0;
const out = [...existing];

for (const it of items) {
  const bad = [];
  if (!it.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(it.slug)) bad.push("slug");
  if (!it.title) bad.push("title");
  if (!it.summary) bad.push("summary");
  if (!strip(it.contentHtml)) bad.push("contentHtml");
  if (!Array.isArray(it.faqs) || it.faqs.length === 0) bad.push("faqs");
  if (bad.length) { console.error(`SKIPPED "${it.title || it.slug}": missing/invalid ${bad.join(", ")}`); continue; }
  const i = out.findIndex((x) => x.slug === it.slug);
  const prev = i >= 0 ? out[i] : null;
  const status = prev ? (keep ? prev.status || "published" : "draft") : "draft";
  const item = {
    ...(prev || {}),
    ...it,
    intro: "", highlights: [], sections: [],            // the page body is the visual-editor content
    id: prev?.id || crypto.randomUUID(),
    status, publishAt: undefined,
    geoV: 1,
    createdAt: prev?.createdAt || now, updatedAt: now,
  };
  delete item.publishAt;
  if (prev) { out[i] = item; updated++; } else { out.push(item); created++; }
  console.log(`${prev ? "updated" : "created"}  ${it.slug}  (${status})`);
}

console.log(`\n${created} created, ${updated} updated${dry ? "  [dry run: nothing written]" : ""}`);
if (!dry && (created || updated)) {
  const backup = `${target}.bak-${now.replace(/[:.]/g, "-")}`;
  fs.copyFileSync(target, backup);
  const tmp = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(out, null, 2));
  fs.renameSync(tmp, target);
  console.log(`Backup of the old file: ${backup}`);
  console.log("Next: Dashboard -> Services -> review each page -> Publish.");
}
