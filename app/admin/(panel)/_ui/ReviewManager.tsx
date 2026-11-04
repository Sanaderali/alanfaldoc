"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import Icon from "@/app/components/Icon";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { saveReviews } from "../actions";
import { Field, ImageField, TextArea, TextField, type Form } from "./fields";

const Stars = ({ n }: { n: number }) => <span className="text-amber-400 whitespace-nowrap" aria-label={`${n} out of 5`}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name={i <= n ? "fa-solid fa-star" : "fa-regular fa-star"} fixedWidth={false} />)}</span>;

/** Customer reviews shown in "Our Success Stories" on the home page. One card per review, one open at a time. */
export default function ReviewManager({ initial }: { initial: Form[] }) {
  const [items, setItems] = useState<Form[]>(initial);
  const [open, setOpen] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const change = (g: Form[]) => { setItems(g); setDirty(true); setMsg(null); };
  const patch = (i: number, p: Form) => change(items.map((g, n) => (n === i ? { ...g, ...p } : g)));
  const shown = items.filter((r) => r.status !== "draft" && r.name && r.text).length;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => start(async () => {
    const r = await saveReviews(JSON.stringify(items));
    setMsg({ ok: r.ok, text: r.ok ? "Reviews saved. The home page is updated." : r.message ?? "Could not save" });
    if (r.ok) setDirty(false);
  });
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; change(c); setOpen(j);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
      <div className="space-y-3 min-w-0">
        {items.length === 0 && <p className="bg-a-surface border border-a-line p-6 text-sm text-a-muted">No reviews yet. Add real customer reviews with <strong>Add review</strong>. The &ldquo;Our Success Stories&rdquo; section appears on the home page as soon as one review is published.</p>}
        {items.map((r, i) => {
          const isOpen = open === i;
          return (
            <section key={i} className={`bg-a-surface border rounded-lg shadow-sm ${isOpen ? "border-brand/50" : "border-a-line"}`}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <Icon name="chevron-right" className={`text-xs text-a-subtle transition-transform ${isOpen ? "rotate-90" : ""}`} />
                <span className="flex-1 min-w-0"><span className="font-semibold truncate block">{r.name || <em className="text-a-subtle">New review</em>}</span>{r.role && <span className="text-xs text-a-muted truncate block">{r.role}</span>}</span>
                <Stars n={Number(r.rating) || 5} />
                {r.status === "draft" && <span className="text-xs px-2 py-0.5 rounded-full bg-a-line text-a-muted">Hidden</span>}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-3 border-t border-a-line space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Customer name" htmlFor={`rn${i}`}><TextField id={`rn${i}`} value={r.name} onChange={(v) => patch(i, { name: v })} placeholder="e.g. Ahmed Khan" /></Field>
                    <Field label="Service / visa type" htmlFor={`rr${i}`} hint="Shown under the name"><TextField id={`rr${i}`} value={r.role} onChange={(v) => patch(i, { role: v })} placeholder="e.g. Golden Visa" /></Field>
                  </div>
                  <Field label="Review" htmlFor={`rt${i}`}><TextArea id={`rt${i}`} rows={4} value={r.text} onChange={(v) => patch(i, { text: v })} placeholder="What the customer said, in their own words" /></Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Rating" htmlFor={`rs${i}`}>
                      <select id={`rs${i}`} value={String(r.rating ?? 5)} onChange={(e) => patch(i, { rating: Number(e.target.value) })} className={inputCls}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}</select>
                    </Field>
                    <Field label="Status" htmlFor={`rst${i}`}>
                      <select id={`rst${i}`} value={r.status ?? "published"} onChange={(e) => patch(i, { status: e.target.value })} className={inputCls}><option value="published">Published</option><option value="draft">Hidden (draft)</option></select>
                    </Field>
                  </div>
                  <ImageField label="Photo (optional)" showAlt={false} src={r.image} alt="" onChange={(src) => patch(i, { image: src })} />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btnGhost}><Icon name="arrow-up" />Move up</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={btnGhost}><Icon name="arrow-down" />Move down</button>
                    <button type="button" onClick={() => { if (confirm("Delete this review?")) { change(items.filter((_, n) => n !== i)); setOpen(null); } }} className="inline-flex items-center gap-2 px-3 py-1.5 border border-a-red/40 text-a-red text-[13px] font-medium rounded-[3px] hover:bg-a-red/10"><Icon name="trash-can" />Delete</button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
        <button type="button" onClick={() => { change([...items, { name: "", role: "", text: "", rating: 5, status: "published" }]); setOpen(items.length); }} className={btnGhost}><Icon name="plus" />Add review</button>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-4">
        <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <h2 className="px-4 py-3 font-semibold text-sm border-b border-a-line">Publish</h2>
          <div className="p-4 space-y-4">
            <p className="text-sm text-a-muted">{items.length} review{items.length === 1 ? "" : "s"} · {shown} shown on the website</p>
            {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm rounded-md px-3 py-2 ${msg.ok ? "bg-brand/10 text-brand" : "bg-a-red/10 text-a-red"}`}>{msg.text}</p>}
            {!msg && dirty && <p className="text-xs text-amber-300">You have unsaved changes.</p>}
            <button type="button" disabled={pending} onClick={save} className={`${btnPrimary} w-full`}>{pending ? "Saving…" : "Save reviews"}</button>
            <Link href="/#reviews" target="_blank" className="block text-center text-sm text-brand-text hover:underline">View on website ↗</Link>
          </div>
        </section>
        <p className="text-xs text-a-muted">Only publish genuine reviews from real customers. The order here is the order on the home page (the first 6 are shown).</p>
      </aside>
    </div>
  );
}
