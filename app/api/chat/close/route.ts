import { after } from "next/server";
import { aiEnabled, finalizeChat } from "@/lib/ai";
import { clientIp } from "@/lib/auth";
import { msg, publicView, tokenMatches } from "@/lib/chat";
import { allow } from "@/lib/ratelimit";
import { mutate, now, readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** The visitor ends the chat: POST { id, token } */
export async function POST(req: Request) {
  if (!allow(`chat-close:${await clientIp()}`, 20, 60 * 60 * 1000)) return Response.json({ error: "Too many requests" }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id ?? ""), token = String(body.token ?? "");
  let denied = false, found = false;
  await mutate("chats", (all) => all.map((c) => {
    if (c.id !== id) return c;
    found = true;
    if (!tokenMatches(token, c.tokenHash)) { denied = true; return c; }
    if (c.status === "closed") return c;
    const m = msg("system", "You ended this chat. Thank you for contacting us!");
    return { ...c, status: "closed" as const, closedBy: "visitor" as const, closedAt: m.at, closedByName: c.name || "Visitor", messages: [...c.messages, m], unreadStaff: c.unreadStaff + 1, lastMessageAt: m.at, updatedAt: now() };
  }));
  if (!found) return Response.json({ error: "Chat not found" }, { status: 404 });
  if (denied) return Response.json({ error: "Not allowed" }, { status: 403 });
  if (aiEnabled()) after(() => finalizeChat(id));
  const chat = (await readAll("chats")).find((c) => c.id === id)!;
  return Response.json(publicView(chat, chat.messages.length));
}
