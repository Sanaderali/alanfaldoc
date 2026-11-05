"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { LANGUAGES, LANG_KEY } from "@/lib/languages";

export const LANG_EVENT = "aa-lang-change";
export const getLang = () => { try { return localStorage.getItem(LANG_KEY) || "en"; } catch { return "en"; } };

/** Globe icon in the header: lets the visitor read the whole site in their own language. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  useEffect(() => {
    setLang(getLang());
    const on = () => setLang(getLang());
    window.addEventListener(LANG_EVENT, on);
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", away); document.addEventListener("keydown", esc);
    window.addEventListener("scroll", close, { passive: true }); window.addEventListener("resize", close);
    return () => { window.removeEventListener(LANG_EVENT, on); document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); window.removeEventListener("scroll", close); window.removeEventListener("resize", close); };
  }, []);
  // the list is placed with fixed coordinates and clamped to the screen, so it never runs off either edge (left-to-right or right-to-left)
  const toggle = () => {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect(), w = Math.min(208, window.innerWidth - 16);
      const rtl = document.documentElement.dir === "rtl";
      const left = rtl ? r.left : r.right - w;
      setPos({ top: r.bottom + 8, left: Math.max(8, Math.min(left, window.innerWidth - w - 8)) });
    }
    setOpen(!open);
  };
  const choose = (code: string) => {
    try { localStorage.setItem(LANG_KEY, code); } catch { /* private mode: applies for this visit only */ }
    document.cookie = `${LANG_KEY}=${code}; path=/; max-age=31536000; samesite=lax`;
    setLang(code); setOpen(false);
    window.dispatchEvent(new Event(LANG_EVENT));
  };
  const cur = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  return (
    <div ref={box} className={`relative ${className}`} data-notranslate>
      <button ref={btn} type="button" onClick={toggle} aria-haspopup="listbox" aria-expanded={open} aria-label={`Language: ${cur.english}. Change language`} title="Language" className="inline-flex items-center gap-1.5 h-10 px-2.5 rounded-full text-gray-700 hover:bg-brand-50 hover:text-brand-text transition-colors">
        <Icon name="globe" fixedWidth={false} className="text-lg" /><span className="hidden sm:inline text-sm font-semibold uppercase">{cur.code}</span>
      </button>
      {open && (
        <ul role="listbox" aria-label="Choose a language" style={{ top: pos.top, left: pos.left, width: Math.min(208, typeof window === "undefined" ? 208 : window.innerWidth - 16) }} className="fixed max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl py-1.5 z-[80]">
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === lang}>
              <button type="button" onClick={() => choose(l.code)} lang={l.code} dir={l.dir} className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-brand-50 ${l.code === lang ? "font-bold text-brand-text" : "text-gray-700"}`}>
                <span>{l.name}</span>{l.code === lang && <Icon name="check" fixedWidth={false} className="text-brand-text" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
