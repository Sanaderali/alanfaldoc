"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import Icon from "@/app/components/Icon";
import { faqLd } from "@/lib/seo";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { savePreview, saveFaqGroups } from "../actions";
import { Field, FaqsEditor, TextField, type Form } from "./fields";

/** FAQ groups as an accordion (one group open at a time) with a WordPress-style sidebar. */
export default function FaqManager({ initial }: { initial: Form[] }) {
  const [groups, setGroups] = useState<Form[]>(initial);
  const [open, setOpen] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [previewing, setPreviewing] = useState(false);
  const change = (g: Form[]) => { setGroups(g); setDirty(true); setMsg(null); };
  const patch = (i: number, p: Form) => change(groups.map((g, n) => (n === i ? { ...g, ...p } : g)));
  const live = groups.filter((g) => g.status !== "draft").flatMap((g) => g.faqs ?? []).filter((f: Form) => f.question && f.answer);
  const total = groups.reduce((n, g) => n + (g.faqs?.length ?? 0), 0);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => start(async () => {
    const r = await saveFaqGroups(JSON.stringify(groups));
    setMsg({ ok: r.ok, text: r.ok ? "FAQs saved." : r.message ?? "Could not save" });
    if (r.ok) setDirty(false);
  });

  const preview = async () => {
    const w = window.open("about:blank", "_blank");
    setPreviewing(true);
    const r = await savePreview("faqs", JSON.stringify(groups));
    setPreviewing(false);
    if (!r.ok) { w?.close(); setMsg({ ok: false, text: "Could not create the preview" }); return; }
    if (w) w.location.href = "/preview/faqs/all"; else window.open("/preview/faqs/all", "_blank");
  };

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= groups.length) return;
    const c = [...groups];
    [c[i], c[j]] = [c[j], c[i]];
    change(c);
    setOpen(j);
  };
  const g = open !== null ? groups[open] : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
      {/* ---------- groups (accordion) ---------- */}
      <div className="space-y-3 min-w-0">
        {groups.map((gr, i) => {
          const isOpen = open === i;
          return (
            <section key={i} className={`bg-a-surface border rounded-lg shadow-sm ${isOpen ? "border-brand/50" : "border-a-line"}`}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <Icon name="chevron-right" className={`text-xs text-a-subtle transition-transform ${isOpen ? "rotate-90" : ""}`} />
                <span className="flex-1 min-w-0 font-semibold truncate">{gr.title || <em className="text-a-subtle">Untitled group</em>}</span>
                <span className="text-xs text-a-muted whitespace-nowrap">{gr.faqs?.length ?? 0} questions</span>
                {gr.status === "draft" && <span className="text-xs px-2 py-0.5 rounded-full bg-a-line text-a-muted">Draft</span>}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-a-line space-y-4">
                  <Field label="Group title" htmlFor={`gt${i}`}><TextField id={`gt${i}`} value={gr.title} onChange={(v) => patch(i, { title: v })} placeholder="e.g. Visa Processing" /></Field>
                  <FaqsEditor value={gr.faqs ?? []} onChange={(v) => patch(i, { faqs: v })} />
                </div>
              )}
            </section>
          );
        })}
        <button type="button" onClick={() => { change([...groups, { title: "", status: "published", faqs: [] }]); setOpen(groups.length); }} className={btnGhost}><Icon name="plus" />Add group</button>

        <details className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">FAQ schema preview ({live.length} questions)</summary>
          <pre className="px-4 pb-4 text-xs overflow-auto max-h-80 border-t border-a-line pt-3">{JSON.stringify(faqLd(live as never), null, 2)}</pre>
        </details>
      </div>

      {/* ---------- sidebar ---------- */}
      <aside className="space-y-5 xl:sticky xl:top-4">
        <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <h2 className="px-4 py-3 font-semibold text-sm border-b border-a-line">Publish</h2>
          <div className="p-4 space-y-4">
            <p className="text-sm text-a-muted">{groups.length} groups · {total} questions</p>
            {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm rounded-md px-3 py-2 ${msg.ok ? "bg-brand/10 text-brand" : "bg-a-red/10 text-a-red"}`}>{msg.text}</p>}
            {!msg && dirty && <p className="text-xs text-amber-300">You have unsaved changes.</p>}
            <div className="flex flex-col gap-2">
              <button type="button" disabled={pending} onClick={save} className={`${btnPrimary} w-full`}>{pending ? "Saving…" : "Save FAQs"}</button>
              <button type="button" disabled={previewing} onClick={preview} className={`${btnGhost} w-full`}><Icon name="eye" />Preview</button>
              <Link href="/faqs" target="_blank" className="text-center text-sm text-brand-text hover:underline">View on website ↗</Link>
            </div>
          </div>
        </section>

        <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <h2 className="px-4 py-3 font-semibold text-sm border-b border-a-line">{g ? "Selected group" : "Group options"}</h2>
          <div className="p-4 space-y-4">
            {!g || open === null ? <p className="text-sm text-a-muted">Open a group to change its status, order or delete it.</p> : (
              <>
                <p className="text-sm font-medium truncate">{g.title || "Untitled group"}</p>
                <Field label="Status" htmlFor="gstatus">
                  <select id="gstatus" value={g.status ?? "published"} onChange={(e) => patch(open, { status: e.target.value })} className={inputCls}>
                    <option value="published">Published</option><option value="draft">Draft (hidden)</option>
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => move(open, -1)} disabled={open === 0} className={btnGhost}><Icon name="arrow-up" />Move up</button>
                  <button type="button" onClick={() => move(open, 1)} disabled={open === groups.length - 1} className={btnGhost}><Icon name="arrow-down" />Move down</button>
                </div>
                <button type="button" onClick={() => { if (confirm("Delete this group and all its questions?")) { change(groups.filter((_, n) => n !== open)); setOpen(null); } }} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-a-red/40 text-a-red text-sm font-medium rounded-md hover:bg-a-red/10"><Icon name="trash-can" />Delete group</button>
              </>
            )}
          </div>
        </section>

        <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <h2 className="px-4 py-3 font-semibold text-sm border-b border-a-line">Search engine</h2>
          <div className="p-4"><Link href="/admin/pages/faqs" className={`${btnGhost} w-full`}>FAQ page SEO & schema</Link></div>
        </section>
      </aside>
    </div>
  );
}
