"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { btnPrimary, inputCls } from "../ui";
import { checkCode, sendCode, setNewPassword } from "./actions";

type Step = "ask" | "code" | "reset" | "done";

/** 1) email or username  ->  2) 6-digit code from the email  ->  3) username shown + choose a new password. */
export default function ForgotFlow() {
  const [step, setStep] = useState<Step>("ask");
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const ask = () => start(async () => { setErr(""); await sendCode(id); setStep("code"); });
  const verify = () => start(async () => {
    setErr("");
    const r = await checkCode(id, code);
    if (!r.ok) return setErr(r.message);
    setToken(r.token); setUsername(r.username); setStep("reset");
  });
  const reset = () => start(async () => {
    setErr("");
    const r = await setNewPassword(id, token, pw);
    if (!r.ok) return setErr(r.message ?? "Could not change the password");
    setStep("done");
  });

  const Err = () => (err ? <p role="alert" className="text-sm text-a-red">{err}</p> : null);
  return (
    <div className="space-y-4">
      {step === "ask" && (
        <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="space-y-4">
          <p className="text-sm text-a-muted">Enter the email address or username of your dashboard account. We will email you a 6-digit code.</p>
          <div><label htmlFor="fid" className="block text-sm font-medium mb-1">Email or username</label><input id="fid" required autoFocus autoComplete="username" value={id} onChange={(e) => setId(e.target.value)} className={inputCls} /></div>
          <button type="submit" disabled={pending || !id.trim()} className={`${btnPrimary} w-full`}>{pending ? "Sending…" : "Send my code"}</button>
        </form>
      )}
      {step === "code" && (
        <form onSubmit={(e) => { e.preventDefault(); verify(); }} className="space-y-4">
          <p className="text-sm text-a-muted">If an account matches, a 6-digit code is on its way to the email address. It expires in 10 minutes. Check your spam folder too.</p>
          <div><label htmlFor="fcode" className="block text-sm font-medium mb-1">6-digit code</label><input id="fcode" required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={`${inputCls} text-center text-2xl tracking-[0.5em] font-mono`} placeholder="••••••" /></div>
          <Err />
          <button type="submit" disabled={pending || code.length !== 6} className={`${btnPrimary} w-full`}>{pending ? "Checking…" : "Verify code"}</button>
          <button type="button" onClick={() => { setCode(""); setErr(""); setStep("ask"); }} className="w-full text-sm text-brand-text hover:underline">Send a new code</button>
        </form>
      )}
      {step === "reset" && (
        <form onSubmit={(e) => { e.preventDefault(); reset(); }} className="space-y-4">
          <p className="text-sm bg-brand/10 text-brand rounded-md px-3 py-2">Code verified. Your username is <strong>{username}</strong>.</p>
          <div><label htmlFor="fpw" className="block text-sm font-medium mb-1">New password</label><input id="fpw" type="password" required autoFocus autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} /><p className="text-xs text-a-muted mt-1">At least 10 characters, letters and numbers.</p></div>
          <Err />
          <button type="submit" disabled={pending || pw.length < 10} className={`${btnPrimary} w-full`}>{pending ? "Saving…" : "Set new password"}</button>
        </form>
      )}
      {step === "done" && (
        <div className="space-y-4 text-center">
          <p role="status" className="text-sm bg-brand/10 text-brand rounded-md px-3 py-2">Your password was changed.</p>
          <Link href="/admin/login" className={`${btnPrimary} w-full`}>Go to sign in</Link>
        </div>
      )}
      {step !== "done" && <p className="text-center"><Link href="/admin/login" className="text-sm text-a-muted hover:text-a-text hover:underline">Back to sign in</Link></p>}
    </div>
  );
}
