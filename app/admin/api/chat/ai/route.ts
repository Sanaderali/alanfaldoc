import { assertAdminRequest } from "@/lib/auth";
import { msg } from "@/lib/chat";
import { mutate, now } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Pause or resume the AI assistant for one chat: POST { id, paused } */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "chat.reply");
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id ?? "");
  const paused = body.paused !== false;
  await mutate("chats", (all) => all.map((c) => (c.id === id ? { ...c, aiPaused: paused, updatedAt: now(), ...(paused ? {} : { messages: [...c.messages, msg("system", "The virtual assistant is back on this chat.")] }) } : c)));
  return Response.json({ ok: true });
}
