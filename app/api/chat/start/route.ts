import { clientIp } from "@/lib/auth";
import { cleanPhone, cleanText, hashToken, msg, newToken, publicView } from "@/lib/chat";
import { locate } from "@/lib/geo";
import { notifyChatStarted } from "@/lib/notify";
import { allow } from "@/lib/ratelimit";
import { mutate, now } from "@/lib/store";
import { randomUUID } from "node:crypto";
import type { Chat } from "@/types/content";

export const dynamic = "force-dynamic";

/** Visitor starts a chat. No account: only a phone number (and optional name). */
export async function POST(req: Request) {
  const ip = await clientIp();
  if (!allow(`chat-start:${ip}`, 5, 60 * 60 * 1000)) return Response.json({ error: "Too many chats started. Please try again later." }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  if (body.website) return Response.json({ ok: true }, { status: 200 }); // honeypot: bots fill hidden fields

  const phone = cleanPhone(body.phone);
  if (!phone) return Response.json({ error: "Please enter a valid phone number (7-15 digits)." }, { status: 400 });
  const name = cleanText(body.name, 60) || undefined;

  const token = newToken();
  const h = req.headers;
  const place = await locate(h, ip);
  const stamp = now();
  const chat: Chat = {
    id: randomUUID(),
    tokenHash: hashToken(token),
    phone,
    name,
    status: "open",
    createdAt: stamp,
    updatedAt: stamp,
    lastMessageAt: stamp,
    ip,
    country: place.country,
    city: place.city,
    page: cleanText(body.page, 300) || undefined,
    referrer: cleanText(body.referrer, 300) || undefined,
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    language: (h.get("accept-language") ?? "").split(",")[0]?.slice(0, 20),
    messages: [msg("system", "Thanks for reaching out! An agent will join this chat shortly.")],
    unreadStaff: 1, // a brand-new chat counts as unread so the dashboard alerts
    unreadVisitor: 0,
  };
  await mutate("chats", (all) => [chat, ...all]);
  void notifyChatStarted(chat); // lead alert email (skipped until mail is configured)
  return Response.json({ token, ...publicView(chat) });
}
