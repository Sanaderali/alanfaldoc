"use server";

import { randomUUID } from "node:crypto";
import { refresh } from "next/cache";
import { requirePerm } from "@/lib/auth";
import { cleanText } from "@/lib/chat";
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
  const reply = { id: randomUUID(), by: "staff" as const, staffName: me.name || me.username, body, at: now() };
  let updated: Ticket | undefined;
  await mutate("tickets", (all) => all.map((t) => (t.id === id ? (updated = { ...t, replies: [...t.replies, reply], status: closeAfter ? "closed" : "pending", unreadStaff: false, updatedAt: reply.at }) : t)));
  if (!updated) return { ok: false, message: "Ticket not found" };
  void notifyTicketReply(updated, reply);
  refreshView();
  return { ok: true, message: closeAfter ? "Reply sent and ticket closed" : "Reply sent" };
}

/** One-click status change from the ticket list (form action). */
export async function changeTicketStatus(id: string, status: Ticket["status"]): Promise<void> {
  await setTicketStatus(id, status);
}

export async function setTicketStatus(id: string, status: Ticket["status"]): Promise<TicketResult> {
  await requirePerm("tickets.reply");
  if (!["open", "pending", "closed"].includes(status)) return { ok: false, message: "Invalid status" };
  const exists = (await readAll("tickets")).some((t) => t.id === id);
  if (!exists) return { ok: false, message: "Ticket not found" };
  await mutate("tickets", (all) => all.map((t) => (t.id === id ? { ...t, status, updatedAt: now() } : t)));
  refreshView();
  return { ok: true };
}
