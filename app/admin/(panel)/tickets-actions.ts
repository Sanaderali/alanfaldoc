"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePerm } from "@/lib/auth";
import { cleanText } from "@/lib/chat";
import { notifyTicketReply } from "@/lib/notify";
import { mutate, now, readAll } from "@/lib/store";
import type { Ticket } from "@/types/content";

export type TicketResult = { ok: boolean; message?: string };

/** make every open dashboard view (list, thread, menu badges) show the new data straight away */
const refresh = () => revalidatePath("/admin", "layout");

export async function markTicketRead(id: string): Promise<void> {
  await requirePerm("tickets.view");
  await mutate("tickets", (all) => all.map((t) => (t.id === id && t.unreadStaff ? { ...t, unreadStaff: false } : t)));
  refresh();
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
  refresh();
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
  refresh();
  return { ok: true };
}
