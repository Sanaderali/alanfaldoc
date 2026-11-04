import "server-only";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CONTENT_DIR, mutate, readAll, now } from "@/lib/store";
import { hashPassword, verifyPassword } from "@/lib/password";
import { can, type Permission } from "@/lib/rbac";
import type { User } from "@/types/content";

/**
 * Staff authentication with roles.
 * - Accounts live in content/users.json (passwords are scrypt hashes).
 * - First run: if there are no users yet and ADMIN_PASSWORD (+ optional ADMIN_USER) is set, logging in with them creates the
 *   first Super Admin. After that, manage everyone from Dashboard -> Users.
 * - Session cookie = userId.expiry.signature (HMAC). The user is re-loaded on every request, so deactivating or changing the
 *   role of a person takes effect immediately.
 * Secret for signing: ADMIN_SECRET if set, otherwise a random secret generated once in content/.secret.
 */

const COOKIE = "aa_admin";
const TTL_SECONDS = 60 * 60 * 8; // 8 hours

let secretCache: string | null = null;
async function getSecret(): Promise<string> {
  if (secretCache) return secretCache;
  if (process.env.ADMIN_SECRET) return (secretCache = process.env.ADMIN_SECRET);
  const file = path.join(CONTENT_DIR, ".secret");
  try {
    secretCache = (await fs.readFile(file, "utf8")).trim();
  } catch {
    secretCache = randomBytes(32).toString("hex");
    try {
      await fs.mkdir(CONTENT_DIR, { recursive: true });
      await fs.writeFile(file, secretCache, { mode: 0o600 });
    } catch {
      /* read-only disk: secret lives in memory (sessions reset on restart) */
    }
  }
  return secretCache!;
}
const sign = async (v: string) => createHmac("sha256", await getSecret()).update(v).digest("hex");
function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const envPasswordOk = () => !!process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8;

/** can anyone log in at all? (accounts exist, or the env bootstrap password is set) */
export async function loginAvailable(): Promise<boolean> {
  return (await readAll("users")).length > 0 || envPasswordOk();
}

const DUMMY_HASH = "scrypt$00000000000000000000000000000000$" + "00".repeat(64);

export async function authenticate(identifier: string, password: string): Promise<User | null> {
  const id = identifier.trim().toLowerCase();
  const users = await readAll("users");

  // first-run bootstrap from the environment
  if (users.length === 0 && envPasswordOk()) {
    const envUser = (process.env.ADMIN_USER ?? "admin").toLowerCase();
    const a = createHmac("sha256", "cred").update(password).digest("hex");
    const b = createHmac("sha256", "cred").update(process.env.ADMIN_PASSWORD as string).digest("hex");
    if (id !== envUser || !safeEqual(a, b)) return null;
    const stamp = now();
    const user: User = { id: randomUUID(), name: "Super Admin", username: envUser, email: "", passwordHash: await hashPassword(password), role: "super_admin", active: true, createdAt: stamp, updatedAt: stamp, lastLoginAt: stamp };
    await mutate("users", () => [user]);
    return user;
  }

  const user = users.find((u) => u.username.toLowerCase() === id || (u.email && u.email.toLowerCase() === id));
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH); // constant work even for unknown users
  if (!user || !ok || !user.active) return null;
  await mutate("users", (all) => all.map((u) => (u.id === user.id ? { ...u, lastLoginAt: now() } : u)));
  return user;
}

export async function startSession(userId: string) {
  const exp = String(Date.now() + TTL_SECONDS * 1000);
  const body = `${userId}.${exp}`;
  (await cookies()).set(COOKIE, `${body}.${await sign(body)}`, {
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

/** The logged-in, active staff member (or null). Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return null;
  const [userId, exp, sig] = v.split(".");
  if (!userId || !exp || !sig || Number(exp) < Date.now()) return null;
  if (!safeEqual(sig, await sign(`${userId}.${exp}`))) return null;
  const user = (await readAll("users")).find((u) => u.id === userId);
  return user && user.active ? user : null;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Call at the top of every admin page and server action. */
export async function requirePerm(perm: Permission): Promise<User> {
  const user = await requireUser();
  if (!can(user, perm)) redirect("/admin/forbidden");
  return user;
}

/** For route handlers: 401 if not logged in, 403 for cross-site requests or missing permission. */
export async function assertAdminRequest(req: Request, perm?: Permission): Promise<{ user: User } | { error: Response }> {
  const user = await getCurrentUser();
  if (!user) return { error: new Response("Unauthorized", { status: 401 }) };
  const origin = req.headers.get("origin");
  const host = (await headers()).get("host");
  if (origin && host && new URL(origin).host !== host) return { error: new Response("Forbidden", { status: 403 }) };
  if (perm && !can(user, perm)) return { error: new Response("Forbidden", { status: 403 }) };
  return { user };
}

/* ---- tiny in-memory throttles ---- */
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
