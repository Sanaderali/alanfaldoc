"use server";

import { randomUUID } from "node:crypto";
import { requirePerm } from "@/lib/auth";
import { mutate, readAll, now } from "@/lib/store";
import { refreshSite } from "@/lib/revalidate";
import { ROLES } from "@/lib/rbac";
import { str } from "@/lib/validate";
import type { Role, WhatsAppNumber } from "@/types/content";

export type WaResult = { ok: boolean; message?: string };

export async function saveWhatsApp(payload: string): Promise<WaResult> {
  await requirePerm("settings.manage");
  let raw: unknown;
  try { raw = JSON.parse(payload); } catch { return { ok: false, message: "Invalid data" }; }
  if (!Array.isArray(raw)) return { ok: false, message: "Invalid data" };
  const prev = await readAll("whatsapp");
  const items: WhatsAppNumber[] = [];
  for (const [i, r] of (raw as Record<string, unknown>[]).slice(0, 20).entries()) {
    const label = str(r.label, 60);
    const digits = String(r.number ?? "").replace(/\D/g, "").replace(/^00/, "");
    if (!label) return { ok: false, message: `Number ${i + 1}: enter a name shown to visitors` };
    if (!/^\d{7,15}$/.test(digits)) return { ok: false, message: `"${label}": enter a valid number with country code, e.g. +971 50 805 1192` };
    const role = ROLES.includes(r.role as Role) ? (r.role as Role) : undefined;
    const message = str(r.message, 200) || undefined;
    items.push({ id: prev.find((p) => p.id === r.id)?.id ?? (typeof r.id === "string" && r.id ? r.id : randomUUID()), label, number: digits, ...(role ? { role } : {}), ...(message ? { message } : {}), active: r.active !== false });
  }
  await mutate("whatsapp", () => items);
  void now;
  refreshSite();
  return { ok: true };
}
