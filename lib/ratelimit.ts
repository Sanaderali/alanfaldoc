import "server-only";

/**
 * Tiny in-memory sliding-window limiter for the public endpoints (chat, contact form).
 * Per server process, which is plenty to stop casual abuse. Returns true when the call is allowed.
 */
const hits = new Map<string, number[]>();

export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  // keep memory bounded
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}
