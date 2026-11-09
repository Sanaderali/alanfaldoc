#!/usr/bin/env node
/**
 * Builds the site's icon sprite (public/icons.<hash>.svg + lib/icons-meta.json) from the Font Awesome Free packages.
 * This replaces the external Font Awesome kit (a third-party script, stylesheet and font files that slowed every page).
 *   npm run icons        (run again after you start using a new icon name in the code)
 * Icons are collected from every string in app/, lib/, data/ and content-packs/ that is an icon name, plus a list of extra
 * names the dashboard icon field can use (EXTRA below).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const root = path.join(__dirname, "..");

const sets = {
  s: require("@fortawesome/free-solid-svg-icons"),
  b: require("@fortawesome/free-brands-svg-icons"),
  r: require("@fortawesome/free-regular-svg-icons"),
};
const byName = { s: new Map(), b: new Map(), r: new Map() };
for (const [k, mod] of Object.entries(sets)) {
  for (const v of Object.values(mod)) {
    if (!v || !v.iconName || !Array.isArray(v.icon)) continue;
    byName[k].set(v.iconName, v.icon);
    for (const a of v.icon[2] || []) if (typeof a === "string") byName[k].set(a, v.icon);
  }
}

const EXTRA = `briefcase building passport id-card file-lines file-signature file-circle-check file-pdf stamp scale-balanced gavel handshake user user-tie users user-group people-group earth-americas globe plane plane-departure suitcase-rolling map-location-dot location-dot phone phone-volume envelope message comments comment headset clock calendar-check calendar-days credit-card money-bill wallet building-columns landmark shield-halved lock key circle-check circle-info circle-question triangle-exclamation star check bolt bullseye language chart-line chart-pie coins sack-dollar receipt house hotel store industry truck ship anchor box boxes-stacked pen pen-to-paper clipboard-check clipboard-list list-check stethoscope heart-pulse hospital graduation-cap award certificate medal trophy lightbulb gears gear wrench screwdriver-wrench magnifying-glass arrow-right arrow-left arrow-up arrow-down chevron-down chevron-up chevron-right chevron-left xmark bars plus minus trash download upload share-nodes link paperclip print copy folder folder-open image camera video microphone volume-high volume-xmark bell eye eye-slash circle-user right-from-bracket right-to-bracket paper-plane quote-left quote-right rotate right-left file-import file-export database server cloud brain tags tag thumbtack flag fire-flame-curved leaf sun moon snowflake bell-slash ticket id-badge address-card address-book table-cells-large gauge-high users-gear user-pen circle-xmark ban`.split(/\s+/);

const wanted = { s: new Set(EXTRA), b: new Set(), r: new Set() };
const ICON_RX = /^(?:fa-(solid|brands|regular) )?(?:fa-)?([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const skipDirs = new Set(["node_modules", ".next", ".git", "uploads", "translation-work"]);
function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { scan(p); continue; }
    if (!/\.(tsx?|json|css)$/.test(e.name)) continue;
    const text = fs.readFileSync(p, "utf8");
    for (const m of text.matchAll(/["'`]([^"'`\n]{2,40})["'`]/g)) {
      const mm = m[1].match(ICON_RX);
      if (!mm) continue;
      const [, style, name] = mm;
      const k = style === "brands" ? "b" : style === "regular" ? "r" : "s";
      if (byName[k].has(name) && (style || k === "s")) wanted[k].add(name);
      // a bare brand name like "whatsapp" only counts when written with its fa-brands prefix
    }
  }
}
for (const d of ["app", "lib", "data", "content-packs"]) scan(path.join(root, d));

const symbols = [];
const names = [];
for (const k of ["s", "b", "r"]) {
  for (const n of [...wanted[k]].sort()) {
    const ic = byName[k].get(n);
    if (!ic) continue;
    const [w, h, , , d] = ic;
    const paths = Array.isArray(d) ? d.map((x) => `<path d="${x}"/>`).join("") : `<path d="${d}"/>`;
    symbols.push(`<symbol id="${k}-${n}" viewBox="0 0 ${w} ${h}">${paths}</symbol>`);
    names.push(`${k}-${n}`);
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join("")}</svg>`;
const hash = crypto.createHash("sha1").update(svg).digest("hex").slice(0, 8);
for (const f of fs.readdirSync(path.join(root, "public"))) if (/^icons\.[0-9a-f]{8}\.svg$/.test(f)) fs.unlinkSync(path.join(root, "public", f));
const file = `icons.${hash}.svg`;
fs.writeFileSync(path.join(root, "public", file), svg);
fs.writeFileSync(path.join(root, "lib", "icons-meta.json"), JSON.stringify({ file, names }, null, 0));
console.log(`${names.length} icons, public/${file} (${(svg.length / 1024).toFixed(0)} KB)`);
