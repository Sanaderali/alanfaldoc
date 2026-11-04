import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/rbac";
import { fmtDuration, RANGES, teamStats, type Range } from "@/lib/team-stats";
import { Badge, Empty, PageHeader, wpDate } from "../../../ui";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requirePerm("users.manage");
  const { range: r } = await searchParams;
  const range = (RANGES.some((x) => x.key === r) ? r : "30") as Range;
  const { members, totals } = await teamStats(range);
  const th = "px-3 py-2.5 font-normal";
  const stat = (label: string, value: number, hint?: string) => (
    <div className="bg-a-surface border border-a-line p-3"><p className="text-xs text-a-muted">{label}</p><p className="text-[24px] leading-tight font-semibold">{value}</p>{hint && <p className="text-xs text-a-subtle">{hint}</p>}</div>
  );
  return (
    <>
      <PageHeader title="Support Activity" subtitle="Who can reply to tickets and chats, and how much each person has handled." />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {stat("Open tickets", totals.open)}
        {stat("Pending", totals.pending)}
        {stat("Closed", totals.closed)}
        {stat("Awaiting first reply", totals.awaitingReply)}
        {stat("Unassigned (not closed)", totals.unassigned)}
      </div>
      <ul className="flex items-center gap-1 text-[13px] mb-3">
        {RANGES.map((x, i) => (
          <li key={x.key} className="flex items-center gap-1">{i > 0 && <span className="text-a-subtle">|</span>}
            <Link href={`/admin/users/activity?range=${x.key}`} className={`hover:text-brand-dark ${range === x.key ? "font-semibold text-a-text" : "text-brand-text"}`}>{x.label}</Link>
          </li>
        ))}
      </ul>
      <div className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] overflow-x-auto">
        {members.length === 0 ? <Empty>No team members can reply yet. <Link href="/admin/users/new" className="text-brand-text underline">Add a Support Agent</Link>.</Empty> : (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left border-b border-a-line"><th className={th}>Team member</th><th className={th}>Can reply to</th><th className={th}>Tickets replied</th><th className={th}>Total replies</th><th className={th}>Open now</th><th className={th}>Pending now</th><th className={th}>Closed</th><th className={th}>Avg first response</th><th className={th}>Chats</th><th className={th}>Last active</th></tr></thead>
            <tbody>
              {members.map((m, n) => (
                <tr key={m.user.id} className={`align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                  <td className="px-3 py-2.5"><Link href={`/admin/users/${m.user.id}`} className="font-semibold text-[14px] text-brand-text">{m.user.name}</Link>{!m.user.active && <> <Badge tone="error">Deactivated</Badge></>}<div className="text-xs text-a-muted">{ROLE_LABEL[m.user.role]}</div></td>
                  <td className="px-3 py-2.5 space-x-1">{m.canReplyTickets ? <Badge tone="ok">Tickets</Badge> : <Badge tone="draft">No tickets</Badge>}{m.canReplyChat ? <Badge tone="ok">Chat</Badge> : null}</td>
                  <td className="px-3 py-2.5 font-semibold">{m.ticketsReplied}</td>
                  <td className="px-3 py-2.5">{m.totalReplies}</td>
                  <td className="px-3 py-2.5">{m.openNow}</td>
                  <td className="px-3 py-2.5">{m.pendingNow}</td>
                  <td className="px-3 py-2.5">{m.closed}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{fmtDuration(m.avgFirstResponseMin)}</td>
                  <td className="px-3 py-2.5">{m.chatsHandled} <span className="text-a-subtle text-xs">({m.chatMessages} msg)</span></td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-a-muted">{m.lastActiveAt ? wpDate(m.lastActiveAt) : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-a-muted mt-3">Replied / Closed / Chats follow the selected period. Open and Pending show tickets currently assigned to that person. A ticket is assigned to whoever replies first, or by choosing &ldquo;Assigned to&rdquo; on the ticket.</p>
    </>
  );
}
