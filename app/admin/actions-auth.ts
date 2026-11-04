"use server";

import { redirect } from "next/navigation";
import { checkCredentials, clearFailures, clientIp, endSession, recordFailure, startSession, throttled } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await clientIp();
  if (throttled(ip)) return { error: "Too many attempts. Try again in 15 minutes." };
  const ok = checkCredentials(String(formData.get("user") ?? ""), String(formData.get("password") ?? ""));
  if (!ok) {
    recordFailure(ip);
    // Local development only: a password cut short by "#" or "$" in .env is the most common cause of a failed login
    const hint = process.env.NODE_ENV !== "production" ? ` (Dev hint: the server loaded a ${(process.env.ADMIN_PASSWORD ?? "").length}-character password. If that is shorter than yours, wrap the value in quotes in .env.local.)` : "";
    return { error: `Incorrect username or password.${hint}` };
  }
  clearFailures(ip);
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
