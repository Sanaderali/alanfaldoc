"use server";

import { randomUUID } from "node:crypto";
import { requirePerm, requireUser } from "@/lib/auth";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/password";
import { PERMISSIONS, ROLES } from "@/lib/rbac";
import { notifyWelcome } from "@/lib/notify";
import { mutate, now, readAll } from "@/lib/store";
import { str } from "@/lib/validate";
import type { Role, User } from "@/types/content";

export type UserResult = { ok: boolean; id?: string; message?: string; errors?: Record<string, string> };

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GRANTABLE = new Set<string>(PERMISSIONS.map((p) => p.key).filter((k) => k !== "users.manage"));

const activeSuperAdmins = (users: User[], exceptId?: string) => users.filter((u) => u.role === "super_admin" && u.active && u.id !== exceptId).length;

/** Super Admin only: create or update a team member. */
export async function saveUser(payload: string, id?: string): Promise<UserResult> {
  const me = await requirePerm("users.manage");
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }

  const errors: Record<string, string> = {};
  const name = str(raw.name, 80);
  const username = str(raw.username, 32).toLowerCase();
  const email = str(raw.email, 160).toLowerCase();
  const role = ROLES.includes(raw.role as Role) ? (raw.role as Role) : "content_editor";
  const active = raw.active !== false;
  const password = typeof raw.password === "string" ? raw.password : "";
  const extra = (Array.isArray(raw.extraPermissions) ? raw.extraPermissions : []).map(String).filter((p) => GRANTABLE.has(p));

  if (!name) errors.name = "Name is required";
  if (!USERNAME_RE.test(username)) errors.username = "3-32 characters: letters, numbers, dot, dash, underscore";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email";
  if (!id && !password) errors.password = "Set a password";
  if (password) { const prob = passwordProblem(password); if (prob) errors.password = prob; }

  const users = await readAll("users");
  if (users.some((u) => u.id !== id && u.username === username)) errors.username = "That username is taken";
  if (users.some((u) => u.id !== id && u.email.toLowerCase() === email)) errors.email = "That email is already used";

  const existing = id ? users.find((u) => u.id === id) : undefined;
  if (id && !existing) return { ok: false, message: "User not found" };
  // safety: never leave the system without an active Super Admin, never lock yourself out
  if (existing && existing.role === "super_admin" && (role !== "super_admin" || !active) && activeSuperAdmins(users, existing.id) === 0) errors.role = "There must always be at least one active Super Admin";
  if (existing && existing.id === me.id && !active) errors.active = "You cannot deactivate your own account";

  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields" };

  const stamp = now();
  const hash = password ? await hashPassword(password) : existing!.passwordHash;
  const user: User = { id: existing?.id ?? randomUUID(), name, username, email, passwordHash: hash, role, active, extraPermissions: extra.length ? extra : undefined, createdAt: existing?.createdAt ?? stamp, updatedAt: stamp, lastLoginAt: existing?.lastLoginAt };
  await mutate("users", (all) => (existing ? all.map((u) => (u.id === existing.id ? user : u)) : [...all, user]));
  if (!existing) void notifyWelcome(user); // welcome email (skipped until a mail provider is configured)
  return { ok: true, id: user.id, message: existing ? "User updated" : "User created" };
}

export async function setUserActive(id: string, active: boolean): Promise<UserResult> {
  const me = await requirePerm("users.manage");
  const users = await readAll("users");
  const u = users.find((x) => x.id === id);
  if (!u) return { ok: false, message: "User not found" };
  if (id === me.id && !active) return { ok: false, message: "You cannot deactivate your own account" };
  if (!active && u.role === "super_admin" && activeSuperAdmins(users, id) === 0) return { ok: false, message: "There must always be at least one active Super Admin" };
  await mutate("users", (all) => all.map((x) => (x.id === id ? { ...x, active, updatedAt: now() } : x)));
  return { ok: true };
}

/** Any signed-in member: update own name/email and (optionally) password. */
export async function saveProfile(payload: string): Promise<UserResult> {
  const me = await requireUser();
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  const errors: Record<string, string> = {};
  const name = str(raw.name, 80);
  const email = str(raw.email, 160).toLowerCase();
  const current = typeof raw.currentPassword === "string" ? raw.currentPassword : "";
  const next = typeof raw.newPassword === "string" ? raw.newPassword : "";
  if (!name) errors.name = "Name is required";
  if (email && !EMAIL_RE.test(email)) errors.email = "Enter a valid email";
  const users = await readAll("users");
  if (email && users.some((u) => u.id !== me.id && u.email.toLowerCase() === email)) errors.email = "That email is already used";
  let hash = me.passwordHash;
  if (next) {
    if (!(await verifyPassword(current, me.passwordHash))) errors.currentPassword = "Current password is incorrect";
    const prob = passwordProblem(next);
    if (prob) errors.newPassword = prob;
    else hash = await hashPassword(next);
  }
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields" };
  await mutate("users", (all) => all.map((u) => (u.id === me.id ? { ...u, name, email, passwordHash: hash, updatedAt: now() } : u)));
  return { ok: true, message: next ? "Profile and password updated" : "Profile updated" };
}
