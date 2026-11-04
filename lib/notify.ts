import "server-only";
import { site } from "@/data/site";
import { leadRecipients, sendMail } from "@/lib/mail";
import type { Chat, Ticket, TicketReply, User } from "@/types/content";

/**
 * Every automatic email the website can send. Each trigger is already called from the right place in the code
 * (user creation, contact form, new chat, chat closed, ticket reply). They all go through sendMail(), which does
 * nothing until a provider is configured in lib/mail.ts / .env. All functions are safe to call: they never throw.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wrap = (title: string, body: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1A1A1A"><h2 style="color:#0A5C36">${esc(title)}</h2>${body}<hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0"/><p style="font-size:12px;color:#6b7280">${esc(site.name)} · ${esc(site.address)}</p></div>`;

/** Welcome email for a new team member (never contains the password) */
export async function notifyWelcome(user: User) {
  const url = `${site.url}/admin/login`;
  return sendMail({
    to: user.email,
    subject: `Welcome to ${site.name}`,
    text: `Hi ${user.name},\n\nAn account has been created for you on the ${site.name} dashboard.\nUsername: ${user.username}\nSign in: ${url}\n\nYour administrator will share your password separately.`,
    html: wrap(`Welcome, ${user.name}`, `<p>An account has been created for you on the ${esc(site.name)} dashboard.</p><p><strong>Username:</strong> ${esc(user.username)}</p><p><a href="${url}">Sign in</a></p><p>Your administrator will share your password separately.</p>`),
  });
}

/** New live chat started: alert the team */
export async function notifyChatStarted(chat: Chat) {
  const where = [chat.city, chat.country].filter(Boolean).join(", ") || "unknown location";
  return sendMail({
    to: leadRecipients(),
    subject: `New live chat from ${chat.name || chat.phone}`,
    text: `A visitor started a chat.\nName: ${chat.name || "-"}\nPhone: ${chat.phone}\nFrom: ${where}\nPage: ${chat.page || "-"}\n\nReply in the dashboard: ${site.url}/admin/chat`,
    html: wrap("New live chat", `<p><strong>Name:</strong> ${esc(chat.name || "-")}<br/><strong>Phone:</strong> ${esc(chat.phone)}<br/><strong>From:</strong> ${esc(where)}<br/><strong>Page:</strong> ${esc(chat.page || "-")}</p><p><a href="${site.url}/admin/chat">Open the chat inbox</a></p>`),
  });
}

/** Chat finished: transcript to the team (and a copy for the record) */
export async function notifyChatTranscript(chat: Chat) {
  const lines = chat.messages.map((m) => `[${new Date(m.at).toLocaleString("en-GB")}] ${m.from === "visitor" ? chat.name || "Visitor" : m.from === "staff" ? m.name || "Agent" : "System"}: ${m.text}`);
  return sendMail({
    to: leadRecipients(),
    subject: `Chat transcript: ${chat.name || chat.phone}`,
    text: `Chat with ${chat.name || "-"} (${chat.phone})\n\n${lines.join("\n")}`,
    html: wrap("Chat transcript", `<p><strong>${esc(chat.name || "-")}</strong> · ${esc(chat.phone)}</p><pre style="white-space:pre-wrap;font-family:inherit">${esc(lines.join("\n"))}</pre>`),
  });
}

/** New ticket (contact form): alert the team and acknowledge the customer */
export async function notifyTicketCreated(t: Ticket) {
  await sendMail({
    to: leadRecipients(),
    replyTo: t.email,
    subject: `New ticket #${t.number}: ${t.subject}`,
    text: `From: ${t.name} <${t.email}>${t.phone ? `\nPhone: ${t.phone}` : ""}\n\n${t.message}\n\nReply in the dashboard: ${site.url}/admin/tickets/${t.id}`,
    html: wrap(`New ticket #${t.number}`, `<p><strong>${esc(t.name)}</strong> &lt;${esc(t.email)}&gt;${t.phone ? ` · ${esc(t.phone)}` : ""}</p><p><strong>${esc(t.subject)}</strong></p><p style="white-space:pre-wrap">${esc(t.message)}</p><p><a href="${site.url}/admin/tickets/${t.id}">Open the ticket</a></p>`),
  });
  return sendMail({
    to: t.email,
    subject: `We received your message (#${t.number})`,
    text: `Hi ${t.name},\n\nThank you for contacting ${site.name}. We have received your message and will reply shortly.\n\nTicket #${t.number}: ${t.subject}`,
    html: wrap("We received your message", `<p>Hi ${esc(t.name)},</p><p>Thank you for contacting ${esc(site.name)}. We have received your message and will reply shortly.</p><p>Ticket #${t.number}: ${esc(t.subject)}</p>`),
  });
}

/** Staff replied to a ticket: email the customer */
export async function notifyTicketReply(t: Ticket, reply: TicketReply) {
  return sendMail({
    to: t.email,
    subject: `Re: ${t.subject} (#${t.number})`,
    text: `${reply.body}\n\n- ${reply.staffName || site.name}`,
    html: wrap(`Re: ${t.subject}`, `<p style="white-space:pre-wrap">${esc(reply.body)}</p><p>- ${esc(reply.staffName || site.name)}</p>`),
  });
}
