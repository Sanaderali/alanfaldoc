"use client";

import { useEffect } from "react";
import { LANGUAGES } from "@/lib/languages";
import { getLang, LANG_EVENT } from "./LanguageSwitcher";

/**
 * Shows the page in the visitor's chosen language. English pages stay the source (and what search engines index);
 * the text is translated in the browser from a server-side cache, so every sentence is translated by AI only once.
 */
const SKIP = "script,style,noscript,code,pre,textarea,svg,[data-notranslate],[translate=no],[contenteditable=true]";
const ATTRS = ["placeholder", "alt", "aria-label", "title"] as const;
const hasLetters = (s: string) => /\p{L}/u.test(s);

type Slot = { orig: string; apply: (v: string) => void };

export default function Translator() {
  useEffect(() => {
    let lang = "en";
    let busy = false, again = false, retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const originals = new WeakMap<Text, string>();
    const attrOrig = new WeakMap<Element, Record<string, string>>();
    const translated = new Map<string, string>(); // english -> current language (this tab)
    const live = new Set<Text>(); // text nodes we changed, so English can be restored

    const setDoc = (code: string) => {
      const l = LANGUAGES.find((x) => x.code === code) ?? LANGUAGES[0];
      document.documentElement.lang = l.code;
      document.documentElement.dir = l.dir;
    };

    const collect = (): Slot[] => {
      const slots: Slot[] = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      for (let n = w.nextNode() as Text | null; n; n = w.nextNode() as Text | null) {
        const known = originals.get(n);
        const cur = n.nodeValue ?? "";
        // already translated by us and unchanged since
        if (known !== undefined && translated.get(known.trim()) && cur.trim() === translated.get(known.trim())) continue;
        const orig = known !== undefined && !translated.has(cur.trim()) && cur.trim() !== known.trim() ? cur : known ?? cur;
        const t = orig.trim();
        if (t.length < 2 || t.length > 600 || !hasLetters(t)) continue;
        slots.push({ orig, apply: (v) => { originals.set(n, orig); live.add(n); const lead = orig.match(/^\s*/)![0], trail = orig.match(/\s*$/)![0]; n.nodeValue = lead + v + trail; } });
      }
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

    const run = async () => {
      if (lang === "en") return;
      if (busy) { again = true; return; }
      busy = true;
      try {
        const myLang = lang;
        const slots = collect();
        const need = [...new Set(slots.map((s) => s.orig.trim()).filter((t) => !translated.has(t)))];
        for (let i = 0; i < need.length && lang === myLang; i += 40) {
          const chunk = need.slice(i, i + 40);
          try {
            const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: myLang, texts: chunk }) });
            if (r.status === 429) break; // slow down, the retry below continues
            if (!r.ok) continue;
            const d = (await r.json()) as { map: Record<string, string> };
            for (const [k, v] of Object.entries(d.map)) translated.set(k, v);
          } catch { continue; }
          if (lang === myLang) for (const s of slots) { const v = translated.get(s.orig.trim()); if (v) s.apply(v); }
        }
        if (lang === myLang) for (const s of slots) { const v = translated.get(s.orig.trim()); if (v) s.apply(v); }
        // some sentences may not be translated yet (the AI service is busy or rate limited): try again shortly
        const missing = need.some((t) => !translated.has(t));
        clearTimeout(retryTimer);
        if (missing && lang === myLang && retries < 10) { retries++; retryTimer = setTimeout(() => void run(), 6000); } else if (!missing) retries = 0;
      } finally { busy = false; if (again) { again = false; void run(); } }
    };

    const restore = () => {
      live.forEach((n) => { const o = originals.get(n); if (o !== undefined && n.isConnected) n.nodeValue = o; });
      live.clear();
      document.body.querySelectorAll<HTMLElement>("[placeholder],[alt],[aria-label],[title]").forEach((el) => { const o = attrOrig.get(el); if (o) for (const [a, v] of Object.entries(o)) el.setAttribute(a, v); });
    };

    const change = () => {
      const next = getLang();
      if (next === lang) return;
      if (lang !== "en") restore();
      lang = next; translated.clear(); retries = 0; clearTimeout(retryTimer); setDoc(lang);
      if (lang !== "en") void run();
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => { if (lang === "en") return; clearTimeout(timer); timer = setTimeout(() => void run(), 350); });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener(LANG_EVENT, change);
    change();
    return () => { clearTimeout(retryTimer); mo.disconnect(); window.removeEventListener(LANG_EVENT, change); clearTimeout(timer); };
  }, []);
  return null;
}
