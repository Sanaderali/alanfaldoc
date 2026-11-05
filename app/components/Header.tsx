"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "@/app/components/SiteLink";
import { usePathname } from "next/navigation";
import { mainNav, site } from "@/data/site";
import { platformOf } from "@/lib/social";
import LanguageSwitcher from "./LanguageSwitcher";
import Icon from "./Icon";

export default function Header({ social = [] }: { social?: { platform: string; url: string }[] }) {
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
    `text-sm font-medium transition-colors hover:text-brand-text ${isActive(href) ? "text-brand-text" : "text-ink"}`;

  return (
    <>
      <div className="hidden sm:block bg-canvas border-b border-gray-200 text-xs sm:text-sm text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex justify-between items-center gap-4">
          <span><Icon name="location-dot" className="text-brand-text mr-1.5" /> {site.address}</span>
          <span className="flex items-center gap-5">
            {social.length > 0 && (
              <span className="flex items-center gap-1" aria-label="Social media">
                {social.map((x) => { const p = platformOf(x.platform); return p ? <a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={p.label} title={p.label} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-brand hover:text-white transition-colors"><Icon name={p.icon} fixedWidth={false} className="text-[13px]" /></a> : null; })}
              </span>
            )}
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-brand-text"><Icon name="phone" className="text-brand-text mr-1.5" /> {site.phone}</a>
            <a href={`mailto:${site.email}`} className="hidden md:inline hover:text-brand-text"><Icon name="envelope" className="text-brand-text mr-1.5" /> {site.email}</a>
          </span>
        </div>
      </div>

      <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[68px] sm:h-[84px]">
            <Link href="/" aria-label={`${site.name} home`} className="flex items-center">
              <Image src="/logo-header.png" alt={site.name} width={1000} height={333} sizes="(min-width:640px) 190px, 150px" priority className={`h-[46px] sm:h-[58px] w-auto origin-left transition-transform duration-300 ${scrolled ? "scale-95" : "scale-100"}`} />
            </Link>

            <nav aria-label="Main" className="hidden lg:flex items-center gap-8">
              {mainNav.map((n) => (
                <Link key={n.href} href={n.href} className={`${link(n.href)} uppercase`}>{n.label}</Link>
              ))}
              <Link href="/contact" className="btn btn-cta btn-sm">
                Get a Free Quote
              </Link>
              <LanguageSwitcher />
            </nav>

            <div className="lg:hidden flex items-center gap-1"><LanguageSwitcher />
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuFor(menuOpen ? null : pathname)}
              className="p-2 text-gray-700"
            >
              <Icon name={menuOpen ? "xmark" : "bars"} className="text-xl" />
            </button></div>
          </div>

          {menuOpen && (
            <nav id="mobile-menu" aria-label="Mobile" className="lg:hidden pb-4 border-t border-gray-100 animate-slide-down">
              <div className="flex flex-col pt-2">
                {mainNav.map((n) => (
                  <Link key={n.href} href={n.href} className={`${link(n.href)} uppercase py-3 border-b border-gray-100`}>{n.label}</Link>
                ))}
                <Link href="/contact" className="btn btn-cta mt-4">
                  Get a Free Quote
                </Link>
                {social.length > 0 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    {social.map((x) => { const p = platformOf(x.platform); return p ? <a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={p.label} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors"><Icon name={p.icon} fixedWidth={false} /></a> : null; })}
                  </div>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
