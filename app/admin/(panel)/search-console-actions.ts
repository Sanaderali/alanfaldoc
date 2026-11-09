"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { cleanVerification } from "@/lib/settings";
import { refreshSite } from "@/lib/revalidate";
import { mutate, now } from "@/lib/store";

/** Save the Google / Bing site verification codes (paste the whole <meta> tag or just the code). */
export async function saveSearchSettings(formData: FormData) {
  await requirePerm("seo.manage");
  const google = cleanVerification(formData.get("google"));
  const bing = cleanVerification(formData.get("bing"));
  const bad = (formData.get("google") && !google) || (formData.get("bing") && !bing);
  if (bad) redirect("/admin/search-console?e=code");
  await mutate("settings", (all) => [{ ...(all[0] ?? { id: randomUUID(), createdAt: now() }), googleVerification: google || undefined, bingVerification: bing || undefined, updatedAt: now() }]);
  refreshSite();
  redirect("/admin/search-console?saved=1");
}
