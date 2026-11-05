"use client";

import { useState, useTransition } from "react";
import { btnPrimary, inputCls } from "../../ui";
import { sendTestEmail } from "../users/email-actions";

export default function EmailTest({ defaultTo }: { defaultTo: string }) {
  const [to, setTo] = useState(defaultTo);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3 max-w-md">
      <label htmlFor="testto" className="text-sm font-medium">Send a test email to</label>
      <input id="testto" type="email" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} placeholder="you@example.com" />
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm rounded-md px-3 py-2 ${msg.ok ? "bg-brand/10 text-brand" : "bg-a-red/10 text-a-red"}`}>{msg.text}</p>}
      <button type="button" disabled={pending || !to} className={btnPrimary} onClick={() => start(async () => { const r = await sendTestEmail(to); setMsg({ ok: r.ok, text: r.message }); })}>{pending ? "Sending…" : "Send test email"}</button>
    </div>
  );
}
