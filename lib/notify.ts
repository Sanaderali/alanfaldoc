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

/* ---------- branded email layout (table based + inline CSS so it renders in Gmail, Outlook and phones) ---------- */
const C = { brand: "#0A5C36", brandDark: "#07452a", tint: "#EAF4EE", accent: "#D32F2F", ink: "#1A1A1A", muted: "#6b7280", line: "#E5E7EB", canvas: "#F8F9FA" };
const FONT = "font-family:'Segoe UI',Helvetica,Arial,sans-serif;";
const tel = () => site.phone.replace(/\s/g, "");

/** a bulletproof button (works in Outlook too) */
const button = (href: string, label: string, solid = true) =>
  `<a href="${href}" style="${FONT}display:inline-block;padding:13px 26px;border-radius:8px;font-size:15px;font-weight:600;white-space:nowrap;text-decoration:none;${solid ? `background:${C.brand};color:#ffffff;border:1px solid ${C.brand};` : `background:#ffffff;color:${C.brand};border:1px solid ${C.brand};`}">${esc(label)}</a>`;

/** the shared frame for every email: logo header, content card, contact footer */
const wrap = (title: string, body: string, preheader = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.canvas};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader || title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.canvas};"><tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${C.line};">
    <tr><td style="height:6px;line-height:6px;font-size:0;background:${C.brand};">&nbsp;</td></tr>
    <tr><td align="center" style="padding:28px 24px 8px;"><a href="${site.url}" style="text-decoration:none;"><img src="${site.url}/email-logo.png" width="210" alt="${esc(site.name)}" style="display:block;border:0;outline:none;max-width:210px;height:auto;"/></a></td></tr>
    <tr><td style="padding:8px 36px 4px;${FONT}color:${C.ink};">
      <h1 style="margin:18px 0 6px;font-size:24px;line-height:1.3;color:${C.brand};font-weight:700;">${esc(title)}</h1>
      <div style="width:48px;height:3px;background:${C.accent};border-radius:2px;margin:10px 0 18px;"></div>
      <div style="font-size:15px;line-height:1.65;color:#374151;">${body}</div>
    </td></tr>
    <tr><td style="padding:28px 36px 0;"><div style="border-top:1px solid ${C.line};"></div></td></tr>
    <tr><td align="center" style="padding:20px 36px 8px;${FONT}font-size:13px;line-height:1.7;color:${C.muted};">
      <strong style="color:${C.ink};font-size:14px;">${esc(site.name)}</strong><br/>
      ${esc(site.tagline)}<br/>
      <a href="tel:${tel()}" style="color:${C.brand};text-decoration:none;">${esc(site.phone)}</a> &nbsp;·&nbsp; <a href="mailto:${site.email}" style="color:${C.brand};text-decoration:none;">${esc(site.email)}</a><br/>
      ${esc(site.address)} &nbsp;·&nbsp; <a href="${site.url}" style="color:${C.brand};text-decoration:none;">${esc(site.url.replace(/^https?:\/\//, ""))}</a>
    </td></tr>
    <tr><td align="center" style="padding:4px 36px 26px;${FONT}font-size:12px;line-height:1.6;color:#9ca3af;">${esc(site.hours.join("  ·  "))}</td></tr>
    <tr><td style="height:6px;line-height:6px;font-size:0;background:${C.brand};">&nbsp;</td></tr>
  </table>
  <p style="${FONT}font-size:11px;color:#9ca3af;margin:14px 0 0;">You received this email because a request was made on ${esc(site.url.replace(/^https?:\/\//, ""))}.</p>
</td></tr></table></body></html>`;

/** small label/value summary card */
const infoCard = (rows: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.tint};border-radius:10px;margin:20px 0;"><tr><td style="padding:16px 20px;${FONT}font-size:14px;line-height:1.8;color:${C.ink};">${rows.map(([k, v]) => `<span style="color:${C.muted};">${esc(k)}</span><br/><strong style="font-size:15px;">${esc(v)}</strong>`).join('<div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>')}</td></tr></table>`;

/** "what happens next" numbered steps */
const steps = (items: string[]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;">${items.map((t, i) => `<tr><td width="38" valign="top" style="padding:7px 0;"><div style="width:28px;height:28px;border-radius:14px;background:${C.brand};color:#fff;text-align:center;line-height:28px;${FONT}font-size:13px;font-weight:700;">${i + 1}</div></td><td valign="top" style="padding:8px 0;${FONT}font-size:14.5px;line-height:1.5;color:#374151;">${esc(t)}</td></tr>`).join("")}</table>`;

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
  const first = t.name.trim().split(/\s+/)[0];
  return sendMail({
    to: t.email,
    subject: `Thank you for contacting ${site.name} (#${t.number})`,
    text: `Hi ${first},\n\nThank you for contacting ${site.name} about ${t.subject}. We have received your request and our team will get back to you as soon as possible.\n\nYour reference: Ticket #${t.number}\nService: ${t.subject}\n\nWhat happens next:\n1. Our team reviews your request.\n2. An advisor contacts you by email or phone.\n3. We guide you through the next steps.\n\nIf your matter is urgent, call us on ${site.phone}.\n\nKind regards,\nThe ${site.name} team\n${site.address}`,
    html: wrap(
      `Thank you, ${first}!`,
      `<p style="margin:0 0 14px;">We have received your request about <strong>${esc(t.subject)}</strong>. <strong>Our team will get back to you as soon as possible.</strong></p>` +
        infoCard([["Your reference", `Ticket #${t.number}`], ["Service", t.subject], ["Submitted", new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dubai" })]]) +
        `<p style="margin:18px 0 6px;font-weight:700;color:${C.ink};">What happens next</p>` +
        steps(["Our team reviews your request.", "An advisor contacts you by email or phone.", "We guide you through the documents and next steps."]) +
        `<p style="margin:20px 0 14px;">If your matter is urgent, you can reach us directly:</p>` +
        `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding:0 10px 10px 0;">${button(`tel:${tel()}`, "Call us now")}</td><td style="padding:0 0 10px 0;">${button(site.url, "Visit website", false)}</td></tr></table>` +
        `<p style="margin:14px 0 0;">Kind regards,<br/><strong>The ${esc(site.name)} team</strong></p>`,
      `We received your request about ${t.subject}. Our team will get back to you as soon as possible.`
    ),
  });
}

/** Staff replied to a ticket: email the customer */
export async function notifyTicketReply(t: Ticket, reply: TicketReply) {
  return sendMail({
    to: t.email,
    replyTo: process.env.REPLY_TO_EMAIL || undefined,
    subject: `Re: ${t.subject} (#${t.number})`,
    text: `${reply.body}\n\n- ${reply.staffName || site.name}`,
    html: wrap(`Re: ${t.subject}`, `<p style="white-space:pre-wrap">${esc(reply.body)}</p><p>- ${esc(reply.staffName || site.name)}</p>`),
  });
}
