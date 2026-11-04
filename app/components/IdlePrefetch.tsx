"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const MAIN = ["/", "/services", "/countries", "/blog", "/about", "/faqs", "/contact"];

/**
 * Loads the page the visitor asked for first. Only once it has fully loaded and the browser is idle,
 * the other main pages (and a few service / country pages linked on this page) are fetched quietly
 * in the background, one at a time, so the next click is instant.
 * Skipped on Data Saver and slow connections.
 */
export default function IdlePrefetch() {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (c?.saveData || /2g/.test(c?.effectiveType ?? "")) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      const linked = [...document.querySelectorAll<HTMLAnchorElement>('main a[href^="/services/"], main a[href^="/countries/"]')]
        .map((a) => a.getAttribute("href")!.split("#")[0]);
      const queue = [...new Set([...MAIN, ...linked])].filter((h) => h !== path).slice(0, 14);
      const next = () => {
        const h = queue.shift();
        if (stopped || !h) return;
        try { router.prefetch(h); } catch { /* ignore */ }
        timer = setTimeout(next, 700);
      };
      next();
    };
    const start = () => {
      const idle = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
      if (idle) idle(run, { timeout: 4000 }); else timer = setTimeout(run, 2500);
    };
    if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
    return () => { stopped = true; clearTimeout(timer); window.removeEventListener("load", start); };
  }, [path, router]);

  return null;
}
