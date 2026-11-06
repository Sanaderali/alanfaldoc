import { AI_NAME } from "@/lib/ai";
import { assistantOn } from "@/lib/chat-assistant";
import { LOCAL_LANGS, normalizePhone, template } from "@/lib/local-ai";
import { clientIp } from "@/lib/auth";
import { cleanPhone, cleanText, hashToken, msg, newToken, publicView } from "@/lib/chat";
import { locate } from "@/lib/geo";
import { notifyChatStarted } from "@/lib/notify";
import { allow } from "@/lib/ratelimit";
import { mutate, now, readAll } from "@/lib/store";
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

  // the site language the visitor chose (header globe), used for the assistant's first words
  const siteLang = (LOCAL_LANGS as string[]).includes(String(body.lang ?? "")) ? String(body.lang) : "en";

  // the same phone number has chatted before: recognise the client (their details help the team and the assistant, they are never read back)
  const digits = normalizePhone(phone);
  const before = (await readAll("chats")).filter((c) => normalizePhone(c.phone) === digits && digits.length >= 7).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const prev = before[0];
  const returning = prev ? { count: before.length, lastAt: prev.createdAt } : undefined;
  // use the earlier name only when the visitor typed a name now, or the earlier chat came from the same connection (so a stranger typing someone's number does not see their name)
  const knownName = prev ? prev.profile?.name || prev.name : undefined;
  const sameBrowser = !!prev && !!ip && prev.ip === ip;
  const greetName = name ?? (sameBrowser ? knownName : undefined);

  const token = newToken();
  const h = req.headers;
  const place = await locate(h, ip);
  const stamp = now();
  const chat: Chat = {
    id: randomUUID(),
    tokenHash: hashToken(token),
    phone,
    name: name ?? (sameBrowser ? knownName : undefined),
    lang: siteLang,
    ...(returning ? { returning, profile: prev?.profile } : {}),
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
    messages: [assistantOn() ? { ...msg("ai", returning ? template(siteLang, "welcome", { name: greetName }) : siteLang === "en" ? `Hi, I'm ${AI_NAME} from Al Anfal Doc. How can I help you today?` : template(siteLang, "greet", { name: greetName }), AI_NAME), src: "local" as const } : msg("system", "Thanks for reaching out! An agent will join this chat shortly.")],
    unreadStaff: 1, // a brand-new chat counts as unread so the dashboard alerts
    unreadVisitor: 0,
  };
  await mutate("chats", (all) => [chat, ...all]);
  void notifyChatStarted(chat); // lead alert email (skipped until mail is configured)
  return Response.json({ token, ...publicView(chat) });
}
