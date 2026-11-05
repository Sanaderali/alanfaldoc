"use server";

import { randomUUID } from "node:crypto";
import { requirePerm } from "@/lib/auth";
import { mutate } from "@/lib/store";
import { refreshSite } from "@/lib/revalidate";
import { platformOf } from "@/lib/social";
import type { SocialLink } from "@/types/content";

export type SocialResult = { ok: boolean; message?: string };

export async function saveSocial(payload: string): Promise<SocialResult> {
  await requirePerm("settings.manage");
  let raw: unknown;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  if (!Array.isArray(raw)) return { ok: false, message: "Invalid data" };
  const items: SocialLink[] = [];
  const seen = new Set<string>();
  for (const [i, r] of (raw as Record<string, unknown>[]).slice(0, 20).entries()) {
    const platform = String(r.platform ?? "");
    const url = String(r.url ?? "").trim();
    if (!platformOf(platform)) return { ok: false, message: `Link ${i + 1}: choose a platform` };
    if (!/^https:\/\/[^\s]+\.[^\s]+$/.test(url)) return { ok: false, message: `${platformOf(platform)!.label}: enter the full profile link starting with https://` };
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({ id: typeof r.id === "string" && r.id ? r.id : randomUUID(), platform, url: url.slice(0, 300), active: r.active !== false });
  }
  await mutate("social", () => items);
  refreshSite();
  return { ok: true };
}
