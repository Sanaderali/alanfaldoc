import "server-only";
import { readAll } from "@/lib/store";

/**
 * Spam protection for the contact / request form (no CAPTCHA for real customers).
 * Layers: hidden trap field (in the route), "too fast" timer, link and keyword filters, throw-away email domains,
 * and limits per IP / email / identical message that are checked against the saved tickets, so they still work when the
 * hosting restarts the app (an in-memory counter would be reset).
 * "drop" = pretend it worked (bots learn nothing) but save nothing and send no email.
 */

export type Verdict = { action: "ok" } | { action: "drop"; why: string } | { action: "reject"; message: string; status: number };

const DISPOSABLE = new Set(["mailinator.com", "guerrillamail.com", "guerrillamail.net", "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org", "temp-mail.io", "yopmail.com", "trashmail.com", "throwawaymail.com", "getnada.com", "sharklasers.com", "maildrop.cc", "dispostable.com", "fakeinbox.com", "mintemail.com", "mohmal.com", "emailondeck.com", "tempail.com", "burnermail.io", "spamgourmet.com", "mailnesia.com"]);
const SPAM_WORDS = /\b(backlinks?|guest post|seo (services?|expert|packages?|audit)|rank (your )?(site|website)|first page of google|crypto|bitcoin|forex|casino|viagra|cialis|loan offer|payday|investment (opportunity|plan)|earn \$|make money online|buy followers|cheap followers|telegram:|whatsapp me|adult|porn|escort|web ?design (services?|company)|digital marketing (services?|agency))\b/i;

const HOUR = 3_600_000;

export async function checkSubmission(i: { ip: string; name: string; email: string; message: string; openedAt: unknown }): Promise<Verdict> {
  // 1. humans need a moment (even with autofill): bots post instantly (or without the timer at all)
  const opened = Number(i.openedAt);
  const age = Date.now() - opened;
  if (!Number.isFinite(opened) || opened <= 0 || age < 1200) return { action: "drop", why: "too fast / no timer" };
  if (age > 24 * HOUR) return { action: "reject", status: 400, message: "This page has been open for a long time. Please reload it and send again." };

  // 2. content
  const text = `${i.name} ${i.message}`;
  const links = (text.match(/https?:\/\/|www\./gi) ?? []).length;
  if (links > 2) return { action: "drop", why: "too many links" };
  if (/https?:\/\/|www\./i.test(i.name)) return { action: "drop", why: "link in name" };
  if (SPAM_WORDS.test(text)) return { action: "drop", why: "spam wording" };
  const domain = i.email.split("@")[1] ?? "";
  if (DISPOSABLE.has(domain)) return { action: "reject", status: 400, message: "Please use your real email address (temporary email services are not accepted)." };

  // 3. limits, from the saved tickets
  const now = Date.now();
  const tickets = (await readAll("tickets")).filter((t) => t.source === "contact");
  const since = (ms: number) => tickets.filter((t) => now - new Date(t.createdAt).getTime() < ms);
  const hour = since(HOUR), day = since(24 * HOUR);
  if (day.some((t) => t.message.trim().toLowerCase() === i.message.trim().toLowerCase())) return { action: "drop", why: "duplicate message" };
  if (hour.filter((t) => t.email === i.email).length >= 2) return { action: "reject", status: 429, message: "We have already received your requests. Our team will get back to you as soon as possible." };
  if (hour.filter((t) => t.ip === i.ip).length >= 3 || day.filter((t) => t.ip === i.ip).length >= 8) return { action: "reject", status: 429, message: "Too many messages from your connection. Please try again later or call us." };
  return { action: "ok" };
}
