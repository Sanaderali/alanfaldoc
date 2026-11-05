import "server-only";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { allow } from "@/lib/ratelimit";
import { hashPassword, passwordProblem } from "@/lib/password";
import { leadRecipients } from "@/lib/mail";
import { notifyOtp } from "@/lib/notify";
import { mutate, readAll } from "@/lib/store";
import type { User } from "@/types/content";

/**
 * Dashboard sign-in recovery with a 6-digit code sent by email ("forgot username or password").
 * - The code is valid for 10 minutes, works once, and allows 5 wrong tries.
 * - At most 3 codes per person per hour (stored, so it survives app restarts) plus a per-IP limit.
 * - Answers never reveal whether an account exists.
 * - After a correct code the person gets a one-time reset token to choose a new password (and sees their username).
 */
const TTL = 10 * 60 * 1000;
const MAX_TRIES = 5;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const same = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

function findUser(users: User[], identifier: string) {
  const id = identifier.trim().toLowerCase();
  return id ? users.find((u) => u.active && (u.username.toLowerCase() === id || (u.email && u.email.toLowerCase() === id))) : undefined;
}
/** where the code goes: the person's own email; a Super Admin without one falls back to the owner's recovery / alert address */
function recoveryEmail(u: User): string | undefined {
  if (u.email) return u.email;
  if (u.role !== "super_admin") return undefined;
  return process.env.ADMIN_RECOVERY_EMAIL?.trim() || leadRecipients()[0] || undefined;
}

export async function requestCode(identifier: string, ip: string): Promise<void> {
  if (!allow(`otp-ip:${ip}`, 8, 60 * 60 * 1000)) return;
  const user = findUser(await readAll("users"), identifier);
  if (!user) return;
  const to = recoveryEmail(user);
  if (!to) return;
  const now = Date.now();
  const prev = (await readAll("otps")).find((o) => o.id === user.id);
  const recent = (prev?.requests ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= 3) return;
  const code = String(randomInt(100000, 1000000));
  const salt = randomBytes(8).toString("hex");
  const rec = { id: user.id, salt, codeHash: sha(salt + code), expiresAt: now + TTL, attempts: 0, requests: [...recent, now] };
  await mutate("otps", (all) => [...all.filter((o) => o.id !== user.id), rec]);
  if (process.env.NODE_ENV !== "production") console.info(`[otp] code for ${user.username}: ${code}`);
  await notifyOtp(to, user.name, code);
}

export type VerifyResult = { ok: true; token: string; username: string } | { ok: false; message: string };

export async function verifyCode(identifier: string, code: string, ip: string): Promise<VerifyResult> {
  const bad: VerifyResult = { ok: false, message: "That code is not correct or has expired. Request a new one." };
  if (!allow(`otp-verify-ip:${ip}`, 30, 60 * 60 * 1000)) return { ok: false, message: "Too many attempts. Try again later." };
  const clean = code.replace(/\D/g, "");
  const user = findUser(await readAll("users"), identifier);
  if (!user || clean.length !== 6) return bad;
  const rec = (await readAll("otps")).find((o) => o.id === user.id);
  if (!rec || rec.expiresAt < Date.now() || rec.attempts >= MAX_TRIES) return bad;
  const ok = same(sha(rec.salt + clean), rec.codeHash);
  if (!ok) {
    await mutate("otps", (all) => all.map((o) => (o.id === user.id ? { ...o, attempts: o.attempts + 1 } : o)));
    return bad;
  }
  const token = randomBytes(24).toString("hex");
  await mutate("otps", (all) => all.map((o) => (o.id === user.id ? { ...o, codeHash: "", expiresAt: 0, resetHash: sha(token), resetExpires: Date.now() + TTL } : o)));
  return { ok: true, token, username: user.username };
}

export async function resetPassword(identifier: string, token: string, password: string): Promise<{ ok: boolean; message?: string }> {
  const prob = passwordProblem(password);
  if (prob) return { ok: false, message: prob };
  const user = findUser(await readAll("users"), identifier);
  const rec = user ? (await readAll("otps")).find((o) => o.id === user.id) : undefined;
  if (!user || !rec?.resetHash || !rec.resetExpires || rec.resetExpires < Date.now() || !same(sha(token), rec.resetHash)) return { ok: false, message: "This reset link has expired. Start again." };
  const hash = await hashPassword(password);
  await mutate("users", (all) => all.map((u) => (u.id === user.id ? { ...u, passwordHash: hash, updatedAt: new Date().toISOString() } : u)));
  await mutate("otps", (all) => all.filter((o) => o.id !== user.id));
  return { ok: true };
}
