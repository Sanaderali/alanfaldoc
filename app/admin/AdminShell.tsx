"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/app/components/Icon";
import { flashTitle, playBeep } from "./alerts";

type Item = { label: string; href: string; icon: string; perm?: string; exact?: boolean; badge?: "chat" | "tickets"; children?: { label: string; href: string }[] };

const MENU: Item[] = [
  { label: "Dashboard", href: "/admin", icon: "gauge-high", perm: "dashboard.view", exact: true },
  { label: "Live Chat", href: "/admin/chat", icon: "comments", perm: "chat.view", badge: "chat" },
  { label: "Tickets", href: "/admin/tickets", icon: "ticket", perm: "tickets.view", badge: "tickets" },
  { label: "Posts", href: "/admin/posts", icon: "thumbtack", perm: "content.view", children: [
    { label: "All Posts", href: "/admin/posts" }, { label: "Add New", href: "/admin/posts/new" },
    { label: "Categories", href: "/admin/posts/categories" }, { label: "Tags", href: "/admin/posts/tags" } ] },
  { label: "Services", href: "/admin/services", icon: "briefcase", perm: "content.view", children: [{ label: "All Services", href: "/admin/services" }, { label: "Add New", href: "/admin/services/new" }] },
  { label: "Countries", href: "/admin/countries", icon: "earth-americas", perm: "content.view", children: [{ label: "All Countries", href: "/admin/countries" }, { label: "Add New", href: "/admin/countries/new" }] },
  { label: "Reviews", href: "/admin/reviews", icon: "star", perm: "content.view" },
  { label: "FAQs", href: "/admin/faqs", icon: "circle-question", perm: "faqs.manage" },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: "fa-brands fa-whatsapp", perm: "settings.manage" },
  { label: "Media", href: "/admin/media", icon: "images", perm: "media.manage" },
  { label: "Page SEO", href: "/admin/pages", icon: "magnifying-glass-chart", perm: "seo.manage" },
  { label: "Team", href: "/admin/users", icon: "users-gear", perm: "users.manage", children: [{ label: "All Users", href: "/admin/users" }, { label: "Add New", href: "/admin/users/new" }, { label: "Support Activity", href: "/admin/users/activity" }, { label: "Email", href: "/admin/users/email" }] },
];

const NEW_LINKS = [
  { label: "Post", href: "/admin/posts/new" }, { label: "Service", href: "/admin/services/new" }, { label: "Country", href: "/admin/countries/new" },
];

/** WordPress-like admin chrome: top bar + dark collapsible sidebar with submenus. */
export default function AdminShell({ children, user, roleLabel, perms, siteName, logout, backup }: { children: ReactNode; user: string; roleLabel: string; perms: string[]; siteName: string; logout: ReactNode; backup: ReactNode }) {
  const has = (p?: string) => !p || perms.includes(p);
  const menu = MENU.filter((i) => has(i.perm));
  const canNew = has("content.edit");
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({ chats: 0, tickets: 0 });
  const baseline = useRef<{ msgs: number; tickets: number } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem("aa-admin-collapsed") === "1"); } catch { /* private mode */ }
  }, []);
  const toggle = () => setCollapsed((c) => { try { localStorage.setItem("aa-admin-collapsed", c ? "0" : "1"); } catch { /* ignore */ } return !c; });
  useEffect(() => setMobileOpen(false), [path]);

  // Menu badges + sound/visual alert for new chats and tickets on ANY dashboard page (the chat inbox handles its own alerts)
  const watch = has("chat.view") || has("tickets.view");
  const onInbox = path.startsWith("/admin/chat");
  useEffect(() => {
    if (!watch) return;
    let stop = false;
    const poll = async () => {
      try {
        const r = await fetch("/admin/api/chat/summary", { cache: "no-store" });
        if (!r.ok || stop) return;
        const d: { chats: number; chatUnreadMessages: number; tickets: number } = await r.json();
        setCounts({ chats: d.chats, tickets: d.tickets });
        const b = baseline.current;
        if (b && !onInbox && (d.chatUnreadMessages > b.msgs || d.tickets > b.tickets)) {
          const what = d.tickets > b.tickets ? "New ticket" : "New live chat message";
          playBeep();
          flashTitle(`● ${what}`);
        }
        baseline.current = { msgs: d.chatUnreadMessages, tickets: d.tickets };
      } catch { /* offline */ }
    };
    void poll();
    const t = setInterval(poll, 5000);
    return () => { stop = true; clearInterval(t); };
  }, [watch, onInbox]);

  const isActive = (i: Item) => (i.exact ? path === i.href : path === i.href || path.startsWith(i.href + "/"));
  const subActive = (href: string, all: string[]) => {
    // the most specific matching sub item is the current one
    const matches = all.filter((h) => path === h || path.startsWith(h + "/"));
    const best = matches.sort((a, b) => b.length - a.length)[0];
    return best === href;
  };

  return (
    <div className="admin-theme min-h-screen bg-a-canvas text-a-text">
      {/* ---------- top admin bar ---------- */}
      <header className="fixed top-0 inset-x-0 h-8 z-50 bg-a-bar text-a-text text-[13px] flex items-center justify-between pl-1 pr-3">
        <div className="flex items-center h-full">
          <button type="button" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" className="lg:hidden w-10 h-8 flex items-center justify-center hover:bg-a-bar2"><Icon name="bars" /></button>
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 h-full hover:bg-a-bar2 hover:text-brand">
            <Icon name="house" className="text-a-subtle" />{siteName}
          </Link>
          {canNew && <details className="relative h-full group">
            <summary className="list-none cursor-pointer h-full flex items-center gap-1.5 px-3 hover:bg-a-bar2 hover:text-brand"><Icon name="plus" className="text-a-subtle text-xs" />New</summary>
            <ul className="absolute left-0 top-8 min-w-[9rem] bg-a-bar2 py-1 shadow-lg">
              {NEW_LINKS.map((l) => <li key={l.href}><Link href={l.href} className="block px-4 py-1.5 hover:text-brand">{l.label}</Link></li>)}
            </ul>
          </details>}
        </div>
        <details className="relative h-full">
          <summary className="list-none cursor-pointer h-full flex items-center gap-2 px-3 hover:bg-a-bar2 hover:text-brand"><strong className="font-semibold">{user}</strong><span className="hidden sm:inline text-a-subtle">· {roleLabel}</span><Icon name="circle-user" className="text-a-subtle" /></summary>
          <div className="absolute right-0 top-8 min-w-[11rem] bg-a-bar2 py-1 shadow-lg"><Link href="/admin/profile" className="flex w-full items-center gap-2 px-4 py-1.5 text-[13px] text-a-text hover:text-brand"><Icon name="user-pen" className="text-a-subtle" />My profile</Link>{has("backup.export") && backup}{logout}</div>
        </details>
      </header>

      {/* ---------- sidebar ---------- */}
      {mobileOpen && <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 z-30 bg-black/40" />}
      <aside className={`fixed top-8 bottom-0 left-0 z-40 bg-a-bar text-a-text overflow-y-auto transition-all ${collapsed ? "lg:w-9" : "lg:w-40"} w-56 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <nav aria-label="Admin" className="pt-2 pb-14">
          <ul>
            {menu.map((i) => {
              const active = isActive(i);
              return (
                <li key={i.href}>
                  <Link href={i.href} title={collapsed ? i.label : undefined} aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-2.5 px-2.5 py-2 text-[14px] leading-tight ${active ? "bg-brand text-a-on font-semibold" : "text-a-text hover:bg-a-bar2 hover:text-brand"}`}>
                    <Icon name={i.icon} className={`w-4 shrink-0 ${active ? "text-white" : "text-a-subtle"}`} />
                    <span className={collapsed ? "lg:hidden" : ""}>{i.label}</span>
                    {i.badge && counts[i.badge === "chat" ? "chats" : "tickets"] > 0 && <span className={`ml-auto min-w-5 h-5 px-1.5 rounded-full bg-a-red text-white text-[11px] font-semibold flex items-center justify-center ${collapsed ? "lg:absolute lg:right-0.5 lg:top-0.5 lg:min-w-3 lg:h-3 lg:px-0 lg:text-[0px]" : ""}`}>{counts[i.badge === "chat" ? "chats" : "tickets"]}</span>}
                  </Link>
                  {i.children && active && (
                    <ul className={`bg-a-bar2 py-1.5 ${collapsed ? "lg:hidden" : ""}`}>
                      {i.children.map((c) => {
                        const cur = subActive(c.href, i.children!.map((x) => x.href));
                        return <li key={c.href}><Link href={c.href} className={`block py-1 pl-9 pr-2 text-[13px] ${cur ? "text-white font-semibold" : "text-a-muted hover:text-brand"}`}>{c.label}</Link></li>;
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <button type="button" onClick={toggle} className="hidden lg:flex absolute bottom-0 inset-x-0 items-center gap-2.5 px-2.5 py-2.5 text-[13px] text-a-subtle hover:text-brand bg-a-bar">
          <Icon name={collapsed ? "angles-right" : "angles-left"} className="w-4" /><span className={collapsed ? "hidden" : ""}>Collapse menu</span>
        </button>
      </aside>

      <div className={`pt-8 transition-all ${collapsed ? "lg:pl-9" : "lg:pl-40"}`}>
        <main className="p-4 sm:p-5 min-w-0">{children}</main>
        <footer className="px-5 pb-6 text-[13px] text-a-muted flex items-center gap-4">
          <Image src="/icon.png" alt="" width={16} height={16} className="rounded-sm" /> {siteName} dashboard
        </footer>
      </div>
    </div>
  );
}
