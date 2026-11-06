"use client";

import { useEffect } from "react";
import { LANGUAGES } from "@/lib/languages";
import { getLang, LANG_EVENT } from "./LanguageSwitcher";

/**
 * Shows the page in the visitor's chosen language. English pages stay the source (and what search engines index);
 * text is replaced in the browser from a server-side cache, so every sentence is translated only once.
 *
 * Two kinds of units: (1) plain text nodes, and (2) inside articles (.rich-content) a whole paragraph / list item / heading that
 * contains links or bold text, translated as ONE unit of canonical HTML so the sentence keeps its meaning and word order.
 * The canonical form must match lib/translate-site.ts (the pre-translation tool), which collects the same units on the server.
 */
const SKIP = "script,style,noscript,code,pre,textarea,svg,[data-notranslate],[translate=no],[contenteditable=true]";
const ATTRS = ["placeholder", "alt", "aria-label", "title"] as const;
const INLINE = new Set(["A", "STRONG", "EM", "B", "I", "U", "BR", "SPAN", "CODE", "SUP", "SUB"]);
const BLOCK_SEL = ".rich-content p, .rich-content li, .rich-content h2, .rich-content h3, .rich-content h4, .rich-content blockquote";
const MAX_UNIT = 1800;
const hasLetters = (s: string) => /\p{L}/u.test(s);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escA = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
/** canonical HTML of an element's children (attributes sorted, text escaped), identical to canon() on the server */
function canon(nodes: NodeListOf<ChildNode> | ChildNode[]): string {
  let out = "";
  nodes.forEach((n) => {
    if (n.nodeType === 3) out += esc(n.nodeValue ?? "");
    else if (n.nodeType === 1) {
      const el = n as Element, name = el.tagName.toLowerCase();
      const attrs = [...el.attributes].sort((a, b) => a.name.localeCompare(b.name)).map((a) => ` ${a.name}="${escA(a.value)}"`).join("");
      out += name === "br" ? `<br${attrs}>` : `<${name}${attrs}>${canon(el.childNodes)}</${name}>`;
    }
  });
  return out;
}
const onlyInline = (el: Element): boolean => [...el.children].every((c) => INLINE.has(c.tagName) && onlyInline(c));

const OK_TAGS = new Set(["a", "strong", "em", "b", "i", "u", "br", "span", "code", "sup", "sub"]);
const OK_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
/** Translated HTML is rebuilt from a whitelist (only simple inline tags, safe links), never inserted as given. */
function safeHtml(html: string): string {
  const t = document.createElement("template");
  t.innerHTML = html;
  const rebuild = (src: Node, dst: Node) => {
    src.childNodes.forEach((n) => {
      if (n.nodeType === 3) dst.appendChild(document.createTextNode(n.nodeValue ?? ""));
      else if (n.nodeType === 1) {
        const el = n as Element, tag = el.tagName.toLowerCase();
        if (!OK_TAGS.has(tag)) { rebuild(el, dst); return; } // unknown tag: keep its text only
        const c = document.createElement(tag);
        if (tag === "a") {
          const href = el.getAttribute("href") ?? "";
          if (OK_HREF.test(href)) c.setAttribute("href", href);
          if (el.getAttribute("target") === "_blank") { c.setAttribute("target", "_blank"); c.setAttribute("rel", "noopener noreferrer"); }
        }
        const cls = el.getAttribute("class");
        if (cls && /^[\w\s:/\-[\].%]+$/.test(cls)) c.setAttribute("class", cls);
        rebuild(el, c);
        dst.appendChild(c);
      }
    });
  };
  const box = document.createElement("div");
  rebuild(t.content, box);
  return box.innerHTML;
}

type Slot = { orig: string; apply: (v: string) => void };

export default function Translator() {
  useEffect(() => {
    let lang = "en";
    let busy = false, again = false, retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const originals = new WeakMap<Text, string>();
    const attrOrig = new WeakMap<Element, Record<string, string>>();
    const blockOrig = new WeakMap<Element, { orig: string; applied: string }>();
    const translated = new Map<string, string>(); // english unit -> current language (this tab)
    const live = new Set<Text>(); // text nodes we changed, so English can be restored
    const liveBlocks = new Set<Element>();

    const setDoc = (code: string) => {
      const l = LANGUAGES.find((x) => x.code === code) ?? LANGUAGES[0];
      document.documentElement.lang = l.code;
      document.documentElement.dir = l.dir;
    };

    const collect = (): Slot[] => {
      const slots: Slot[] = [];

      // 1) whole paragraphs in articles that contain links or bold text
      const candidates = new Set<Element>();
      document.body.querySelectorAll(BLOCK_SEL).forEach((el) => {
        if (el.closest(SKIP) || !el.children.length || !onlyInline(el)) return;
        candidates.add(el);
        const known = blockOrig.get(el);
        if (known && el.innerHTML === known.applied) return; // already translated and unchanged since
        const now = canon(el.childNodes);
        const orig = known && translated.has(known.orig.trim()) ? known.orig : now;
        const unit = orig.trim();
        if (unit.length < 2 || unit.length > MAX_UNIT || !hasLetters(unit)) return;
        slots.push({ orig, apply: (v) => { el.innerHTML = safeHtml(v); blockOrig.set(el, { orig, applied: el.innerHTML }); liveBlocks.add(el); } });
      });
      const insideCandidate = (n: Node) => { for (let p: Node | null = n.parentNode; p; p = p.parentNode) if (candidates.has(p as Element)) return true; return false; };

      // 2) plain text nodes
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest(SKIP) || insideCandidate(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      for (let n = w.nextNode() as Text | null; n; n = w.nextNode() as Text | null) {
        const known = originals.get(n);
        const cur = n.nodeValue ?? "";
        if (known !== undefined && translated.get(known.trim()) && cur.trim() === translated.get(known.trim())) continue;
        const orig = known !== undefined && !translated.has(cur.trim()) && cur.trim() !== known.trim() ? cur : known ?? cur;
        const t = orig.trim();
        if (t.length < 2 || t.length > 600 || !hasLetters(t)) continue;
        slots.push({ orig, apply: (v) => { originals.set(n, orig); live.add(n); const lead = orig.match(/^\s*/)![0], trail = orig.match(/\s*$/)![0]; n.nodeValue = lead + v + trail; } });
      }

      // 3) attributes
      document.body.querySelectorAll<HTMLElement>("[placeholder],[alt],[aria-label],[title]").forEach((el) => {
        if (el.closest(SKIP)) return;
        for (const a of ATTRS) {
          const val = el.getAttribute(a);
          const saved = attrOrig.get(el)?.[a];
          const orig = saved ?? val;
          if (!orig || orig.trim().length < 2 || !hasLetters(orig)) continue;
          if (saved && val && translated.get(saved.trim()) === val) continue;
          slots.push({ orig, apply: (v) => { const o = attrOrig.get(el) ?? {}; o[a] = orig; attrOrig.set(el, o); el.setAttribute(a, v); } });
        }
      });
      return slots;
    };

    const reveal = () => document.documentElement.removeAttribute("data-tr");
    const loadDict = (l: string) => { try { const d = JSON.parse(localStorage.getItem(`aa-tr-${l}`) || "{}") as Record<string, string>; for (const [k, v] of Object.entries(d)) translated.set(k, v); } catch { /* no saved translations yet */ } };
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    const saveDict = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { try { const o = Object.fromEntries(translated); const s = JSON.stringify(o); if (s.length < 2_000_000) localStorage.setItem(`aa-tr-${lang}`, s); } catch { /* storage full or blocked */ } }, 800);
    };

    const run = async () => {
      if (lang === "en") return;
      if (busy) { again = true; return; }
      busy = true;
      try {
        const myLang = lang;
        const slots = collect();
        // everything already known (this browser remembers earlier translations) is applied at once, before any network request
        for (const s of slots) { const v = translated.get(s.orig.trim()); if (v) s.apply(v); }
        const need = [...new Set(slots.map((s) => s.orig.trim()).filter((t) => !translated.has(t)))];
        for (let i = 0; i < need.length && lang === myLang; i += 40) {
          const chunk = need.slice(i, i + 40);
          try {
            const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: myLang, texts: chunk }) });
            if (r.status === 429) break; // slow down, the retry below continues
            if (!r.ok) continue;
            const d = (await r.json()) as { map: Record<string, string> };
            for (const [k, v] of Object.entries(d.map)) translated.set(k, v);
            saveDict();
          } catch { continue; }
          if (lang === myLang) for (const s of slots) { const v = translated.get(s.orig.trim()); if (v) s.apply(v); }
        }
        if (lang === myLang) for (const s of slots) { const v = translated.get(s.orig.trim()); if (v) s.apply(v); }
        reveal();
        // some sentences may not be translated yet (the AI service is busy or rate limited): try again shortly
        const missing = need.some((t) => !translated.has(t));
        clearTimeout(retryTimer);
        if (missing && lang === myLang && retries < 10) { retries++; retryTimer = setTimeout(() => void run(), 6000); } else if (!missing) retries = 0;
      } finally { busy = false; if (again) { again = false; void run(); } }
    };

    const restore = () => {
      live.forEach((n) => { const o = originals.get(n); if (o !== undefined && n.isConnected) n.nodeValue = o; });
      live.clear();
      liveBlocks.forEach((el) => { const o = blockOrig.get(el); if (o && el.isConnected) el.innerHTML = o.orig; });
      liveBlocks.clear();
      document.body.querySelectorAll<HTMLElement>("[placeholder],[alt],[aria-label],[title]").forEach((el) => { const o = attrOrig.get(el); if (o) for (const [a, v] of Object.entries(o)) el.setAttribute(a, v); });
    };

    const change = () => {
      const next = getLang();
      if (next === lang) return;
      if (lang !== "en") restore();
      lang = next; translated.clear(); retries = 0; clearTimeout(retryTimer); setDoc(lang);
      if (lang !== "en") { loadDict(lang); void run(); } else reveal();
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => { if (lang === "en") return; clearTimeout(timer); timer = setTimeout(() => void run(), 350); });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener(LANG_EVENT, change);
    change();
    if (lang === "en") reveal();
    return () => { clearTimeout(retryTimer); mo.disconnect(); window.removeEventListener(LANG_EVENT, change); clearTimeout(timer); };
  }, []);
  return null;
}
