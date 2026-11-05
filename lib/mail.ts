import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { CONTENT_DIR } from "@/lib/store";

/**
 * Email dispatch. Every automatic email (welcome, lead alerts, thank-you to customers, ticket replies, chat transcripts,
 * see lib/notify.ts) goes through sendMail(). Nothing is sent until ONE provider is configured in the environment:
 *
 *  SMTP (cPanel / Namecheap mailbox):
 *    SMTP_HOST=alanfaldoc.com   SMTP_PORT=465   SMTP_USER=info@alanfaldoc.com   SMTP_PASS=...
 *    MAIL_FROM="Al Anfal Doc <info@alanfaldoc.com>"   LEAD_ALERT_EMAIL=info@alanfaldoc.com
 *    (port 465 = SSL/TLS. For port 587 STARTTLS is used automatically.)
 *
 *  or an HTTP mail API (Resend, Postmark, SendGrid...): MAIL_API_URL, MAIL_API_KEY, MAIL_FROM.
 *
 * Never commit passwords: they belong in the server's environment variables only.
 */

export type MailMessage = { to: string | string[]; subject: string; text: string; html?: string; replyTo?: string };
export type MailResult = { sent: boolean; skipped?: string; error?: string };

/**
 * Sender. MAIL_FROM may be "Name <a@b.com>", a bare address, or just a display name (hosting forms often strip the <...> part):
 * in that last case the SMTP user is used as the address.
 */
export const mailFrom = () => {
  const v = (process.env.MAIL_FROM ?? "").trim();
  const user = (process.env.SMTP_USER ?? "").trim();
  if (!v) return user;
  if (v.includes("@")) return v;
  return user ? `"${v.replace(/"/g, "")}" <${user}>` : v;
};
export const leadRecipients = () => (process.env.LEAD_ALERT_EMAIL ?? "").split(",").map((s) => s.trim()).filter(Boolean);
export const mailConfigured = () => !!process.env.SMTP_HOST || !!process.env.MAIL_API_URL;
export const mailMode = () => (process.env.SMTP_HOST ? "SMTP" : process.env.MAIL_API_URL ? "HTTP API" : "not configured");

/** JSON body for the HTTP mail API. Adjust field names to your provider. */
function apiPayload(m: MailMessage) {
  return { from: mailFrom(), to: Array.isArray(m.to) ? m.to : [m.to], subject: m.subject, text: m.text, html: m.html, reply_to: m.replyTo };
}

/** the last 50 send attempts (success or failure) so problems are visible in Dashboard -> Team -> Email */
export type MailLogEntry = { at: string; to: string; subject: string; ok: boolean; error?: string };
const LOG = () => path.join(CONTENT_DIR, "mail-log.json");
export async function readMailLog(): Promise<MailLogEntry[]> {
  try { return JSON.parse(await fs.readFile(LOG(), "utf8")); } catch { return []; }
}
let logChain: Promise<unknown> = Promise.resolve();
function logMail(e: MailLogEntry) {
  logChain = logChain.then(async () => {
    try {
      const all = await readMailLog();
      await fs.mkdir(CONTENT_DIR, { recursive: true });
      await fs.writeFile(LOG(), JSON.stringify([e, ...all].slice(0, 50)));
    } catch { /* logging must never break sending */ }
  });
}

export async function sendMail(m: MailMessage): Promise<MailResult> {
  const r = await dispatch(m);
  const to = (Array.isArray(m.to) ? m.to.join(", ") : m.to) || "-";
  if (r.sent || r.error || r.skipped) logMail({ at: new Date().toISOString(), to, subject: m.subject, ok: r.sent, error: r.error ?? (r.skipped ? `Not sent: ${r.skipped}` : undefined) });
  return r;
}

async function dispatch(m: MailMessage): Promise<MailResult> {
  const to = Array.isArray(m.to) ? m.to.filter(Boolean) : m.to ? [m.to] : [];
  if (to.length === 0) {
    console.info(`[mail] skipped, no recipient (set LEAD_ALERT_EMAIL): "${m.subject}"`);
    return { sent: false, skipped: "no recipient" };
  }

  try {
    /* ---------- Option A: HTTP mail API ---------- */
    if (process.env.MAIL_API_URL) {
      const res = await fetch(process.env.MAIL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(process.env.MAIL_API_KEY ? { Authorization: `Bearer ${process.env.MAIL_API_KEY}` } : {}) },
        body: JSON.stringify(apiPayload({ ...m, to })),
      });
      if (!res.ok) throw new Error(`mail API responded ${res.status}`);
      return { sent: true };
    }

    /* ---------- Option B: SMTP ---------- */
    if (process.env.SMTP_HOST) {
      const nodemailer = await import("nodemailer");
      const port = Number(process.env.SMTP_PORT ?? 465);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        connectionTimeout: 12_000,
        greetingTimeout: 12_000,
        socketTimeout: 25_000,
      });
      await transporter.sendMail({ from: mailFrom() || process.env.SMTP_USER, to, subject: m.subject, text: m.text, html: m.html, replyTo: m.replyTo });
      return { sent: true };
    }

    console.info(`[mail] not configured, skipped: "${m.subject}" -> ${to.join(", ")}`);
    return { sent: false, skipped: "mail provider not configured" };
  } catch (e) {
    console.error("[mail] failed:", (e as Error).message);
    return { sent: false, error: (e as Error).message };
  }
}
