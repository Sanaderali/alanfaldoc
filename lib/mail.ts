import "server-only";

/**
 * Email dispatch (placeholder). EVERYTHING is wired in code (welcome emails, lead alerts, chat transcripts,
 * ticket replies, see lib/notify.ts) but NO mail provider is configured yet, so nothing is actually sent
 * until you connect one. Until then every send is skipped safely and logged to the server console.
 *
 * Connect later, pick ONE:
 *
 *  A) HTTP mail API (Resend, Postmark, SendGrid, Brevo, Mailgun...). Set in .env:
 *       MAIL_API_URL=https://api.your-provider.com/send
 *       MAIL_API_KEY=your-key
 *       MAIL_FROM="Al Anfal Doc <no-reply@yourdomain.com>"
 *     and adjust `apiPayload()` below if your provider expects a different JSON shape.
 *
 *  B) SMTP via nodemailer:  npm i nodemailer, then uncomment the SMTP block in sendMail() and set
 *       SMTP_HOST=  SMTP_PORT=587  SMTP_USER=  SMTP_PASS=  MAIL_FROM=
 *
 * Who gets lead alerts:  LEAD_ALERT_EMAIL=sales@yourdomain.com,support@yourdomain.com
 */

export type MailMessage = { to: string | string[]; subject: string; text: string; html?: string; replyTo?: string };
export type MailResult = { sent: boolean; skipped?: string; error?: string };

export const mailFrom = () => process.env.MAIL_FROM ?? "";
export const leadRecipients = () => (process.env.LEAD_ALERT_EMAIL ?? "").split(",").map((s) => s.trim()).filter(Boolean);
export const mailConfigured = () => !!process.env.MAIL_API_URL; // add `|| !!process.env.SMTP_HOST` once the SMTP block below is enabled

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

    /* ---------- Option B: SMTP (nodemailer) ----------
     * npm i nodemailer   then uncomment:
     *
     * if (process.env.SMTP_HOST) {
     *   const nodemailer = await import("nodemailer");
     *   const transporter = nodemailer.createTransport({
     *     host: process.env.SMTP_HOST,
     *     port: Number(process.env.SMTP_PORT ?? 587),
     *     secure: Number(process.env.SMTP_PORT) === 465,
     *     auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
     *   });
     *   await transporter.sendMail({ from: mailFrom(), to, subject: m.subject, text: m.text, html: m.html, replyTo: m.replyTo });
     *   return { sent: true };
     * }
     */

    console.info(`[mail] not configured, skipped: "${m.subject}" -> ${to.join(", ")}`);
    return { sent: false, skipped: "mail provider not configured" };
  } catch (e) {
    console.error("[mail] failed:", (e as Error).message);
    return { sent: false, error: (e as Error).message };
  }
}
