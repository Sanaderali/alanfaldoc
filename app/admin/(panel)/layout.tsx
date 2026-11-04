import Link from "next/link";
import Image from "next/image";
import Icon from "@/app/components/Icon";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions-auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "gauge-high" },
  { group: "Content" },
  { href: "/admin/services", label: "Services", icon: "briefcase" },
  { href: "/admin/countries", label: "Countries", icon: "earth-americas" },
  { href: "/admin/posts", label: "Posts", icon: "newspaper" },
  { href: "/admin/faqs", label: "FAQs", icon: "circle-question" },
  { group: "Settings" },
  { href: "/admin/pages", label: "Page SEO", icon: "magnifying-glass-chart" },
  { href: "/admin/media", label: "Media library", icon: "images" },
] as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // protects every admin page below
  const links = (
    <nav aria-label="Admin" className="space-y-0.5">
      {nav.map((n, i) =>
        "group" in n ? (
          <p key={i} className="px-3 pt-5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{n.group}</p>
        ) : (
          <Link key={n.href} href={n.href} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-text transition-colors">
            <Icon name={n.icon} className="text-gray-400 w-4" />{n.label}
          </Link>
        )
      )}
    </nav>
  );
  const footer = (
    <div className="space-y-1 pt-4 border-t border-gray-200">
      <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"><Icon name="arrow-up-right-from-square" className="text-gray-400 w-4" />View website</a>
      <a href="/admin/api/export" download className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"><Icon name="download" className="text-gray-400 w-4" />Download backup</a>
      <form action={logout}><button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"><Icon name="right-from-bracket" className="text-gray-400 w-4" />Sign out</button></form>
    </div>
  );
  return (
    <div className="lg:flex">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-white border-r border-gray-200 p-4">
        <Link href="/admin" className="relative block w-36 h-10 mb-4"><Image src="/logo-black.png" alt="Al Anfal Doc" fill sizes="150px" className="object-contain object-left" /></Link>
        <div className="flex-1 overflow-y-auto">{links}</div>
        {footer}
      </aside>
      {/* mobile bar (no JS: <details>) */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <details className="group">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
            <span className="font-semibold">Admin</span>
            <Icon name="bars" />
          </summary>
          <div className="px-4 pb-4 border-t border-gray-100">{links}{footer}</div>
        </details>
      </header>
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1400px]">{children}</main>
    </div>
  );
}
