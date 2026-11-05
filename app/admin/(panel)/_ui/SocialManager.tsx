"use client";

import { useEffect, useState, useTransition } from "react";
import Icon from "@/app/components/Icon";
import { SOCIAL_PLATFORMS, platformOf } from "@/lib/social";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { saveSocial } from "../social-actions";
import { Field, TextField, type Form } from "./fields";

/** Social media links for the website header, footer and search-engine data. */
export default function SocialManager({ initial }: { initial: Form[] }) {
  const [items, setItems] = useState<Form[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const change = (g: Form[]) => { setItems(g); setDirty(true); setMsg(null); };
  const patch = (i: number, p: Form) => change(items.map((g, n) => (n === i ? { ...g, ...p } : g)));
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= items.length) return; const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; change(c); };

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => start(async () => {
    const r = await saveSocial(JSON.stringify(items));
    setMsg({ ok: r.ok, text: r.ok ? "Saved. The website header and footer are updated." : r.message ?? "Could not save" });
    if (r.ok) setDirty(false);
  });

  return (
    <div className="max-w-3xl space-y-4">
      {items.length === 0 && <p className="bg-a-surface border border-a-line p-4 text-sm text-a-muted">No social links yet. Add your profiles; they appear as icons in the top header and in the footer.</p>}
      {items.map((x, i) => {
        const p = platformOf(x.platform);
        return (
          <section key={i} className="bg-a-surface border border-a-line p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand/15 text-brand flex items-center justify-center">{p ? <Icon name={p.icon} fixedWidth={false} /> : <Icon name="share-nodes" fixedWidth={false} />}</span>
              <strong className="flex-1 truncate">{p?.label ?? "New link"}</strong>
              {x.active === false && <span className="text-xs px-2 py-0.5 rounded-full bg-a-line text-a-muted">Hidden</span>}
            </div>
            <div className="grid sm:grid-cols-[200px_1fr_150px] gap-3">
              <Field label="Platform" htmlFor={`sp${i}`}>
                <select id={`sp${i}`} value={x.platform ?? ""} onChange={(e) => patch(i, { platform: e.target.value })} className={inputCls}>
                  <option value="">Choose…</option>
                  {SOCIAL_PLATFORMS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Profile link" htmlFor={`su${i}`}><TextField id={`su${i}`} value={x.url} onChange={(v) => patch(i, { url: v })} placeholder="https://www.instagram.com/alanfaldoc" /></Field>
              <Field label="Status" htmlFor={`sa${i}`}>
                <select id={`sa${i}`} value={x.active === false ? "off" : "on"} onChange={(e) => patch(i, { active: e.target.value === "on" })} className={inputCls}><option value="on">Shown</option><option value="off">Hidden</option></select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btnGhost}><Icon name="arrow-up" />Up</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={btnGhost}><Icon name="arrow-down" />Down</button>
              <button type="button" onClick={() => change(items.filter((_, n) => n !== i))} className="inline-flex items-center gap-2 px-3 py-1.5 border border-a-red/40 text-a-red text-[13px] font-medium rounded-[3px] hover:bg-a-red/10"><Icon name="trash-can" />Remove</button>
            </div>
          </section>
        );
      })}
      <button type="button" onClick={() => change([...items, { platform: "", url: "", active: true }])} className={btnGhost}><Icon name="plus" />Add social link</button>
      <div className="bg-a-surface border border-a-line p-4 space-y-3">
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm rounded-md px-3 py-2 ${msg.ok ? "bg-brand/10 text-brand" : "bg-a-red/10 text-a-red"}`}>{msg.text}</p>}
        {!msg && dirty && <p className="text-xs text-amber-300">You have unsaved changes.</p>}
        <button type="button" disabled={pending} onClick={save} className={btnPrimary}>{pending ? "Saving…" : "Save social links"}</button>
        <p className="text-xs text-a-muted">Links must start with https://. The order here is the order of the icons. Active links are also listed in the website&apos;s search-engine data.</p>
      </div>
    </div>
  );
}
