"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PERMISSIONS, ROLES, ROLE_DESCRIPTION, ROLE_LABEL, ROLE_PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@/types/content";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { saveUser } from "../users-actions";
import { Field, TextField, Toggle } from "./fields";

type Initial = { name: string; username: string; email: string; role: Role; active: boolean; extraPermissions: string[]; removedPermissions?: string[] };

/** Create / edit a team member (Super Admin only). */
export default function UserForm({ id, initial, isSelf }: { id?: string; initial?: Initial; isSelf?: boolean }) {
  const router = useRouter();
  const base: Initial = { name: "", username: "", email: "", role: "content_editor", active: true, extraPermissions: [], removedPermissions: [], ...(initial ?? {}) };
  const [f, setF] = useState<Initial & { password: string }>({ ...base, password: "" });
  // the ticked permissions: the role's permissions, plus extras, minus the ones switched off. Every box can be ticked or unticked.
  const startPerms = [...new Set([...ROLE_PERMISSIONS[base.role], ...(base.extraPermissions ?? [])])].filter((p) => !(base.removedPermissions ?? []).includes(p) || base.role === "super_admin");
  const [perms, setPerms] = useState<string[]>(startPerms);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (p: Partial<typeof f>) => { setF((x) => ({ ...x, ...p })); setMsg(null); };

  const rolePerms = new Set<string>(ROLE_PERMISSIONS[f.role]);
  const isSuper = f.role === "super_admin";
  const changeRole = (role: Role) => { set({ role }); setPerms([...ROLE_PERMISSIONS[role]]); };
  const toggle = (k: string) => { setPerms((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k])); setMsg(null); };

  const save = () => start(async () => {
    const extraPermissions = isSuper ? [] : perms.filter((p) => !rolePerms.has(p));
    const removedPermissions = isSuper ? [] : [...rolePerms].filter((p) => !perms.includes(p));
    const r = await saveUser(JSON.stringify({ ...f, extraPermissions, removedPermissions }), id);
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
              <select id="u-role" value={f.role} onChange={(e) => changeRole(e.target.value as Role)} className={inputCls}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </Field>
            <div>
              <p className="text-[13px] font-semibold mb-2">Permissions</p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
                {PERMISSIONS.map((p) => {
                  const fromRole = rolePerms.has(p.key);
                  const on = isSuper || perms.includes(p.key);
                  const locked = isSuper || p.key === "users.manage"; // team management is always Super Admin only
                  return (
                    <li key={p.key}>
                      <label className={`flex items-center gap-2 ${on ? "text-a-text" : "text-a-muted"} ${locked ? "" : "cursor-pointer"}`}>
                        <input type="checkbox" checked={on} disabled={locked} onChange={() => toggle(p.key)} className="rounded-[3px] border-a-line2 text-brand focus:ring-brand" />
                        {p.label}
                        {on && fromRole && <span className="text-[11px] text-a-subtle">(from role)</span>}
                        {on && !fromRole && <span className="text-[11px] text-brand-text">(extra)</span>}
                        {!on && fromRole && <span className="text-[11px] text-a-red">(switched off)</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-a-muted mt-2">Choosing a role ticks its normal permissions. Untick any box to take a permission away from this person, or tick extra boxes to give more than the role allows. Managing team members is always Super Admin only.</p>
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
