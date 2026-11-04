"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, site } from "@/data/site";
import Icon from "./Icon";

export default function Header() {
  const pathname = usePathname();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  // menu is open only for the page it was opened on, so navigating closes it automatically
  const menuOpen = menuFor === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const link = (href: string) =>
    `text-sm font-medium transition-colors hover:text-brand-text ${isActive(href) ? "text-brand-text" : "text-gray-800"}`;

  return (
    <>
      <div className="hidden sm:block bg-gray-50 border-b border-gray-200 text-xs sm:text-sm text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex justify-between items-center gap-4">
          <span><Icon name="location-dot" className="text-brand-text mr-1.5" /> {site.address}</span>
          <span className="flex items-center gap-5">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-brand-text"><Icon name="phone" className="text-brand-text mr-1.5" /> {site.phone}</a>
            <a href={`mailto:${site.email}`} className="hidden md:inline hover:text-brand-text"><Icon name="envelope" className="text-brand-text mr-1.5" /> {site.email}</a>
          </span>
        </div>
      </div>

      <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? "h-14" : "h-16 sm:h-20"}`}>
            <Link href="/" aria-label={`${site.name} home`} className="flex items-center">
              <div className={`relative transition-all duration-300 ${scrolled ? "w-28 h-9" : "w-32 h-10 sm:w-36 sm:h-12"}`}>
                <Image src="/logo-black.png" alt={site.name} fill sizes="150px" className="object-contain" priority />
              </div>
            </Link>

            <nav aria-label="Main" className="hidden lg:flex items-center gap-8">
              {mainNav.map((n) => (
                <Link key={n.href} href={n.href} className={`${link(n.href)} uppercase`}>{n.label}</Link>
              ))}
              <Link href="/contact" className="px-5 py-2.5 bg-brand text-gray-900 text-sm font-semibold rounded uppercase hover:bg-brand-dark hover:shadow-lg hover:scale-105 transition-all duration-300">
                Get Consultation
              </Link>
            </nav>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuFor(menuOpen ? null : pathname)}
              className="lg:hidden p-2 text-gray-700"
            >
              <Icon name={menuOpen ? "xmark" : "bars"} className="text-xl" />
            </button>
          </div>

          {menuOpen && (
            <nav id="mobile-menu" aria-label="Mobile" className="lg:hidden pb-4 border-t border-gray-100 animate-slide-down">
              <div className="flex flex-col pt-2">
                {mainNav.map((n) => (
                  <Link key={n.href} href={n.href} className={`${link(n.href)} uppercase py-3 border-b border-gray-100`}>{n.label}</Link>
                ))}
                <Link href="/contact" className="mt-4 px-5 py-3 bg-brand text-gray-900 font-semibold rounded text-center uppercase text-sm">
                  Get Consultation
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
