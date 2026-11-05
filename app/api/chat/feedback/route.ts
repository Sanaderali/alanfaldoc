import { clientIp } from "@/lib/auth";
import { cleanText, tokenMatches } from "@/lib/chat";
import { allow } from "@/lib/ratelimit";
import { mutate, now } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Feedback after a chat has been closed (by the visitor or by staff): POST { id, token, rating: 1-5, comment? }. One per chat. */
export async function POST(req: Request) {
  if (!allow(`chat-feedback:${await clientIp()}`, 10, 60 * 60 * 1000)) return Response.json({ error: "Too many requests" }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id ?? ""), token = String(body.token ?? "");
  const rating = Math.round(Number(body.rating));
  if (!(rating >= 1 && rating <= 5)) return Response.json({ error: "Please choose 1 to 5 stars." }, { status: 400 });
  const comment = cleanText(body.comment, 600) || undefined;
  let result = "missing" as "ok" | "denied" | "missing" | "closed-first" | "done";
  await mutate("chats", (all) => all.map((c) => {
    if (c.id !== id) return c;
    if (!tokenMatches(token, c.tokenHash)) { result = "denied"; return c; }
    if (c.status !== "closed") { result = "closed-first"; return c; }
    if (c.feedback) { result = "done"; return c; }
    result = "ok";
    return { ...c, feedback: { rating, comment, at: now() }, unreadStaff: c.unreadStaff + 1, updatedAt: now() };
  }));
  if (result === "denied") return Response.json({ error: "Not allowed" }, { status: 403 });
  if (result === "missing") return Response.json({ error: "Chat not found" }, { status: 404 });
  if (result === "closed-first") return Response.json({ error: "Feedback opens when the chat is closed." }, { status: 400 });
  return Response.json({ ok: true });
}
