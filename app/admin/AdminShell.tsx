"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/app/components/Icon";

type Item = { label: string; href: string; icon: string; exact?: boolean; children?: { label: string; href: string }[] };

const MENU: Item[] = [
  { label: "Dashboard", href: "/admin", icon: "gauge-high", exact: true },
  { label: "Posts", href: "/admin/posts", icon: "thumbtack", children: [
    { label: "All Posts", href: "/admin/posts" }, { label: "Add New", href: "/admin/posts/new" },
    { label: "Categories", href: "/admin/posts/categories" }, { label: "Tags", href: "/admin/posts/tags" } ] },
  { label: "Services", href: "/admin/services", icon: "briefcase", children: [{ label: "All Services", href: "/admin/services" }, { label: "Add New", href: "/admin/services/new" }] },
  { label: "Countries", href: "/admin/countries", icon: "earth-americas", children: [{ label: "All Countries", href: "/admin/countries" }, { label: "Add New", href: "/admin/countries/new" }] },
  { label: "FAQs", href: "/admin/faqs", icon: "circle-question" },
  { label: "Media", href: "/admin/media", icon: "images" },
  { label: "Page SEO", href: "/admin/pages", icon: "magnifying-glass-chart" },
];

const NEW_LINKS = [
  { label: "Post", href: "/admin/posts/new" }, { label: "Service", href: "/admin/services/new" }, { label: "Country", href: "/admin/countries/new" },
];

/** WordPress-like admin chrome: top bar + dark collapsible sidebar with submenus. */
export default function AdminShell({ children, user, siteName, logout, backup }: { children: ReactNode; user: string; siteName: string; logout: ReactNode; backup: ReactNode }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem("aa-admin-collapsed") === "1"); } catch { /* private mode */ }
  }, []);
  const toggle = () => setCollapsed((c) => { try { localStorage.setItem("aa-admin-collapsed", c ? "0" : "1"); } catch { /* ignore */ } return !c; });
  useEffect(() => setMobileOpen(false), [path]);

  const isActive = (i: Item) => (i.exact ? path === i.href : path === i.href || path.startsWith(i.href + "/"));
  const subActive = (href: string, all: string[]) => {
    // the most specific matching sub item is the current one
    const matches = all.filter((h) => path === h || path.startsWith(h + "/"));
    const best = matches.sort((a, b) => b.length - a.length)[0];
    return best === href;
  };

  return (
    <div className="admin-theme min-h-screen bg-[#f0f0f1] text-[#1d2327]">
      {/* ---------- top admin bar ---------- */}
      <header className="fixed top-0 inset-x-0 h-8 z-50 bg-[#1d2327] text-[#f0f0f1] text-[13px] flex items-center justify-between pl-1 pr-3">
        <div className="flex items-center h-full">
          <button type="button" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" className="lg:hidden w-10 h-8 flex items-center justify-center hover:bg-[#2c3338]"><Icon name="bars" /></button>
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 h-full hover:bg-[#2c3338] hover:text-[#72aee6]">
            <Icon name="house" className="text-[#a7aaad]" />{siteName}
          </Link>
          <details className="relative h-full group">
            <summary className="list-none cursor-pointer h-full flex items-center gap-1.5 px-3 hover:bg-[#2c3338] hover:text-[#72aee6]"><Icon name="plus" className="text-[#a7aaad] text-xs" />New</summary>
            <ul className="absolute left-0 top-8 min-w-[9rem] bg-[#2c3338] py-1 shadow-lg">
              {NEW_LINKS.map((l) => <li key={l.href}><Link href={l.href} className="block px-4 py-1.5 hover:text-[#72aee6]">{l.label}</Link></li>)}
            </ul>
          </details>
        </div>
        <details className="relative h-full">
          <summary className="list-none cursor-pointer h-full flex items-center gap-2 px-3 hover:bg-[#2c3338] hover:text-[#72aee6]">Howdy, <strong className="font-semibold">{user}</strong><Icon name="circle-user" className="text-[#a7aaad]" /></summary>
          <div className="absolute right-0 top-8 min-w-[10rem] bg-[#2c3338] py-1 shadow-lg">{backup}{logout}</div>
        </details>
      </header>

      {/* ---------- sidebar ---------- */}
      {mobileOpen && <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 z-30 bg-black/40" />}
      <aside className={`fixed top-8 bottom-0 left-0 z-40 bg-[#1d2327] text-[#f0f0f1] overflow-y-auto transition-all ${collapsed ? "lg:w-9" : "lg:w-40"} w-56 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <nav aria-label="Admin" className="pt-2 pb-14">
          <ul>
            {MENU.map((i) => {
              const active = isActive(i);
              return (
                <li key={i.href}>
                  <Link href={i.href} title={collapsed ? i.label : undefined} aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 text-[14px] leading-tight ${active ? "bg-brand text-white font-semibold" : "text-[#f0f0f1] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                    <Icon name={i.icon} className={`w-4 shrink-0 ${active ? "text-white" : "text-[#a7aaad]"}`} />
                    <span className={collapsed ? "lg:hidden" : ""}>{i.label}</span>
                  </Link>
                  {i.children && active && (
                    <ul className={`bg-[#2c3338] py-1.5 ${collapsed ? "lg:hidden" : ""}`}>
                      {i.children.map((c) => {
                        const cur = subActive(c.href, i.children!.map((x) => x.href));
                        return <li key={c.href}><Link href={c.href} className={`block py-1 pl-9 pr-2 text-[13px] ${cur ? "text-white font-semibold" : "text-[#c3c4c7] hover:text-[#72aee6]"}`}>{c.label}</Link></li>;
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <button type="button" onClick={toggle} className="hidden lg:flex absolute bottom-0 inset-x-0 items-center gap-2.5 px-2.5 py-2.5 text-[13px] text-[#a7aaad] hover:text-[#72aee6] bg-[#1d2327]">
          <Icon name={collapsed ? "angles-right" : "angles-left"} className="w-4" /><span className={collapsed ? "hidden" : ""}>Collapse menu</span>
        </button>
      </aside>

      <div className={`pt-8 transition-all ${collapsed ? "lg:pl-9" : "lg:pl-40"}`}>
        <main className="p-4 sm:p-5 min-w-0">{children}</main>
        <footer className="px-5 pb-6 text-[13px] text-[#50575e] flex items-center gap-4">
          <Image src="/icon.png" alt="" width={16} height={16} className="rounded-sm" /> {siteName} dashboard
        </footer>
      </div>
    </div>
  );
}
