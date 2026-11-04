"use client";

import { useState } from "react";
import type { Faq } from "@/types/content";
import Icon from "./Icon";

export default function FaqList({ faqs, defaultOpen = 0 }: { faqs: Faq[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="bg-canvas rounded border border-gray-200 hover:border-brand transition-colors">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full px-5 py-4 text-left flex justify-between items-center gap-4"
            >
              <span className="font-semibold text-ink text-sm sm:text-base">{i + 1}. {f.question}</span>
              <Icon name={isOpen ? "minus" : "plus"} className="text-sm text-gray-400 flex-shrink-0" />
            </button>
            <div className={`faq-content ${isOpen ? "open px-5 pb-4" : "px-5"}`}>
              <p className="text-gray-600 text-sm leading-relaxed">{f.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
