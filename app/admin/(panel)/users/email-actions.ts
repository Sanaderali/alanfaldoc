"use server";

import { requirePerm } from "@/lib/auth";
import { mailConfigured, sendMail } from "@/lib/mail";
import { site } from "@/data/site";

export type TestResult = { ok: boolean; message: string };

/** Sends a short test message so the Super Admin can confirm the mail settings work. */
export async function sendTestEmail(to: string): Promise<TestResult> {
  await requirePerm("users.manage");
  const addr = to.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(addr)) return { ok: false, message: "Enter a valid email address" };
  if (!mailConfigured()) return { ok: false, message: "Email is not connected yet. Add the SMTP settings on the server and restart the app." };
  const r = await sendMail({ to: addr, subject: `Test email from ${site.name}`, text: `This is a test email from the ${site.name} dashboard. If you can read it, your email settings work.` });
  return r.sent ? { ok: true, message: `Test email sent to ${addr}. Check the inbox (and spam folder).` } : { ok: false, message: `Could not send: ${r.error ?? r.skipped ?? "unknown error"}` };
}
