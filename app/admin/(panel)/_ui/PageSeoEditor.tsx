"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { faqLd } from "@/lib/seo";
import { btnGhost, btnPrimary } from "../../ui";
import { savePage } from "../actions";
import { Section, SchemaPanel, SeoPanel, type Errors, type Form } from "./fields";

export default function PageSeoEditor({ pageKey, name, path, initial, siteUrl, siteName, faqs }: { pageKey: string; name: string; path: string; initial: Form; siteUrl: string; siteName: string; faqs: Form[] }) {
  const [f, setF] = useState<Form>({ seo: {}, faqSchema: true, schemaCustom: "", ...initial });
  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (p: Form) => { setF((x) => ({ ...x, ...p })); setMsg(null); };

  const save = () => start(async () => {
    const r = await savePage(pageKey, JSON.stringify(f));
    setErrors(r.errors ?? {});
    setMsg({ ok: r.ok, text: r.message ?? "" });
  });

  const isFaq = pageKey === "faqs";
  return (
    <div className="pb-24 space-y-6 max-w-3xl">
      <Section title="Meta tags" hint="Leave a field empty to keep the built-in default for this page.">
        <SeoPanel seo={f.seo} onChange={(s) => set({ seo: s })} errors={errors} fallbackTitle={name} fallbackDescription="" path={path} siteUrl={siteUrl} siteName={siteName} />
      </Section>
      <Section title="Schema (structured data)">
        <SchemaPanel faqSchema={f.faqSchema} onFaqSchema={(v) => set({ faqSchema: v })} custom={f.schemaCustom} onCustom={(v) => set({ schemaCustom: v })} error={errors.schemaCustom} hasFaqs={isFaq} preview={isFaq ? faqLd(faqs as never) : { note: "Breadcrumb + site-wide Organization / WebSite schema are generated automatically." }} />
      </Section>
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 bg-white/95 backdrop-blur border-t border-gray-200">
        <div className="max-w-[1400px] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <p role="status" className={`text-sm ${msg ? (msg.ok ? "text-emerald-700" : "text-red-600") : "text-gray-500"}`}>{msg?.text ?? ""}</p>
          <div className="flex gap-2"><Link href="/admin/pages" className={btnGhost}>Back</Link><button type="button" onClick={save} disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save"}</button></div>
        </div>
      </div>
    </div>
  );
}
