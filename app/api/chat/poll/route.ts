import { publicView, tokenMatches } from "@/lib/chat";
import { clientIp } from "@/lib/auth";
import { allow } from "@/lib/ratelimit";
import { mutate, readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Visitor polls for new messages: ?id=…&token=…&since=<messages already shown> */
export async function GET(req: Request) {
  if (!allow(`chat-poll:${await clientIp()}`, 120, 60 * 1000)) return Response.json({ error: "Slow down" }, { status: 429 });
  const u = new URL(req.url);
  const id = u.searchParams.get("id") ?? "";
  const token = u.searchParams.get("token") ?? "";
  const since = Math.max(0, Number(u.searchParams.get("since")) || 0);

  const chat = (await readAll("chats")).find((c) => c.id === id);
  if (!chat) return Response.json({ error: "Chat not found" }, { status: 404 });
  if (!tokenMatches(token, chat.tokenHash)) return Response.json({ error: "Not allowed" }, { status: 403 });

  // the visitor has now seen the staff replies
  if (chat.unreadVisitor > 0 && chat.messages.length > since) await mutate("chats", (all) => all.map((c) => (c.id === id ? { ...c, unreadVisitor: 0 } : c)));
  return Response.json(publicView(chat, since), { headers: { "Cache-Control": "no-store" } });
}
