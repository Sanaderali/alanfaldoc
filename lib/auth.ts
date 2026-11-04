import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Single-admin authentication (no database needed).
 *   ADMIN_USER      login name (default "admin")
 *   ADMIN_PASSWORD  REQUIRED. The dashboard stays disabled until it is set
 *   ADMIN_SECRET    optional extra secret for signing sessions (recommended)
 * Session = HttpOnly + SameSite=Lax cookie holding an expiry and an HMAC signature.
 */

const COOKIE = "aa_admin";
const TTL_SECONDS = 60 * 60 * 8; // 8 hours

export const adminEnabled = () => !!process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8;
const secret = () => `${process.env.ADMIN_SECRET ?? ""}|${process.env.ADMIN_PASSWORD ?? ""}`;
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkCredentials(user: string, password: string) {
  if (!adminEnabled()) return false;
  // compare hashes so length differences do not leak timing
  const h = (s: string) => createHmac("sha256", "cred").update(s).digest("hex");
  const okUser = safeEqual(h(user), h(process.env.ADMIN_USER ?? "admin"));
  const okPass = safeEqual(h(password), h(process.env.ADMIN_PASSWORD as string));
  return okUser && okPass;
}

export async function startSession() {
  const exp = String(Date.now() + TTL_SECONDS * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  return !!exp && !!sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now();
}

/** Call at the top of EVERY admin page, server action and API route. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For route handlers: also rejects cross-site requests. */
export async function assertAdminRequest(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const origin = req.headers.get("origin");
  const host = (await headers()).get("host");
  if (origin && host && new URL(origin).host !== host) return new Response("Forbidden", { status: 403 });
  return null;
}

/* ---- tiny in-memory login throttle: 5 failures / 15 min per IP ---- */
const fails = new Map<string, { n: number; until: number }>();
export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
}
export function throttled(ip: string) {
  const f = fails.get(ip);
  return !!f && f.n >= 5 && f.until > Date.now();
}
export function recordFailure(ip: string) {
  const f = fails.get(ip);
  const n = !f || f.until < Date.now() ? 1 : f.n + 1;
  fails.set(ip, { n, until: Date.now() + 15 * 60 * 1000 });
}
export const clearFailures = (ip: string) => fails.delete(ip);
