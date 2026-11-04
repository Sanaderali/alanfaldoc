"use client";

import { useState, useTransition } from "react";
import { faqLd } from "@/lib/seo";
import { btnPrimary, inputCls } from "../../ui";
import { saveFaqGroups } from "../actions";
import { Field, FaqsEditor, Repeater, Section, TextField, type Form } from "./fields";

export default function FaqManager({ initial }: { initial: Form[] }) {
  const [groups, setGroups] = useState<Form[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const change = (g: Form[]) => { setGroups(g); setDirty(true); setMsg(null); };
  const live = groups.filter((g) => g.status !== "draft").flatMap((g) => g.faqs ?? []).filter((f: Form) => f.question && f.answer);

  const save = () => start(async () => {
    const r = await saveFaqGroups(JSON.stringify(groups));
    setMsg({ ok: r.ok, text: r.message ?? "" });
    if (r.ok) setDirty(false);
  });

  return (
    <div className="pb-24 space-y-6">
      <Repeater<Form> items={groups} onChange={change} empty={{ title: "", status: "published", faqs: [] }} addLabel="Add group"
        render={(g, set, i) => (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2"><Field label="Group title" htmlFor={`gt${i}`}><TextField id={`gt${i}`} value={g.title} onChange={(v) => set({ title: v })} placeholder="e.g. Visa Processing" /></Field></div>
              <Field label="Status" htmlFor={`gs${i}`}>
                <select id={`gs${i}`} value={g.status ?? "published"} onChange={(e) => set({ status: e.target.value })} className={inputCls}>
                  <option value="published">Published</option><option value="draft">Draft (hidden)</option>
                </select>
              </Field>
            </div>
            <FaqsEditor value={g.faqs ?? []} onChange={(v) => set({ faqs: v })} />
          </div>
        )} />

      <Section title="FAQ schema preview" hint="The /faqs page outputs FAQPage structured data built from all published groups (toggle it under Pages & SEO → FAQs).">
        <details className="rounded-md border border-gray-200 bg-gray-50">
          <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium">{live.length} questions in schema</summary>
          <pre className="px-4 pb-4 text-xs overflow-auto max-h-80">{JSON.stringify(faqLd(live as never), null, 2)}</pre>
        </details>
      </Section>

      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 bg-white/95 backdrop-blur border-t border-gray-200">
        <div className="max-w-[1400px] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <p role="status" className={`text-sm ${msg ? (msg.ok ? "text-emerald-700" : "text-red-600") : "text-gray-500"}`}>{msg ? msg.text : dirty ? "Unsaved changes" : "All changes saved"}</p>
          <button type="button" onClick={save} disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save FAQs"}</button>
        </div>
      </div>
    </div>
  );
}
