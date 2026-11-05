"use client";

import { useEffect, useState, useTransition } from "react";
import Icon from "@/app/components/Icon";
import { ROLES, ROLE_LABEL } from "@/lib/rbac";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { saveWhatsApp } from "../whatsapp-actions";
import { Field, TextField, type Form } from "./fields";

/** WhatsApp numbers shown on the website buttons. The first active number is the default; with more than one, visitors choose. */
export default function WhatsAppManager({ initial }: { initial: Form[] }) {
  const [items, setItems] = useState<Form[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const change = (g: Form[]) => { setItems(g); setDirty(true); setMsg(null); };
  const patch = (i: number, p: Form) => change(items.map((g, n) => (n === i ? { ...g, ...p } : g)));

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => start(async () => {
    const r = await saveWhatsApp(JSON.stringify(items));
    setMsg({ ok: r.ok, text: r.ok ? "Saved. The website buttons are updated." : r.message ?? "Could not save" });
    if (r.ok) setDirty(false);
  });
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= items.length) return; const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; change(c); };
  const firstActive = items.findIndex((x) => x.active !== false && x.number);

  return (
    <div className="max-w-3xl space-y-4">
      {items.map((w, i) => (
        <section key={i} className="bg-a-surface border border-a-line p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="fa-brands fa-whatsapp" className="text-[#25D366] text-lg" />
            <strong className="flex-1 truncate">{w.label || "New number"}</strong>
            {i === firstActive && <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand">Default</span>}
            {w.active === false && <span className="text-xs px-2 py-0.5 rounded-full bg-a-line text-a-muted">Hidden</span>}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name shown to visitors" htmlFor={`wl${i}`} hint="e.g. Visa enquiries, Company formation, Support"><TextField id={`wl${i}`} value={w.label} onChange={(v) => patch(i, { label: v })} /></Field>
            <Field label="WhatsApp number" htmlFor={`wn${i}`} hint="With country code, e.g. +971 50 805 1192"><TextField id={`wn${i}`} value={w.number} onChange={(v) => patch(i, { number: v })} placeholder="+971 50 000 0000" /></Field>
            <Field label="Handled by (team role)" htmlFor={`wr${i}`} hint="Internal only: which role looks after this number">
              <select id={`wr${i}`} value={w.role ?? ""} onChange={(e) => patch(i, { role: e.target.value })} className={inputCls}>
                <option value="">Not specified</option>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </Field>
            <Field label="Status" htmlFor={`wa${i}`}>
              <select id={`wa${i}`} value={w.active === false ? "off" : "on"} onChange={(e) => patch(i, { active: e.target.value === "on" })} className={inputCls}><option value="on">Shown on the website</option><option value="off">Hidden</option></select>
            </Field>
          </div>
          <Field label="Message pre-filled for the visitor (optional)" htmlFor={`wm${i}`}><TextField id={`wm${i}`} value={w.message ?? ""} onChange={(v) => patch(i, { message: v })} placeholder="Hello, I need help with…" /></Field>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btnGhost}><Icon name="arrow-up" />Up</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={btnGhost}><Icon name="arrow-down" />Down</button>
            <button type="button" onClick={() => { if (confirm("Remove this number?")) change(items.filter((_, n) => n !== i)); }} className="inline-flex items-center gap-2 px-3 py-1.5 border border-a-red/40 text-a-red text-[13px] font-medium rounded-[3px] hover:bg-a-red/10"><Icon name="trash-can" />Remove</button>
          </div>
        </section>
      ))}
      <button type="button" onClick={() => change([...items, { label: "", number: "", role: "", message: "", active: true }])} className={btnGhost}><Icon name="plus" />Add number</button>
      <div className="bg-a-surface border border-a-line p-4 space-y-3">
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm rounded-md px-3 py-2 ${msg.ok ? "bg-brand/10 text-brand" : "bg-a-red/10 text-a-red"}`}>{msg.text}</p>}
        {!msg && dirty && <p className="text-xs text-amber-300">You have unsaved changes.</p>}
        <button type="button" disabled={pending} onClick={save} className={btnPrimary}>{pending ? "Saving…" : "Save WhatsApp numbers"}</button>
        <p className="text-xs text-a-muted">One active number: the WhatsApp button opens it directly. Several: the button lets the visitor pick (by name). The first active number is used for the “WhatsApp” buttons inside pages.</p>
      </div>
    </div>
  );
}
