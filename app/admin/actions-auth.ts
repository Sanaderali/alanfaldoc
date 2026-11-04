"use server";

import { redirect } from "next/navigation";
import { endSession } from "@/lib/auth";

/** Login itself is a plain form POST to /admin/api/login (see app/admin/api/login/route.ts). */
export async function logout() {
  await endSession();
  redirect("/admin/login");
}
