#!/usr/bin/env node
/**
 * Import a content pack from the terminal (no website build needed).
 *
 *   CONTENT_DIR=/home/alanuucp/alanfaldoc-content node scripts/import-pack.js content-packs/site-pack-2.json
 *
 * A pack may contain:  services, countries, posts, regions (states with their own pages), landings (service x country pages), servicePatches, countryPatches, faqs (groups), reviews
 * Options:  --dry-run      show what would happen, change nothing
 *           --schedule     blog posts that carry "scheduleDay" are published automatically on those days (day 1 = tomorrow)
 *           --keep-status  updated pages keep their current status (default: updated pages become drafts for review)
 *
 * New pages are always created as DRAFTS. A page whose URL slug already exists is updated and fields the pack does not mention
 * (for example a country's states) are kept. Every file is backed up first. Afterwards open the dashboard, review, and Publish.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const dry = args.includes("--dry-run");
const keep = args.includes("--keep-status");
const schedule = args.includes("--schedule");
if (!file) { console.error("Usage: CONTENT_DIR=<content folder> node scripts/import-pack.js <pack.json> [--dry-run] [--keep-status]"); process.exit(1); }

const home = process.env.HOME || "";
const dir = path.resolve(process.env.CONTENT_DIR || (fs.existsSync(path.join(home, "alanfaldoc-content")) ? path.join(home, "alanfaldoc-content") : "content"));
let pack;
try { pack = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error("Pack is not valid JSON:", e.message); process.exit(1); }

const now = new Date().toISOString();
/** Dubai (UTC+4) calendar: day 1 = tomorrow, time "HH:MM" Dubai time -> ISO UTC. */
function scheduleAt(day, time) {
  const [hh, mm] = /^\d{1,2}:\d{2}$/.test(String(time || "")) ? String(time).split(":").map(Number) : [9, 0];
  const d = new Date(Date.now() + 4 * 3600 * 1000);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + Math.max(1, Math.round(day)), hh - 4, mm)).toISOString();
}
const stamp = now.replace(/[:.]/g, "-");
const strip = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pending = new Map(); // file -> array
const stats = {};
const bump = (k, what) => { stats[k] = stats[k] || { created: 0, updated: 0, skipped: 0 }; stats[k][what]++; };

function load(name) {
  if (pending.has(name)) return pending.get(name);
  const f = path.join(dir, name + ".json");
  if (!fs.existsSync(f) && name === "landings") { fs.mkdirSync(dir, { recursive: true }); pending.set(name, []); return pending.get(name); }
  if (!fs.existsSync(f)) { console.error(`No ${f}. Open the website or the dashboard once so it creates its content files, or set CONTENT_DIR to the right folder.`); process.exit(1); }
  const arr = JSON.parse(fs.readFileSync(f, "utf8"));
  pending.set(name, arr);
  return arr;
}

function upsertPages(kind, items) {
  const arr = load(kind);
  for (const it of items) {
    const bad = [];
    if (!it.slug || !SLUG.test(it.slug)) bad.push("slug");
    if (!(it.title || it.name)) bad.push("title");
    if (!it.summary) bad.push("summary");
    if (!strip(it.contentHtml)) bad.push("contentHtml");
    if (bad.length) { console.error(`SKIPPED ${kind} "${it.title || it.name || it.slug}": missing/invalid ${bad.join(", ")}`); bump(kind, "skipped"); continue; }
    const i = arr.findIndex((x) => x.slug === it.slug);
    const prev = i >= 0 ? arr[i] : null;
    const status = prev ? (keep ? prev.status || "published" : "draft") : "draft";
    const item = { ...(prev || {}), ...it, intro: "", sections: [], ...(kind === "services" ? { highlights: [] } : {}), id: prev?.id || crypto.randomUUID(), status, geoV: 1, createdAt: prev?.createdAt || now, updatedAt: now };
    delete item.publishAt;
    if (prev) arr[i] = item; else arr.push(item);
    bump(kind, prev ? "updated" : "created");
    console.log(`${prev ? "updated" : "created"}  ${kind}/${it.slug}  (${status})`);
  }
}

if (Array.isArray(pack.services)) upsertPages("services", pack.services);
if (Array.isArray(pack.countries)) upsertPages("countries", pack.countries);

for (const p of pack.posts || []) {
  const arr = load("posts");
  const bad = [];
  if (!p.slug || !SLUG.test(p.slug)) bad.push("slug");
  if (!p.title) bad.push("title");
  if (!p.excerpt) bad.push("excerpt");
  if (!p.category) bad.push("category");
  if (!strip(p.contentHtml)) bad.push("contentHtml");
  if (bad.length) { console.error(`SKIPPED post "${p.title || p.slug}": missing/invalid ${bad.join(", ")}`); bump("posts", "skipped"); continue; }
  const i = arr.findIndex((x) => x.slug === p.slug); const prev = i >= 0 ? arr[i] : null;
  let status = prev ? (keep ? prev.status || "published" : "draft") : "draft";
  let publishAt;
  if (schedule && Number(p.scheduleDay) > 0) { status = "published"; publishAt = scheduleAt(Number(p.scheduleDay), p.scheduleTime); }
  const { scheduleDay, scheduleTime, ...rest } = p;
  const item = { ...(prev || {}), ...rest, body: [], id: prev?.id || crypto.randomUUID(), status, geoV: 1, createdAt: prev?.createdAt || now, updatedAt: now, date: (publishAt || prev?.publishAt || now).slice(0, 10) };
  if (publishAt) item.publishAt = publishAt; else delete item.publishAt;
  if (prev) arr[i] = item; else arr.push(item);
  bump("posts", prev ? "updated" : "created");
  console.log(`${prev ? "updated" : "created"}  posts/${p.slug}  (${status}${publishAt ? ", goes live " + publishAt.slice(0, 16).replace("T", " ") + " UTC" : ""})`);
}

for (const r of pack.regions || []) {
  const arr = load("countries"); const ci = arr.findIndex((c) => c.slug === r.country);
  if (ci < 0 || !r.name) { console.error(`SKIPPED region "${r.name}": no country ${r.country}`); bump("regions", "skipped"); continue; }
  const list = arr[ci].regions || [];
  const i = list.findIndex((x) => String(x.name).toLowerCase() === String(r.name).toLowerCase() || (r.slug && x.slug === r.slug));
  const { country, ...fields } = r;
  const item = { ...(i >= 0 ? list[i] : {}), ...fields, slug: fields.slug || String(r.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""), page: i >= 0 && keep ? list[i].page || "draft" : "draft", updatedAt: now };
  if (i >= 0) list[i] = item; else list.push(item);
  arr[ci].regions = list; arr[ci].updatedAt = now;
  bump("regions", i >= 0 ? "updated" : "created"); console.log(`${i >= 0 ? "updated" : "created"}  regions/${r.country}/${item.slug}`);
}

for (const [key, coll, label] of [["servicePatches", "services", "service changes"], ["countryPatches", "countries", "country changes"]]) {
  for (const p of pack[key] || []) {
    const arr = load(coll); const i = arr.findIndex((x) => x.slug === p.slug);
    if (i < 0) { console.error(`SKIPPED change: no page ${coll}/${p.slug}`); bump(label, "skipped"); continue; }
    if (typeof p.featured === "boolean") arr[i].featured = p.featured;
    if (p.status === "draft" || p.status === "published") arr[i].status = p.status;
    arr[i].updatedAt = now; bump(label, "updated");
    console.log(`changed  ${coll}/${p.slug}  ${typeof p.featured === "boolean" ? "featured=" + p.featured : ""} ${p.status ? "status=" + p.status : ""}`);
  }
}

for (const l of pack.landings || []) {
  const arr = load("landings");
  const bad = [];
  if (!l.service || !SLUG.test(l.service)) bad.push("service");
  if (!l.country || !SLUG.test(l.country)) bad.push("country");
  if (!l.title) bad.push("title");
  if (!l.headline) bad.push("headline");
  if (!strip(l.contentHtml)) bad.push("contentHtml");
  if (bad.length) { console.error(`SKIPPED landing "${l.title || l.service + "/" + l.country}": missing/invalid ${bad.join(", ")}`); bump("service x country pages", "skipped"); continue; }
  const slug = `${l.service}/${l.country}`;
  const i = arr.findIndex((x) => x.slug === slug); const prev = i >= 0 ? arr[i] : null;
  const item = { ...(prev || {}), ...l, slug, id: prev?.id || crypto.randomUUID(), status: prev && keep ? prev.status || "published" : "draft", faqSchema: true, createdAt: prev?.createdAt || now, updatedAt: now };
  if (prev) arr[i] = item; else arr.push(item);
  bump("service x country pages", prev ? "updated" : "created"); console.log(`${prev ? "updated" : "created"}  landings/${slug}`);
}

for (const g of pack.faqs || []) {
  const arr = load("faqs");
  const faqs = (g.faqs || []).filter((f) => f.question && f.answer);
  if (!g.title || !faqs.length) { console.error(`SKIPPED faq group "${g.title || "(untitled)"}"`); bump("faq groups", "skipped"); continue; }
  const i = arr.findIndex((x) => String(x.title).toLowerCase() === String(g.title).toLowerCase());
  const prev = i >= 0 ? arr[i] : null;
  const item = { id: prev?.id || crypto.randomUUID(), title: g.title, faqs, status: prev && keep ? prev.status || "published" : "draft", createdAt: prev?.createdAt || now, updatedAt: now };
  if (prev) arr[i] = item; else arr.push(item);
  bump("faq groups", prev ? "updated" : "created"); console.log(`${prev ? "updated" : "created"}  faqs/${g.title}`);
}

for (const r of pack.reviews || []) {
  const arr = load("reviews");
  if (!r.name || !r.text) { console.error(`SKIPPED review: needs name and text`); bump("reviews", "skipped"); continue; }
  if (arr.some((x) => x.name === r.name && x.text === r.text)) { bump("reviews", "skipped"); continue; }
  arr.push({ id: crypto.randomUUID(), name: r.name, role: r.role || "", text: r.text, rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))), status: "draft", createdAt: now, updatedAt: now });
  bump("reviews", "created"); console.log(`created  reviews/${r.name}`);
}

console.log("\nSummary:"); for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v.created} created, ${v.updated} updated${v.skipped ? `, ${v.skipped} skipped` : ""}`);
if (!pending.size) { console.error("The pack had nothing to import."); process.exit(1); }
if (dry) { console.log("\nDry run: nothing was written."); process.exit(0); }
for (const [name, arr] of pending) {
  const f = path.join(dir, name + ".json");
  if (fs.existsSync(f)) fs.copyFileSync(f, `${f}.bak-${stamp}`);
  const tmp = `${f}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(arr, null, 2));
  fs.renameSync(tmp, f);
}
console.log(`\nDone. Old files were backed up next to the originals (*.bak-${stamp}).`);
console.log("Next: open the dashboard, review each page, then Publish.");
