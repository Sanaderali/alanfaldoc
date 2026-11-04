import { assertAdminRequest } from "@/lib/auth";
import { cleanText, MAX_MESSAGES_PER_CHAT, msg } from "@/lib/chat";
import { mutate, now } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Staff reply: POST { id, text } */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "chat.reply");
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const text = cleanText(body.text, 2000);
  const id = String(body.id ?? "");
  if (!text) return Response.json({ error: "Message is empty" }, { status: 400 });
  let found = false;
  await mutate("chats", (all) =>
    all.map((c) => {
      if (c.id !== id) return c;
      found = true;
      if (c.messages.length >= MAX_MESSAGES_PER_CHAT) return c;
      const m = msg("staff", text, auth.user.name || auth.user.username);
      return { ...c, status: "open" as const, messages: [...c.messages, m], unreadStaff: 0, unreadVisitor: c.unreadVisitor + 1, lastMessageAt: m.at, updatedAt: now(), assignedTo: c.assignedTo ?? auth.user.id };
    })
  );
  return found ? Response.json({ ok: true }) : Response.json({ error: "Chat not found" }, { status: 404 });
}
