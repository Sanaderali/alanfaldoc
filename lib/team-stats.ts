import "server-only";
import { can } from "@/lib/rbac";
import { readAll } from "@/lib/store";
import type { User } from "@/types/content";

/** Support-team activity, computed from tickets + chats (nothing extra is stored). */

export type Range = "7" | "30" | "90" | "all";
export const RANGES: { key: Range; label: string }[] = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

export type MemberStats = {
  user: User;
  canReplyTickets: boolean;
  canReplyChat: boolean;
  /** distinct tickets this person replied to in the range */
  ticketsReplied: number;
  /** total ticket replies in the range */
  totalReplies: number;
  /** tickets currently assigned to them that are open / pending (not range-limited) */
  openNow: number;
  pendingNow: number;
  closed: number;
  /** average minutes from ticket creation to this person's first reply (tickets they answered first) */
  avgFirstResponseMin: number | null;
  chatsHandled: number;
  chatMessages: number;
  lastActiveAt?: string;
};

export async function teamStats(range: Range) {
  const since = range === "all" ? 0 : Date.now() - Number(range) * 86_400_000;
  const inRange = (iso: string) => new Date(iso).getTime() >= since;
  const [users, tickets, chats] = await Promise.all([readAll("users"), readAll("tickets"), readAll("chats")]);

  // a reply belongs to a user by id; older replies (no id) fall back to the stored name
  const byName = new Map(users.map((u) => [(u.name || u.username).toLowerCase(), u.id]));
  const owner = (r: { staffId?: string; staffName?: string }) => r.staffId ?? (r.staffName ? byName.get(r.staffName.toLowerCase()) : undefined);

  const members: MemberStats[] = users
    .filter((u) => can(u, "tickets.reply") || can(u, "chat.reply") || tickets.some((t) => t.replies.some((r) => r.by === "staff" && owner(r) === u.id)))
    .map((u) => {
      const replied = new Set<string>();
      let totalReplies = 0;
      let last: string | undefined;
      const firstResp: number[] = [];
      for (const t of tickets) {
        const mine = t.replies.filter((r) => r.by === "staff" && owner(r) === u.id);
        const recent = mine.filter((r) => inRange(r.at));
        if (recent.length) { replied.add(t.id); totalReplies += recent.length; }
        for (const r of mine) if (!last || r.at > last) last = r.at;
        const firstStaff = t.replies.find((r) => r.by === "staff");
        if (firstStaff && owner(firstStaff) === u.id && inRange(firstStaff.at)) firstResp.push(Math.max(0, new Date(firstStaff.at).getTime() - new Date(t.createdAt).getTime()) / 60_000);
      }
      const assigned = tickets.filter((t) => t.assignedTo === u.id);
      let chatsHandled = 0, chatMessages = 0;
      for (const c of chats) {
        const mine = c.messages.filter((m) => m.from === "staff" && (m.staffId === u.id || (!m.staffId && m.name && m.name.toLowerCase() === (u.name || u.username).toLowerCase())) && inRange(m.at));
        if (mine.length) { chatsHandled++; chatMessages += mine.length; const l = mine[mine.length - 1].at; if (!last || l > last) last = l; }
      }
      return {
        user: u,
        canReplyTickets: can(u, "tickets.reply"),
        canReplyChat: can(u, "chat.reply"),
        ticketsReplied: replied.size,
        totalReplies,
        openNow: assigned.filter((t) => t.status === "open").length,
        pendingNow: assigned.filter((t) => t.status === "pending").length,
        closed: tickets.filter((t) => t.closedBy === u.id && t.closedAt && inRange(t.closedAt)).length,
        avgFirstResponseMin: firstResp.length ? firstResp.reduce((a, b) => a + b, 0) / firstResp.length : null,
        chatsHandled,
        chatMessages,
        lastActiveAt: last,
      };
    })
    .sort((a, b) => b.ticketsReplied - a.ticketsReplied || a.user.name.localeCompare(b.user.name));

  const knownIds = new Set(users.map((u) => u.id));
  return {
    members,
    totals: {
      open: tickets.filter((t) => t.status === "open").length,
      pending: tickets.filter((t) => t.status === "pending").length,
      closed: tickets.filter((t) => t.status === "closed").length,
      unassigned: tickets.filter((t) => t.status !== "closed" && (!t.assignedTo || !knownIds.has(t.assignedTo))).length,
      awaitingReply: tickets.filter((t) => t.status === "open" && t.replies.every((r) => r.by !== "staff")).length,
    },
  };
}

export function fmtDuration(min: number | null) {
  if (min === null) return "-";
  if (min < 1) return "< 1 min";
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 1440) return `${(min / 60).toFixed(1)} h`;
  return `${(min / 1440).toFixed(1)} days`;
}
