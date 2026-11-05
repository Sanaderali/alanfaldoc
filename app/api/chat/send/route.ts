import { after } from "next/server";
import { askAI, AI_NAME, aiEnabled, MAX_AI_REPLIES, updateProfile, wantsHuman } from "@/lib/ai";
import { clientIp } from "@/lib/auth";
import { cleanText, tokenMatches, MAX_MESSAGES_PER_CHAT, msg, publicView } from "@/lib/chat";
import { allow } from "@/lib/ratelimit";
import { mutate, now, readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Visitor sends a message. Authenticated by the secret token created when the chat started. */
export async function POST(req: Request) {
  const ip = await clientIp();
  if (!allow(`chat-send:${ip}`, 30, 60 * 1000)) return Response.json({ error: "You are sending messages too quickly." }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const text = cleanText(body.text);
  const id = String(body.id ?? "");
  const token = String(body.token ?? "");
  if (!text) return Response.json({ error: "Message is empty" }, { status: 400 });

  let result: ReturnType<typeof publicView> | null = null;
  let denied = false;
  await mutate("chats", (all) =>
    all.map((c) => {
      if (c.id !== id) return c;
      if (!tokenMatches(token, c.tokenHash)) { denied = true; return c; }
      if (c.status === "closed" || c.messages.length >= MAX_MESSAGES_PER_CHAT) { result = publicView(c); return c; }
      const m = msg("visitor", text, c.name);
      const next = { ...c, messages: [...c.messages, m], unreadStaff: c.unreadStaff + 1, lastMessageAt: m.at, updatedAt: now() };
      result = publicView(next, Math.max(0, next.messages.length - 1));
      return next;
    })
  );
  if (denied) return Response.json({ error: "Not allowed" }, { status: 403 });
  if (!result) return Response.json({ error: "Chat not found" }, { status: 404 });
  // AI assistant: answers in the background while no staff member has joined. It never blocks the visitor's message.
  if (aiEnabled()) after(async () => { await aiReply(id); await updateProfile(id); });
  return Response.json(result);
}

async function aiReply(id: string) {
  const chat = (await readAll("chats")).find((c) => c.id === id);
  if (!chat || chat.status !== "open" || chat.aiPaused || (chat.aiReplies ?? 0) >= MAX_AI_REPLIES) return;
  if (chat.messages[chat.messages.length - 1]?.from !== "visitor") return;
  const lastText = chat.messages[chat.messages.length - 1]?.text ?? "";
  // the visitor asks for a person: say so, alert the team and step back
  if (wantsHuman(lastText)) {
    await mutate("chats", (all) =>
      all.map((c) => {
        if (c.id !== id || c.aiPaused) return c;
        const a = msg("ai", "Of course, I've let the team know. Someone will join this chat shortly.", AI_NAME);
        return { ...c, messages: [...c.messages, a], unreadVisitor: c.unreadVisitor + 1, unreadStaff: c.unreadStaff + 1, aiPaused: true, aiReplies: (c.aiReplies ?? 0) + 1, lastMessageAt: a.at, updatedAt: now() };
      })
    );
    return;
  }
  const r = await askAI(chat);
  if (!r) return;
  await mutate("chats", (all) =>
    all.map((c) => {
      if (c.id !== id || c.aiPaused || c.status !== "open") return c; // a person took over while the AI was thinking
      const a = msg("ai", r.text, AI_NAME);
      return { ...c, messages: [...c.messages, a], unreadVisitor: c.unreadVisitor + 1, aiReplies: (c.aiReplies ?? 0) + 1, lastMessageAt: a.at, updatedAt: now() };
    })
  );
}
