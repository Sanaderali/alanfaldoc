"use client";

import { useRef, type ReactNode } from "react";

/** Lightweight CSS scroll-snap carousel with arrow buttons. Works with touch swipe natively. */
export default function Carousel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div>
      <div ref={track} className="carousel-track flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {children}
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <button type="button" aria-label="Previous" onClick={() => scrollBy(-1)} className="w-11 h-11 rounded-full border border-gray-300 text-[#3d4d6a] hover:bg-[#ff5722] hover:text-white hover:border-[#ff5722] transition-colors">←</button>
        <button type="button" aria-label="Next" onClick={() => scrollBy(1)} className="w-11 h-11 rounded-full border border-gray-300 text-[#3d4d6a] hover:bg-[#ff5722] hover:text-white hover:border-[#ff5722] transition-colors">→</button>
      </div>
    </div>
  );
}
