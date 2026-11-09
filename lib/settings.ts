import "server-only";
import { readAll } from "@/lib/store";
import type { SiteSettings } from "@/types/content";

/** Search engine verification codes saved in the dashboard (read at render time, so no rebuild is needed). */
export async function getSiteSettings(): Promise<SiteSettings> {
  try { return (await readAll("settings"))[0] ?? {}; } catch { return {}; }
}

/** accepts the whole <meta> tag or just the code, returns the code (or "" if it does not look like one) */
export function cleanVerification(v: unknown): string {
  const raw = typeof v === "string" ? v.trim() : "";
  const m = raw.match(/content\s*=\s*["']([^"']+)["']/i);
  const code = (m ? m[1] : raw).trim();
  return /^[A-Za-z0-9_-]{16,128}$/.test(code) ? code : "";
}
