"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, inputCls } from "../../ui";
import { saveProfile } from "../users-actions";
import { Field, TextField } from "./fields";

export default function ProfileForm({ initial }: { initial: { name: string; email: string; username: string; role: string } }) {
  const router = useRouter();
  const [f, setF] = useState({ name: initial.name, email: initial.email, currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (p: Partial<typeof f>) => { setF((x) => ({ ...x, ...p })); setMsg(null); };
  const save = () => start(async () => {
    const r = await saveProfile(JSON.stringify(f));
    setErrors(r.errors ?? {});
    setMsg({ ok: r.ok, text: r.message ?? "" });
    if (r.ok) { setF((x) => ({ ...x, currentPassword: "", newPassword: "" })); router.refresh(); }
  });
  return (
    <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] max-w-2xl">
      <h2 className="px-3 py-2.5 font-semibold text-[14px] border-b border-a-line">Your account</h2>
      <div className="p-4 space-y-4">
        <p className="text-[13px] text-a-muted">Signed in as <strong>{initial.username}</strong> · {initial.role}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" htmlFor="p-name" error={errors.name}><TextField id="p-name" value={f.name} onChange={(v) => set({ name: v })} /></Field>
          <Field label="Email" htmlFor="p-email" error={errors.email}><TextField id="p-email" type="email" value={f.email} onChange={(v) => set({ email: v })} /></Field>
          <Field label="Current password" htmlFor="p-cur" error={errors.currentPassword} hint="Only needed to change your password."><input id="p-cur" type="password" autoComplete="current-password" value={f.currentPassword} onChange={(e) => set({ currentPassword: e.target.value })} className={inputCls} /></Field>
          <Field label="New password" htmlFor="p-new" error={errors.newPassword} hint="At least 10 characters, letters and numbers."><input id="p-new" type="password" autoComplete="new-password" value={f.newPassword} onChange={(e) => set({ newPassword: e.target.value })} className={inputCls} /></Field>
        </div>
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-[13px] px-2.5 py-1.5 border-l-4 ${msg.ok ? "border-brand text-brand" : "border-a-red text-a-red"}`}>{msg.text}</p>}
        <button type="button" onClick={save} disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Update profile"}</button>
      </div>
    </section>
  );
}
