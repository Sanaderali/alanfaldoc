"use server";

import { randomUUID } from "node:crypto";
import { refresh } from "next/cache";
import { requirePerm } from "@/lib/auth";
import { cleanText } from "@/lib/chat";
import { can } from "@/lib/rbac";
import { notifyTicketReply } from "@/lib/notify";
import { mutate, now, readAll } from "@/lib/store";
import type { Ticket } from "@/types/content";

export type TicketResult = { ok: boolean; message?: string };

/** re-render only the page the user is on (cheap). Does not wipe the whole client cache. */
const refreshView = () => refresh();

export async function markTicketRead(id: string): Promise<void> {
  await requirePerm("tickets.view");
  await mutate("tickets", (all) => all.map((t) => (t.id === id && t.unreadStaff ? { ...t, unreadStaff: false } : t)));
  // intentionally no refresh: marking as read must never re-render the page (the menu badge updates by itself)
}

/** Reply to a ticket: saved in the thread and emailed to the customer (once mail is configured). */
export async function replyTicket(id: string, text: string, closeAfter = false): Promise<TicketResult> {
  const me = await requirePerm("tickets.reply");
  const body = cleanText(text, 5000);
  if (!body) return { ok: false, message: "Write a reply first" };
  const reply = { id: randomUUID(), by: "staff" as const, staffName: me.name || me.username, staffId: me.id, body, at: now() };
  let updated: Ticket | undefined;
  await mutate("tickets", (all) => all.map((t) => (t.id === id ? (updated = { ...t, replies: [...t.replies, reply], status: closeAfter ? "closed" : "pending", unreadStaff: false, updatedAt: reply.at, assignedTo: t.assignedTo ?? me.id, firstResponseAt: t.firstResponseAt ?? reply.at, ...(closeAfter ? { closedBy: me.id, closedAt: reply.at } : {}) }) : t)));
  if (!updated) return { ok: false, message: "Ticket not found" };
  const mail = await notifyTicketReply(updated, reply);
  refreshView();
  const done = closeAfter ? "Reply saved and ticket closed" : "Reply saved";
  return { ok: true, message: mail.sent ? `${done}. Email sent to ${updated.email}.` : mail.skipped ? `${done}. Email is not connected yet, so nothing was emailed.` : `${done}, but the email could not be sent. Check the email settings.` };
}

/** One-click status change from the ticket list (form action). */
export async function changeTicketStatus(id: string, status: Ticket["status"]): Promise<void> {
  await setTicketStatus(id, status);
}

export async function setTicketStatus(id: string, status: Ticket["status"]): Promise<TicketResult> {
  const me = await requirePerm("tickets.reply");
  if (!["open", "pending", "closed"].includes(status)) return { ok: false, message: "Invalid status" };
  const exists = (await readAll("tickets")).some((t) => t.id === id);
  if (!exists) return { ok: false, message: "Ticket not found" };
  await mutate("tickets", (all) => all.map((t) => (t.id === id ? { ...t, status, updatedAt: now(), ...(status === "closed" ? { closedBy: me.id, closedAt: now() } : { closedBy: undefined, closedAt: undefined }) } : t)));
  refreshView();
  return { ok: true };
}

/** Assign a ticket to a team member who can reply ("" = unassigned). */
export async function assignTicket(id: string, userId: string): Promise<TicketResult> {
  await requirePerm("tickets.reply");
  if (userId) {
    const u = (await readAll("users")).find((x) => x.id === userId && x.active);
    if (!u || !can(u, "tickets.reply")) return { ok: false, message: "That person cannot reply to tickets" };
  }
  const exists = (await readAll("tickets")).some((t) => t.id === id);
  if (!exists) return { ok: false, message: "Ticket not found" };
  await mutate("tickets", (all) => all.map((t) => (t.id === id ? { ...t, assignedTo: userId || undefined, updatedAt: now() } : t)));
  refreshView();
  return { ok: true };
}
