"use server";

import { redirect } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { mutate, now } from "@/lib/store";
import { refreshSite } from "@/lib/revalidate";

/** Publish / hide one service x country page. */
export async function setLandingStatus(id: string, status: "draft" | "published") {
  await requirePerm("content.publish");
  await mutate("landings", (all) => all.map((l) => (l.id === id ? { ...l, status, updatedAt: now() } : l)));
  refreshSite();
  redirect("/admin/landings");
}

/** Publish every draft at once (use after you have reviewed them). */
export async function publishAllLandings() {
  await requirePerm("content.publish");
  await mutate("landings", (all) => all.map((l) => (l.status === "draft" ? { ...l, status: "published" as const, updatedAt: now() } : l)));
  refreshSite();
  redirect("/admin/landings");
}

export async function deleteLanding(id: string) {
  await requirePerm("content.delete");
  await mutate("landings", (all) => all.filter((l) => l.id !== id));
  refreshSite();
  redirect("/admin/landings");
}
