"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import PostBody from "@/app/components/PostBody";
import Icon from "@/app/components/Icon";
import { articleLd, countryPageLd, faqLd, serviceLd } from "@/lib/seo";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { saveItem, deleteItem, duplicateItem } from "../actions";
import { CheckList, Counter, Field, FaqsEditor, ImageField, LinesField, PairsEditor, ParagraphsField, SchemaPanel, SectionsEditor, Section, SeoPanel, TextArea, TextField, Toggle, type Errors, type Form } from "./fields";

type Kind = "services" | "countries" | "posts";
export type EditorContext = { siteUrl: string; siteName: string; services: { value: string; label: string }[]; categories: string[] };

const GRADIENTS = [
  "from-emerald-100 via-green-100 to-green-200", "from-red-100 via-rose-100 to-red-200", "from-indigo-100 via-blue-100 to-indigo-200",
  "from-sky-100 via-blue-100 to-sky-200", "from-cyan-100 via-sky-100 to-blue-200", "from-lime-100 via-emerald-100 to-green-200",
  "from-amber-100 via-yellow-100 to-orange-200", "from-fuchsia-100 via-pink-100 to-purple-200", "from-gray-100 to-gray-200",
];

const toLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : "");
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function blank(kind: Kind): Form {
  const base = { status: "draft", publishAt: "", slug: "", image: "", imageAlt: "", faqSchema: true, schemaCustom: "", seo: {}, faqs: [] };
  if (kind === "services") return { ...base, title: "", icon: "briefcase", summary: "", intro: "", highlights: [], sections: [], relatedSlugs: [], serviceType: "" };
  if (kind === "countries") return { ...base, name: "", flag: "", tagline: "", headline: "", summary: "", intro: "", facts: [], sections: [], gradient: GRADIENTS[0], categories: [], serviceSlugs: [], featured: false };
  return { ...base, title: "", excerpt: "", category: "", author: "Al Anfal Doc Team", tags: [], body: [], readMinutes: "" };
}

export default function ItemEditor({ kind, id, initial, ctx }: { kind: Kind; id?: string; initial?: Form; ctx: EditorContext }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => ({ ...blank(kind), ...(initial ?? {}), publishAt: toLocal(initial?.publishAt) }));
  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const [bodyPreview, setBodyPreview] = useState(false);
  const slugTouched = useRef(!!id);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const titleKey = kind === "countries" ? "name" : "title";
  const set = (patch: Form) => { setF((p) => ({ ...p, ...patch })); setDirty(true); setMsg(null); };
  const setTitle = (v: string) => set({ [titleKey]: v, ...(slugTouched.current ? {} : { slug: slugify(v) }) });

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => start(async () => {
    const payload = { ...f, publishAt: fromLocal(f.publishAt) };
    const r = await saveItem(kind, JSON.stringify(payload), id);
    setErrors(r.errors ?? {});
    setMsg({ ok: r.ok, text: r.message ?? (r.ok ? "Saved" : "Could not save") });
    if (r.ok) {
      setDirty(false);
      if (!id && r.id) router.replace(`/admin/${kind}/${r.id}`);
      else router.refresh();
    } else {
      document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const path = kind === "services" ? `/services/${f.slug || "…"}` : kind === "countries" ? `/countries/${f.slug || "…"}` : `/blog/${f.slug || "…"}`;
  const seoTitle = kind === "countries" ? f.headline || f.name : f.title;
  const seoDesc = kind === "posts" ? f.excerpt : kind === "countries" ? f.intro : f.summary;

  const preview = useMemo(() => {
    const out: unknown[] = [];
    try {
      if (kind === "services") out.push(serviceLd({ ...f, slug: f.slug || "slug" } as never));
      if (kind === "countries") out.push(countryPageLd({ ...f, slug: f.slug || "slug" } as never));
      if (kind === "posts") out.push(articleLd({ ...f, slug: f.slug || "slug", date: (fromLocal(f.publishAt) || new Date().toISOString()).slice(0, 10) } as never));
      if (kind !== "posts" && f.faqSchema && f.faqs?.length) out.push(faqLd(f.faqs));
    } catch { /* partial data while typing */ }
    return out;
  }, [f, kind]);

  const insertAtCursor = (text: string) => {
    const ta = bodyRef.current;
    const cur = (f.body ?? []).join("\n\n");
    if (!ta) return set({ body: [...(f.body ?? []), text] });
    const pos = ta.selectionStart;
    const next = cur.slice(0, pos) + (pos && !cur.slice(0, pos).endsWith("\n\n") ? "\n\n" : "") + text + "\n\n" + cur.slice(pos);
    set({ body: next.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) });
  };

  const isLive = f.status === "published" && (!f.publishAt || new Date(f.publishAt).getTime() <= Date.now());

  return (
    <div className="pb-24">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6 min-w-0">
          <Section title="Content">
            <Field label={kind === "countries" ? "Country name" : "Title"} htmlFor="title" error={errors[titleKey]}>
              <TextField id="title" value={f[titleKey]} onChange={setTitle} />
            </Field>

            {kind === "services" && (
              <>
                <Field label="Summary" htmlFor="summary" error={errors.summary} counter={<Counter value={f.summary} max={160} />} hint="Shown on cards and used as the default meta description.">
                  <TextArea id="summary" rows={2} value={f.summary} onChange={(v) => set({ summary: v })} />
                </Field>
                <Field label="Introduction" htmlFor="intro"><TextArea id="intro" rows={4} value={f.intro} onChange={(v) => set({ intro: v })} /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Icon (Font Awesome)" htmlFor="icon" error={errors.icon} hint="Name from fontawesome.com, e.g. passport, building, language">
                    <div className="flex gap-2 items-center"><span className="w-10 h-10 shrink-0 rounded-full bg-brand-50 text-brand-text flex items-center justify-center"><Icon name={f.icon || "briefcase"} /></span><TextField id="icon" value={f.icon} onChange={(v) => set({ icon: v })} /></div>
                  </Field>
                  <Field label="Schema service type" htmlFor="stype" hint="Optional, e.g. Company formation. Defaults to the title."><TextField id="stype" value={f.serviceType ?? ""} onChange={(v) => set({ serviceType: v })} /></Field>
                </div>
                <Field label="Key points (bullets)" hint="One per line" htmlFor="hl"><LinesField id="hl" rows={4} value={f.highlights} onChange={(v) => set({ highlights: v })} /></Field>
              </>
            )}

            {kind === "countries" && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Flag emoji" htmlFor="flag"><TextField id="flag" value={f.flag} onChange={(v) => set({ flag: v })} placeholder="🇦🇺" /></Field>
                  <div className="sm:col-span-2"><Field label="Tagline" htmlFor="tagline"><TextField id="tagline" value={f.tagline} onChange={(v) => set({ tagline: v })} placeholder="Great Destination to Study and Live" /></Field></div>
                </div>
                <Field label="Page headline" htmlFor="headline"><TextField id="headline" value={f.headline} onChange={(v) => set({ headline: v })} placeholder="Study. Work. Live in Australia" /></Field>
                <Field label="Card summary" htmlFor="summary" error={errors.summary}><TextArea id="summary" rows={2} value={f.summary} onChange={(v) => set({ summary: v })} /></Field>
                <Field label="Introduction" htmlFor="intro" hint="Also the default meta description."><TextArea id="intro" rows={4} value={f.intro} onChange={(v) => set({ intro: v })} /></Field>
                <Field label="Key facts (shown as a bulleted list)"><PairsEditor value={f.facts} onChange={(v) => set({ facts: v })} a="label" b="value" addLabel="Add fact" aPlace="Capital" bPlace="Canberra" /></Field>
                <Field label="Banner colour (used when there is no cover image)">
                  <div className="flex flex-wrap gap-2">
                    {GRADIENTS.map((g) => (
                      <button key={g} type="button" aria-label={g} onClick={() => set({ gradient: g })} className={`w-12 h-8 rounded bg-gradient-to-br ${g} border ${f.gradient === g ? "ring-2 ring-brand border-brand" : "border-gray-200"}`} />
                    ))}
                  </div>
                </Field>
                <Toggle checked={!!f.featured} onChange={(v) => set({ featured: v })} label="Featured country" hint="Shown first in 'Popular countries'." />
              </>
            )}

            {kind === "posts" && (
              <>
                <Field label="Excerpt" htmlFor="excerpt" error={errors.excerpt} counter={<Counter value={f.excerpt} max={160} />} hint="Shown in listings and used as the default meta description.">
                  <TextArea id="excerpt" rows={2} value={f.excerpt} onChange={(v) => set({ excerpt: v })} />
                </Field>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Category" htmlFor="category" error={errors.category}>
                    <input id="category" list="cats" value={f.category} onChange={(e) => set({ category: e.target.value })} className={inputCls} />
                    <datalist id="cats">{ctx.categories.map((c) => <option key={c} value={c} />)}</datalist>
                  </Field>
                  <Field label="Author" htmlFor="author"><TextField id="author" value={f.author ?? ""} onChange={(v) => set({ author: v })} /></Field>
                  <Field label="Reading time (min)" htmlFor="rm" hint="Empty = automatic"><TextField id="rm" type="number" value={String(f.readMinutes ?? "")} onChange={(v) => set({ readMinutes: v })} /></Field>
                </div>
                <Field label="Tags" htmlFor="tags" hint="Comma separated"><TextField id="tags" value={(f.tags ?? []).join(", ")} onChange={(v) => set({ tags: v.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
                <Field label="Article body" htmlFor="body" error={errors.body} hint="Separate paragraphs with a blank line. A line starting with “## ” is a heading. Lines starting with “- ” make a bullet list.">
                  <div className="flex gap-2 mb-2">
                    <button type="button" className={btnGhost} onClick={() => insertAtCursor("## Heading")}><Icon name="heading" />Heading</button>
                    <button type="button" className={btnGhost} onClick={() => insertAtCursor("- First point\n- Second point")}><Icon name="list-ul" />Bullets</button>
                    <button type="button" className={`${btnGhost} ml-auto`} onClick={() => setBodyPreview((v) => !v)}><Icon name={bodyPreview ? "pen" : "eye"} />{bodyPreview ? "Edit" : "Preview"}</button>
                  </div>
                  {bodyPreview ? (
                    <div className="border border-gray-200 rounded-md p-4 min-h-[16rem] bg-white"><PostBody body={f.body ?? []} /></div>
                  ) : (
                    <textarea id="body" ref={bodyRef} rows={16} value={(f.body ?? []).join("\n\n")} onChange={(e) => set({ body: e.target.value.split(/\n{2,}/).map((p: string) => p.trim()).filter(Boolean) })} className={`${inputCls} resize-y`} />
                  )}
                </Field>
              </>
            )}
          </Section>

          {kind !== "posts" && (
            <Section title="Page sections" hint="Extra headings, paragraphs and bullet lists shown below the introduction.">
              <SectionsEditor value={f.sections} onChange={(v) => set({ sections: v })} />
            </Section>
          )}

          {kind === "countries" && (
            <Section title="Sidebar & related services">
              <Field label="Visa categories (sidebar links)" hint="Leave empty to list the related services instead.">
                <PairsEditor value={f.categories ?? []} onChange={(v) => set({ categories: v })} a="title" b="href" addLabel="Add link" aPlace="Study Visa in Australia" bPlace="/services/visa-processing" />
              </Field>
              <Field label="Related services"><CheckList options={ctx.services} value={f.serviceSlugs} onChange={(v) => set({ serviceSlugs: v })} /></Field>
            </Section>
          )}
          {kind === "services" && (
            <Section title="Related services">
              <CheckList options={ctx.services.filter((s) => s.value !== f.slug)} value={f.relatedSlugs} onChange={(v) => set({ relatedSlugs: v })} />
            </Section>
          )}

          {kind !== "posts" && (
            <Section title="FAQs" hint={`Shown on the ${kind === "services" ? "service" : "country"} page. Each answer should be short and factual.`}>
              <FaqsEditor value={f.faqs} onChange={(v) => set({ faqs: v })} />
            </Section>
          )}

          <Section title="SEO & social" hint="Meta tags that control how this page looks in Google and when shared.">
            <SeoPanel seo={f.seo} onChange={(s) => set({ seo: s })} errors={errors} fallbackTitle={seoTitle} fallbackDescription={seoDesc} path={path} siteUrl={ctx.siteUrl} siteName={ctx.siteName} />
          </Section>

          <Section title="Schema (structured data)">
            <SchemaPanel faqSchema={f.faqSchema} onFaqSchema={(v) => set({ faqSchema: v })} custom={f.schemaCustom} onCustom={(v) => set({ schemaCustom: v })} error={errors.schemaCustom} preview={preview} hasFaqs={kind !== "posts"} />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Publish">
            <Field label="Status" htmlFor="status">
              <select id="status" value={f.status} onChange={(e) => set({ status: e.target.value })} className={inputCls}>
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="Publish date & time" htmlFor="publishAt" error={errors.publishAt} hint="Optional. A future date schedules the page: it goes live automatically.">
              <input id="publishAt" type="datetime-local" value={f.publishAt} onChange={(e) => set({ publishAt: e.target.value })} className={inputCls} />
            </Field>
            <Field label="URL slug" htmlFor="slug" error={errors.slug} hint={`${ctx.siteUrl}${path}`}>
              <TextField id="slug" value={f.slug} onChange={(v) => { slugTouched.current = true; set({ slug: slugify(v) }); }} />
            </Field>
            <div className="text-xs text-gray-500 space-y-1">
              {initial?.createdAt && <p>Created {new Date(initial.createdAt).toLocaleString("en-GB")}</p>}
              {initial?.updatedAt && <p>Last updated {new Date(initial.updatedAt).toLocaleString("en-GB")}</p>}
              <p>{f.status === "draft" ? "Not visible on the website." : isLive ? "Visible on the website." : "Scheduled: not visible yet."}</p>
            </div>
            {id && isLive && <Link href={path} target="_blank" className={`${btnGhost} w-full`}><Icon name="arrow-up-right-from-square" />View live page</Link>}
          </Section>

          <Section title="Image">
            <ImageField src={f.image} alt={f.imageAlt} error={errors.imageAlt} onChange={(src, alt) => set({ image: src, imageAlt: alt })} label={kind === "posts" ? "Cover image" : "Banner / cover image"} />
          </Section>

          {id && (
            <Section title="Danger zone">
              <form action={duplicateItem.bind(null, kind, id)}><button className={`${btnGhost} w-full`}><Icon name="copy" />Duplicate as draft</button></form>
              <form action={deleteItem.bind(null, kind, id)} onSubmit={(e) => { if (!confirm("Delete this item permanently? This cannot be undone.")) e.preventDefault(); }}>
                <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50"><Icon name="trash-can" />Delete</button>
              </form>
            </Section>
          )}
        </div>
      </div>

      {/* sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 bg-white/95 backdrop-blur border-t border-gray-200">
        <div className="max-w-[1400px] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <p role="status" className={`text-sm ${msg ? (msg.ok ? "text-emerald-700" : "text-red-600") : "text-gray-500"}`}>
            {msg ? msg.text : dirty ? "Unsaved changes (Ctrl+S to save)" : "All changes saved"}
          </p>
          <div className="flex gap-2">
            <Link href={`/admin/${kind}`} className={btnGhost}>Back to list</Link>
            <button type="button" onClick={save} disabled={pending} className={btnPrimary}>{pending ? "Saving…" : id ? "Save changes" : "Create"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
