import Link from "next/link";
import type { ReactNode } from "react";
import { visibility } from "@/lib/audit";

/** Small server-friendly UI kit for the dashboard. */

export const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand";
export const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-md hover:bg-brand-dark transition-colors disabled:opacity-60";
export const btnGhost = "inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>{children}</div>;
}

const badgeTone = {
  live: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  draft: "bg-gray-100 text-gray-600 ring-gray-500/20",
  scheduled: "bg-amber-50 text-amber-700 ring-amber-600/20",
  error: "bg-red-50 text-red-700 ring-red-600/20",
  warn: "bg-amber-50 text-amber-700 ring-amber-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};
export function Badge({ tone, children }: { tone: keyof typeof badgeTone; children: ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${badgeTone[tone]}`}>{children}</span>;
}

export function StatusBadge({ item }: { item: { status?: string; publishAt?: string } }) {
  const v = visibility(item);
  return <Badge tone={v}>{v === "live" ? "Published" : v === "draft" ? "Draft" : `Scheduled · ${new Date(item.publishAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`}</Badge>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="text-center text-sm text-gray-500 py-12">{children}</div>;
}

export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");
export const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");

export function LinkButton({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return <Link href={href} className={primary ? btnPrimary : btnGhost}>{children}</Link>;
}
