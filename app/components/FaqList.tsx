"use client";

import { useState } from "react";
import type { Faq } from "@/types/content";

export default function FaqList({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="bg-gray-50 rounded border border-gray-200 hover:border-[#ff5722] transition-colors">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full px-5 py-4 text-left flex justify-between items-center gap-4"
            >
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{i + 1}. {f.question}</span>
              <span className="text-2xl text-gray-400 flex-shrink-0" aria-hidden="true">{isOpen ? "−" : "+"}</span>
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
