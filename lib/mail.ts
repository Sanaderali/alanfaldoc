import "server-only";

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

export const mailFrom = () => process.env.MAIL_FROM ?? "";
export const leadRecipients = () => (process.env.LEAD_ALERT_EMAIL ?? "").split(",").map((s) => s.trim()).filter(Boolean);
export const mailConfigured = () => !!process.env.SMTP_HOST || !!process.env.MAIL_API_URL;
export const mailMode = () => (process.env.SMTP_HOST ? "SMTP" : process.env.MAIL_API_URL ? "HTTP API" : "not configured");

/** JSON body for the HTTP mail API. Adjust field names to your provider. */
function apiPayload(m: MailMessage) {
  return { from: mailFrom(), to: Array.isArray(m.to) ? m.to : [m.to], subject: m.subject, text: m.text, html: m.html, reply_to: m.replyTo };
}

export async function sendMail(m: MailMessage): Promise<MailResult> {
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
