"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PERMISSIONS, ROLES, ROLE_DESCRIPTION, ROLE_LABEL, ROLE_PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@/types/content";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { saveUser } from "../users-actions";
import { Field, TextField, Toggle } from "./fields";

type Initial = { name: string; username: string; email: string; role: Role; active: boolean; extraPermissions: string[] };

/** Create / edit a team member (Super Admin only). */
export default function UserForm({ id, initial, isSelf }: { id?: string; initial?: Initial; isSelf?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<Initial & { password: string }>({ name: "", username: "", email: "", role: "content_editor", active: true, extraPermissions: [], password: "", ...(initial ?? {}) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (p: Partial<typeof f>) => { setF((x) => ({ ...x, ...p })); setMsg(null); };

  const rolePerms = new Set<string>(ROLE_PERMISSIONS[f.role]);
  const toggleExtra = (k: string) => set({ extraPermissions: f.extraPermissions.includes(k) ? f.extraPermissions.filter((x) => x !== k) : [...f.extraPermissions, k] });

  const save = () => start(async () => {
    const r = await saveUser(JSON.stringify(f), id);
    setErrors(r.errors ?? {});
    setMsg({ ok: r.ok, text: r.message ?? "" });
    if (r.ok) { setF((x) => ({ ...x, password: "" })); if (!id && r.id) router.replace(`/admin/users/${r.id}`); else router.refresh(); }
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
      <div className="space-y-5 min-w-0">
        <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <h2 className="px-3 py-2.5 font-semibold text-[14px] border-b border-a-line">Account</h2>
          <div className="p-4 grid sm:grid-cols-2 gap-4">
            <Field label="Full name" htmlFor="u-name" error={errors.name}><TextField id="u-name" value={f.name} onChange={(v) => set({ name: v })} /></Field>
            <Field label="Username" htmlFor="u-user" error={errors.username}><TextField id="u-user" value={f.username} onChange={(v) => set({ username: v.toLowerCase() })} /></Field>
            <Field label="Email" htmlFor="u-email" error={errors.email}><TextField id="u-email" type="email" value={f.email} onChange={(v) => set({ email: v })} /></Field>
            <Field label={id ? "Reset password" : "Password"} htmlFor="u-pass" error={errors.password} hint={id ? "Leave empty to keep the current password." : "At least 10 characters, letters and numbers. Share it securely."}>
              <input id="u-pass" type="password" autoComplete="new-password" value={f.password} onChange={(e) => set({ password: e.target.value })} className={inputCls} />
            </Field>
          </div>
        </section>

        <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <h2 className="px-3 py-2.5 font-semibold text-[14px] border-b border-a-line">Role & permissions</h2>
          <div className="p-4 space-y-4">
            <Field label="Role" htmlFor="u-role" error={errors.role} hint={ROLE_DESCRIPTION[f.role]}>
              <select id="u-role" value={f.role} onChange={(e) => set({ role: e.target.value as Role })} className={inputCls}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </Field>
            <div>
              <p className="text-[13px] font-semibold mb-2">Permissions</p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
                {PERMISSIONS.map((p) => {
                  const fromRole = rolePerms.has(p.key);
                  const grantable = p.key !== "users.manage";
                  return (
                    <li key={p.key}>
                      <label className={`flex items-center gap-2 ${fromRole ? "text-a-text" : "text-a-muted"}`}>
                        <input type="checkbox" checked={fromRole || f.extraPermissions.includes(p.key)} disabled={fromRole || !grantable} onChange={() => toggleExtra(p.key)} className="rounded-[3px] border-a-line2 text-brand focus:ring-brand" />
                        {p.label}{fromRole && <span className="text-[11px] text-a-subtle">(from role)</span>}
                        {!fromRole && f.extraPermissions.includes(p.key) && <span className="text-[11px] text-brand-text">(extra)</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-a-muted mt-2">Tick extra boxes to grant this person more than their role normally allows. Managing team members is always Super Admin only.</p>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-12">
        <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <h2 className="px-3 py-2.5 font-semibold text-[14px] border-b border-a-line">Status</h2>
          <div className="p-3 space-y-3">
            <Toggle checked={f.active} onChange={(v) => set({ active: v })} label="Active" hint={isSelf ? "You cannot deactivate yourself." : "Deactivated people cannot log in. They are signed out immediately."} />
            {errors.active && <p role="alert" className="text-xs text-a-red">{errors.active}</p>}
            {msg && <p role={msg.ok ? "status" : "alert"} className={`text-[13px] px-2.5 py-1.5 border-l-4 ${msg.ok ? "bg-a-surface border-brand text-brand" : "bg-a-surface border-a-red text-a-red"}`}>{msg.text}</p>}
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-a-raised border-t border-a-line">
            <Link href="/admin/users" className={btnGhost}>Back</Link>
            <button type="button" onClick={save} disabled={pending} className={btnPrimary}>{pending ? "Saving…" : id ? "Update user" : "Create user"}</button>
          </div>
        </section>
      </aside>
    </div>
  );
}
