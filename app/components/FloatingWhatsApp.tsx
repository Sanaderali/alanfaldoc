"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

type Num = { label: string; number: string; message?: string };

/** Round WhatsApp button (bottom right). One number: opens WhatsApp directly. Several: a small list to choose from. */
export default function FloatingWhatsApp({ numbers }: { numbers: Num[] }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  if (numbers.length === 0) return null;
  const link = (n: Num) => `https://wa.me/${n.number}?text=${encodeURIComponent(n.message || "Hello Al Anfal Doc, I would like some help.")}`;
  const cls = "w-12 h-12 rounded-full bg-[#0f7a69] text-white flex items-center justify-center shadow-[0_8px_22px_-6px_rgba(37,211,102,.7)] hover:scale-105 active:scale-95 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40";
  return (
    <div ref={box} className="fixed z-[70] bottom-5 right-4 sm:right-5 flex flex-col items-end gap-2">
      {open && numbers.length > 1 && (
        <ul role="menu" aria-label="Choose a WhatsApp contact" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-2 min-w-[210px] animate-scale-in">
          <li className="px-3 pt-2 pb-1 text-xs text-gray-500">Chat on WhatsApp with</li>
          {numbers.map((n) => (
            <li key={n.number} role="none"><a role="menuitem" href={link(n)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-brand-50"><Icon name="fa-brands fa-whatsapp" fixedWidth={false} className="text-[#25D366] text-lg" />{n.label}</a></li>
          ))}
        </ul>
      )}
      {numbers.length === 1 ? (
        <a href={link(numbers[0])} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" title="Chat on WhatsApp" className={cls}><Icon name="fa-brands fa-whatsapp" fixedWidth={false} className="text-2xl" /></a>
      ) : (
        <button type="button" aria-label="Chat with us on WhatsApp" aria-expanded={open} title="Chat on WhatsApp" onClick={() => setOpen((o) => !o)} className={cls}><Icon name="fa-brands fa-whatsapp" fixedWidth={false} className="text-2xl" /></button>
      )}
    </div>
  );
}
