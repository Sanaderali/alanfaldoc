"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Scroll-reveal that plays in BOTH directions:
 * - scrolling down: element rises in from below
 * - scrolling up:  element that left through the top drops back in from above
 * One shared IntersectionObserver for the whole page (cheap), transform/opacity
 * only (GPU friendly). Without JS or with reduced motion, content is just visible.
 */
type Callback = (entry: IntersectionObserverEntry) => void;
const callbacks = new WeakMap<Element, Callback>();
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => callbacks.get(e.target)?.(e)),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
  }
  return observer;
}

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** ms delay, handy for staggering cards */
  delay?: number;
  /** animation flavour */
  variant?: "up" | "left" | "right" | "zoom";
};

export default function Reveal({ children, as: Tag = "div", className = "", delay = 0, variant = "up" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = getObserver();
    el.dataset.reveal = "ready";
    callbacks.set(el, (entry) => {
      el.dataset.reveal = entry.isIntersecting
        ? "in"
        : entry.boundingClientRect.top < 0
        ? "above"
        : "below";
    });
    io.observe(el);
    return () => {
      io.unobserve(el);
      callbacks.delete(el);
    };
  }, []);

  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return (
    <Tag ref={ref} className={`reveal reveal-${variant} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
