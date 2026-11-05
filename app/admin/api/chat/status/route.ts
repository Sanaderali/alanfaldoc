import { after } from "next/server";
import { aiEnabled, finalizeChat } from "@/lib/ai";
import { assertAdminRequest } from "@/lib/auth";
import { msg } from "@/lib/chat";
import { notifyChatTranscript } from "@/lib/notify";
import { mutate, now, readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Close or reopen a chat: POST { id, status: "open" | "closed" }. Closing emails the transcript (when mail is configured). */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "chat.reply");
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id ?? "");
  const status = body.status === "closed" ? "closed" : "open";
  await mutate("chats", (all) =>
    all.map((c) => {
      if (c.id !== id || c.status === status) return c;
      const m = msg("system", status === "closed" ? "This chat has been closed. Our conversations are recorded for quality, so please leave a quick rating. Thanks for contacting us!" : "This chat was reopened.");
      const closing = status === "closed" ? { closedBy: "staff" as const, closedAt: m.at, closedByName: auth.user.name || auth.user.username } : { closedBy: undefined, closedAt: undefined, closedByName: undefined };
      return { ...c, ...closing, status, messages: [...c.messages, m], unreadVisitor: c.unreadVisitor + 1, lastMessageAt: m.at, updatedAt: now() };
    })
  );
  if (status === "closed") {
    const chat = (await readAll("chats")).find((c) => c.id === id);
    if (chat) void notifyChatTranscript(chat);
    if (aiEnabled()) after(() => finalizeChat(id));
  }
  return Response.json({ ok: true });
}
