import "server-only";
import sanitizeHtml from "sanitize-html";
import type { Country, Post, Service } from "@/types/content";

/**
 * Safe rich text. The dashboard editor produces HTML; we only ever store/render what this allow-list permits.
 * No scripts, no inline styles/events, images only from our own uploads or https URLs.
 */
const okImg = (src?: string) => !!src && (/^\/uploads\/[a-z0-9._-]+\.webp$/.test(src) || /^https:\/\/[^\s"'<>]+$/.test(src));

export function cleanRichHtml(html: unknown): string {
  if (typeof html !== "string") return "";
  return sanitizeHtml(html.slice(0, 400_000), {
    allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "u", "s", "a", "blockquote", "img", "br", "hr", "code"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "width", "height", "loading", "decoding"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tag, attribs) => {
        // external links open in a new tab safely; internal / mailto / tel links stay plain (and keep SEO value)
        const { href, ...rest } = attribs;
        const clean = Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "target" && k !== "rel"));
        const external = /^https?:\/\//.test(href ?? "");
        return { tagName: tag, attribs: { ...(href ? { href } : {}), ...clean, ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}) } };
      },
      img: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
    },
    exclusiveFilter: (f) => (f.tag === "img" && !okImg(f.attribs.src)) || (f.tag === "p" && !f.text.trim() && !f.mediaChildren.length && !/<br/.test(f.text)),
  });
}

/** plain text of an HTML string (reading time, emptiness checks) */
export const htmlToText = (html?: string) => (html ? sanitizeHtml(html.replace(/<\/(p|h[1-6]|li|blockquote)>/gi, "$& "), { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim() : "");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ul = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "");
const sectionHtml = (s: { heading: string; minor?: boolean; paragraphs?: string[]; list?: string[] }) =>
  `<${s.minor ? "h3" : "h2"}>${esc(s.heading)}</${s.minor ? "h3" : "h2"}>${(s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join("")}${ul(s.list ?? [])}`;

/** Turn the older structured fields into HTML so the visual editor can open any existing item. */
export function serviceToHtml(s: Service) {
  return (s.intro ? `<p>${esc(s.intro)}</p>` : "") + ul(s.highlights ?? []) + (s.sections ?? []).map(sectionHtml).join("");
}
export function countryToHtml(c: Country) {
  return (c.intro ? `<p>${esc(c.intro)}</p>` : "") + (c.sections ?? []).map(sectionHtml).join("");
}
export function postToHtml(p: Post) {
  return (p.body ?? [])
    .map((b) => (b.startsWith("## ") ? `<h2>${esc(b.slice(3))}</h2>` : b.startsWith("- ") ? ul(b.split("\n").map((l) => l.replace(/^-\s*/, ""))) : `<p>${esc(b)}</p>`))
    .join("");
}
