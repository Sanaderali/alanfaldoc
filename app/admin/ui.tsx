import Link from "next/link";
import type { ReactNode } from "react";
import { visibility } from "@/lib/audit";

/** UI kit for the dashboard. Flat, WordPress-like: square-ish controls, #c3c4c7 borders, gray canvas. */

export const inputCls = "w-full px-2.5 py-1.5 bg-a-surface border border-a-line2 rounded-[3px] text-sm text-a-text placeholder-a-subtle shadow-[inset_0_1px_2px_rgba(0,0,0,.07)] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand";
export const btnPrimary = "inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-brand text-a-on text-[13px] font-medium border border-brand-dark rounded-[3px] hover:bg-brand-dark transition-colors disabled:opacity-60 min-h-[30px]";
export const btnGhost = "inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-a-raised text-brand-text text-[13px] font-medium border border-brand/70 rounded-[3px] hover:bg-a-raised hover:border-brand-dark transition-colors disabled:opacity-60 min-h-[30px]";
/** WordPress "Add New" outlined button next to page titles */
export const btnAddNew = "inline-flex items-center px-2.5 py-1 text-[13px] font-medium text-brand-text border border-brand/70 rounded-[3px] bg-a-raised hover:bg-a-raised hover:border-brand-dark align-middle";

export function PageHeader({ title, subtitle, actions, addNew }: { title: string; subtitle?: string; actions?: ReactNode; addNew?: { href: string; label: string } }) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[23px] leading-tight font-normal text-a-text">{title}</h1>
        {addNew && <Link href={addNew.href} className={btnAddNew}>{addNew.label}</Link>}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {subtitle && <p className="text-[13px] text-a-muted mt-1.5">{subtitle}</p>}
    </div>
  );
}

/** WordPress "postbox" */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] ${className}`}>{children}</div>;
}

const badgeTone = {
  live: "text-brand",
  draft: "text-a-muted",
  scheduled: "text-amber-300",
  trash: "text-a-red",
  error: "bg-a-red/10 text-a-red ring-1 ring-inset ring-a-red/30 px-2 py-0.5 rounded-full",
  warn: "bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/30 px-2 py-0.5 rounded-full",
  info: "bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/30 px-2 py-0.5 rounded-full",
  ok: "bg-brand/10 text-brand ring-1 ring-inset ring-brand/30 px-2 py-0.5 rounded-full",
};
export function Badge({ tone, children }: { tone: keyof typeof badgeTone; children: ReactNode }) {
  return <span className={`inline-flex items-center text-xs font-medium ${badgeTone[tone]}`}>{children}</span>;
}

/** WordPress-style status text: "Published" / "Draft" / "Scheduled" / "Trash" */
export function StatusBadge({ item }: { item: { status?: string; publishAt?: string } }) {
  const v = visibility(item);
  return <Badge tone={v}>{v === "live" ? "Published" : v === "draft" ? "Draft" : v === "trash" ? "Trash" : `Scheduled ${new Date(item.publishAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`}</Badge>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="text-center text-sm text-a-muted py-10">{children}</div>;
}

export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");
export const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");
/** WordPress list date: 2024/02/09 at 7:48 pm */
export const wpDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  const h = d.getHours() % 12 || 12;
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} at ${h}:${p(d.getMinutes())} ${d.getHours() >= 12 ? "pm" : "am"}`;
};

export function LinkButton({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return <Link href={href} className={primary ? btnPrimary : btnGhost}>{children}</Link>;
}
