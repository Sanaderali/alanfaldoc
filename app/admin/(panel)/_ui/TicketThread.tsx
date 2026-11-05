"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Ticket } from "@/types/content";
import { btnGhost, btnPrimary, inputCls, wpDate } from "../../ui";
import { assignTicket, markTicketRead, replyTicket, setTicketStatus } from "../tickets-actions";

export default function TicketThread({ ticket, canReply, agents, names }: { ticket: Ticket; canReply: boolean; agents: { id: string; name: string }[]; names: Record<string, string> }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  // mark as read ONCE per ticket (no refresh afterwards, so it can never loop)
  const marked = useRef<string | null>(null);
  useEffect(() => {
    if (ticket.unreadStaff && marked.current !== ticket.id) {
      marked.current = ticket.id;
      void markTicketRead(ticket.id);
    }
  }, [ticket.id, ticket.unreadStaff]);

  const send = (close: boolean) => start(async () => {
    const r = await replyTicket(ticket.id, text, close);
    setMsg({ ok: r.ok, text: r.message ?? "" });
    if (r.ok) setText("");
  });
  const bubble = (who: "customer" | "staff") => `border px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${who === "staff" ? "bg-brand-50 border-brand-200" : "bg-a-surface border-a-line"}`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
      <div className="space-y-3 min-w-0">
        <div className={bubble("customer")}>
          <p className="text-xs text-a-muted mb-1.5"><strong className="text-a-text">{ticket.name}</strong> · {wpDate(ticket.createdAt)}</p>
          {ticket.message}
        </div>
        {ticket.replies.map((r) => (
          <div key={r.id} className={bubble(r.by)}>
            <p className="text-xs text-a-muted mb-1.5"><strong className="text-a-text">{r.by === "staff" ? (r.staffId && names[r.staffId]) || r.staffName || "Support" : ticket.name}</strong> · {wpDate(r.at)}</p>
            {r.body}
          </div>
        ))}
        {canReply && (
          <section className="bg-a-surface border border-a-line p-3 space-y-3">
            <label htmlFor="reply" className="text-[13px] font-semibold">Reply to {ticket.name}</label>
            <textarea id="reply" rows={6} value={text} onChange={(e) => setText(e.target.value)} className={inputCls} placeholder="Write your reply. It is saved in the ticket and emailed to the customer." />
            {msg && <p role={msg.ok ? "status" : "alert"} className={`text-[13px] px-2.5 py-1.5 border-l-4 ${msg.ok ? "border-brand text-brand" : "border-a-red text-a-red"}`}>{msg.text}</p>}
            <div className="flex gap-2"><button type="button" disabled={pending || !text.trim()} onClick={() => send(false)} className={btnPrimary}>Send reply</button><button type="button" disabled={pending || !text.trim()} onClick={() => send(true)} className={btnGhost}>Reply & close</button></div>
          </section>
        )}
      </div>
      <aside className="space-y-5 xl:sticky xl:top-12">
        <section className="bg-a-surface border border-a-line">
          <h2 className="px-3 py-2.5 font-semibold text-[14px] border-b border-a-line">Details</h2>
          <dl className="p-3 text-[13px] space-y-2">
            <div><dt className="text-a-muted text-xs">Customer</dt><dd>{ticket.name}</dd></div>
            <div><dt className="text-a-muted text-xs">Email</dt><dd><a className="text-brand-text underline" href={`mailto:${ticket.email}`}>{ticket.email}</a></dd></div>
            {ticket.phone && <div><dt className="text-a-muted text-xs">Phone</dt><dd><a className="text-brand-text underline" href={`tel:${ticket.phone}`}>{ticket.phone}</a></dd></div>}
            <div><dt className="text-a-muted text-xs">Handled by</dt><dd>{ticket.assignedTo ? names[ticket.assignedTo] ?? "Removed user" : "Unassigned"}</dd></div>
            <div><dt className="text-a-muted text-xs">Opened</dt><dd>{wpDate(ticket.createdAt)}</dd></div>
            {ticket.ip && <div><dt className="text-a-muted text-xs">IP address</dt><dd>{ticket.ip}</dd></div>}
          </dl>
          {canReply && (
            <div className="px-3 pb-3">
              <label htmlFor="tstatus" className="text-xs text-a-muted">Status</label>
              <select id="tstatus" value={ticket.status} onChange={(e) => start(async () => { await setTicketStatus(ticket.id, e.target.value as Ticket["status"]); })} className={`${inputCls} mt-1`}>
                <option value="open">Open</option><option value="pending">Pending (waiting for customer)</option><option value="closed">Closed</option>
              </select>
            </div>
          )}
          {canReply && (
            <div className="px-3 pb-3">
              <label htmlFor="tassign" className="text-xs text-a-muted">Assigned to</label>
              <select id="tassign" value={ticket.assignedTo ?? ""} onChange={(e) => start(async () => { const r = await assignTicket(ticket.id, e.target.value); if (!r.ok) setMsg({ ok: false, text: r.message ?? "" }); })} className={`${inputCls} mt-1`}>
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
