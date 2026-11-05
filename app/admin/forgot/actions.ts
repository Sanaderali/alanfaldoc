"use server";

import { clientIp } from "@/lib/auth";
import { requestCode, resetPassword, verifyCode, type VerifyResult } from "@/lib/otp";

export async function sendCode(identifier: string): Promise<{ ok: true }> {
  await requestCode(String(identifier ?? "").slice(0, 160), await clientIp());
  return { ok: true }; // same answer whether or not the account exists
}

export async function checkCode(identifier: string, code: string): Promise<VerifyResult> {
  return verifyCode(String(identifier ?? "").slice(0, 160), String(code ?? "").slice(0, 12), await clientIp());
}

export async function setNewPassword(identifier: string, token: string, password: string) {
  return resetPassword(String(identifier ?? "").slice(0, 160), String(token ?? "").slice(0, 100), String(password ?? "").slice(0, 200));
}
