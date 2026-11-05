import { clientIp } from "@/lib/auth";
import { checkSubmission } from "@/lib/antispam";
import { cleanText } from "@/lib/chat";
import { notifyTicketCreated } from "@/lib/notify";
import { allow } from "@/lib/ratelimit";
import { mutate, now } from "@/lib/store";
import { randomUUID } from "node:crypto";
import type { Ticket } from "@/types/content";

export const dynamic = "force-dynamic";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Contact form -> support ticket (+ lead alert and acknowledgement emails once mail is configured). */
export async function POST(req: Request) {
  const ip = await clientIp();
  if (!allow(`contact:${ip}`, 5, 60 * 60 * 1000)) return Response.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  if (body.website) return Response.json({ ok: true }); // honeypot

  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 160).toLowerCase();
  const message = cleanText(body.message, 4000);
  const subject = cleanText(body.question, 120) || "General enquiry";
  const phone = cleanText(body.phone, 30) || undefined;
  if (!name) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (message.length < 5) return Response.json({ error: "Please write a short message." }, { status: 400 });

  const verdict = await checkSubmission({ ip, name, email, message, openedAt: body.t });
  if (verdict.action === "drop") {
    console.info(`[spam] dropped (${verdict.why}) from ${ip}`);
    return Response.json({ ok: true, number: 0 }); // looks like success so bots learn nothing; nothing is saved or emailed
  }
  if (verdict.action === "reject") return Response.json({ error: verdict.message }, { status: verdict.status });

  let ticket!: Ticket;
  await mutate("tickets", (all) => {
    const stamp = now();
    ticket = { id: randomUUID(), number: all.reduce((n, t) => Math.max(n, t.number), 1000) + 1, name, email, phone, subject, message, status: "open", source: "contact", createdAt: stamp, updatedAt: stamp, ip, replies: [], unreadStaff: true };
    return [ticket, ...all];
  });
  // send before answering: on shared hosting a background task can be cut off once the response is sent.
  // Capped at 12 s so a slow mail server can never block the visitor for long; the ticket is saved either way.
  await Promise.race([notifyTicketCreated(ticket).catch(() => undefined), new Promise((r) => setTimeout(r, 12_000))]);
  return Response.json({ ok: true, number: ticket.number });
}
