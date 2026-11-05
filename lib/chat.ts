import "server-only";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { Chat, ChatMessage } from "@/types/content";

/** Shared helpers for the live chat (public APIs + dashboard APIs). */

export const MAX_MESSAGE = 1000;
export const MAX_MESSAGES_PER_CHAT = 500;

export const newToken = () => randomBytes(24).toString("hex");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
/** constant-time comparison of a visitor token against the stored hash */
export const tokenMatches = (token: string, hash: string) => { const a = Buffer.from(hashToken(token)), b = Buffer.from(hash); return a.length === b.length && timingSafeEqual(a, b); };
export const msg = (from: ChatMessage["from"], text: string, name?: string, staffId?: string): ChatMessage => ({ id: randomUUID(), from, text, name, ...(staffId ? { staffId } : {}), at: new Date().toISOString() });

export const cleanText = (v: unknown, max = MAX_MESSAGE) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max) : "");

/** a phone number: optional +, 7-15 digits, spaces/dashes/brackets allowed */
export function cleanPhone(v: unknown): string | null {
  const s = cleanText(v, 30);
  if (!/^\+?[0-9\s()-]+$/.test(s)) return null;
  const digits = s.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? s : null;
}

/** what the visitor is allowed to see of a chat */
export function publicView(c: Chat, since = 0) {
  return {
    id: c.id,
    status: c.status,
    total: c.messages.length,
    messages: c.messages.slice(since).map((m) => ({ id: m.id, from: m.from, name: m.from === "staff" || m.from === "ai" ? m.name : undefined, text: m.text, at: m.at })),
  };
}

export const summary = (c: Chat) => {
  const last = c.messages[c.messages.length - 1];
  return {
    id: c.id,
    name: c.name ?? "",
    phone: c.phone,
    status: c.status,
    unread: c.unreadStaff,
    lastAt: c.lastMessageAt,
    createdAt: c.createdAt,
    preview: last ? (last.text.length > 80 ? last.text.slice(0, 77) + "…" : last.text) : "",
    lastFrom: last?.from,
    country: c.country,
    city: c.city,
  };
};
