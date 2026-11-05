import { randomUUID } from "node:crypto";
import { assertAdminRequest } from "@/lib/auth";
import { cleanText } from "@/lib/chat";
import { mutate, now, readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Teach the assistant from a staff reply: POST { id (chat), messageId } or { question, answer }. The team decides what is learned. */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "chat.reply");
  if ("error" in auth) return auth.error;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  let question = cleanText(b.question, 300), answer = cleanText(b.answer, 1200);
  if (!question || !answer) {
    const chat = (await readAll("chats")).find((c) => c.id === String(b.id ?? ""));
    const i = chat ? chat.messages.findIndex((m) => m.id === String(b.messageId ?? "")) : -1;
    if (!chat || i < 0 || chat.messages[i].from !== "staff") return Response.json({ error: "Pick one of the team's replies." }, { status: 400 });
    answer = cleanText(chat.messages[i].text, 1200);
    const before = chat.messages.slice(0, i).reverse().find((m) => m.from === "visitor");
    question = cleanText(before?.text ?? "", 300);
  }
  if (!question || !answer) return Response.json({ error: "Nothing to learn from this reply." }, { status: 400 });
  // never learn payment details or contact data
  if (/(\bAED\b|\bUSD\b|\$\s?\d|\d+\s?(dirhams?|aed)|iban|swift|account number|card number|invoice|receipt|payment link)/i.test(answer) || /@|\+?\d[\d\s-]{8,}/.test(answer))
    return Response.json({ error: "This reply mentions money, bank or contact details, so it can't be saved as a general answer. Edit it first." }, { status: 400 });
  await mutate("knowledge", (all) => [{ id: randomUUID(), status: "published" as const, question, answer, fromChat: String(b.id ?? "") || undefined, addedBy: auth.user.name || auth.user.username, createdAt: now(), updatedAt: now() }, ...all].slice(0, 300));
  return Response.json({ ok: true });
}
