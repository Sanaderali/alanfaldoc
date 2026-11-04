import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { readAll } from "@/lib/store";
import { Badge, Empty, PageHeader, wpDate } from "../../ui";
import { changeTicketStatus } from "../tickets-actions";

export const dynamic = "force-dynamic";

const tone = { open: "warn", pending: "info", closed: "ok" } as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const me = await requirePerm("tickets.view");
  const canReply = can(me, "tickets.reply");
  const { status = "all", q = "" } = await searchParams;
  const all = (await readAll("tickets")).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const count = (s: string) => all.filter((t) => s === "all" || t.status === s).length;
  const names = new Map((await readAll("users")).map((u) => [u.id, u.name]));
  const rows = all.filter((t) => (status === "all" || t.status === status) && (!q || `${t.name} ${t.email} ${t.subject} ${t.message} #${t.number}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <PageHeader title="Tickets" />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <ul className="flex items-center gap-1 text-[13px]">
          {(["all", "open", "pending", "closed"] as const).map((s, i) => (
            <li key={s} className="flex items-center gap-1">{i > 0 && <span className="text-a-subtle">|</span>}
              <Link href={`/admin/tickets${s === "all" ? "" : `?status=${s}`}`} className={`hover:text-brand-dark ${status === s ? "font-semibold text-a-text" : "text-brand-text"}`}>{s[0].toUpperCase() + s.slice(1)} <span className="text-a-muted font-normal">({count(s)})</span></Link>
            </li>
          ))}
        </ul>
        <form role="search" className="flex gap-1.5"><input type="hidden" name="status" value={status === "all" ? "" : status} /><input name="q" defaultValue={q} aria-label="Search tickets" className="px-2 py-1 text-[13px] border border-a-line2 rounded-[3px] w-48" /><button className="px-3 py-1 text-[13px] border border-brand/70 rounded-[3px] bg-a-raised text-brand-text">Search</button></form>
      </div>
      <div className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] overflow-x-auto">
        {rows.length === 0 ? (
          <Empty>
            {all.length === 0 ? (
              <>No tickets yet. Every message sent from the website&apos;s <Link href="/contact" target="_blank" className="text-brand-text underline">Contact page</Link> becomes a ticket here. Send yourself a test message to see it appear.</>
            ) : q ? <>No tickets match &ldquo;{q}&rdquo;.</> : <>No {status} tickets. <Link href="/admin/tickets" className="text-brand-text underline">Show all tickets</Link></>}
          </Empty>
        ) : (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left border-b border-a-line"><th className="px-3 py-2.5 font-normal">Ticket</th><th className="px-3 py-2.5 font-normal">From</th><th className="px-3 py-2.5 font-normal">Status</th><th className="px-3 py-2.5 font-normal">Assigned to</th><th className="px-3 py-2.5 font-normal">Replies</th><th className="px-3 py-2.5 font-normal">Updated</th></tr></thead>
            <tbody>
              {rows.map((t, n) => (
                <tr key={t.id} className={`group align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                  <td className="px-3 py-2.5"><Link href={`/admin/tickets/${t.id}`} className="font-semibold text-[14px] text-brand-text">#{t.number} {t.subject}</Link>{t.unreadStaff && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-a-red align-middle" title="Unread" />}<p className="text-xs text-a-muted mt-0.5 line-clamp-1">{t.message}</p>
                    {canReply && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity">
                        <Link href={`/admin/tickets/${t.id}`} className="text-brand-text hover:underline">Open</Link>
                        {t.status !== "pending" && t.status !== "closed" && <><span className="text-a-subtle">|</span><form action={changeTicketStatus.bind(null, t.id, "pending")}><button className="text-brand-text hover:underline">Mark pending</button></form></>}
                        {t.status !== "closed" && <><span className="text-a-subtle">|</span><form action={changeTicketStatus.bind(null, t.id, "closed")}><button className="text-brand-text hover:underline">Close</button></form></>}
                        {t.status !== "open" && <><span className="text-a-subtle">|</span><form action={changeTicketStatus.bind(null, t.id, "open")}><button className="text-brand-text hover:underline">Reopen</button></form></>}
                      </div>
                    )}</td>
                  <td className="px-3 py-2.5">{t.name}<br /><span className="text-a-muted text-xs">{t.email}</span></td>
                  <td className="px-3 py-2.5"><Badge tone={tone[t.status]}>{t.status[0].toUpperCase() + t.status.slice(1)}</Badge></td>
                  <td className="px-3 py-2.5">{t.assignedTo ? names.get(t.assignedTo) ?? "Removed user" : <span className="text-a-subtle">Unassigned</span>}</td>
                  <td className="px-3 py-2.5">{t.replies.length}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-a-muted">{wpDate(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
