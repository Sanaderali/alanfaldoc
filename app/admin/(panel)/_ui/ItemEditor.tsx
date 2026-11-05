"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";
import { articleLd, countryPageLd, faqLd, serviceLd } from "@/lib/seo";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { saveItem, duplicateItem, savePreview, trashItem } from "../actions";
import { CategoryBox, TagBox } from "./TaxonomyBoxes";
import RichEditor from "./RichEditor";
import Flag from "@/app/components/Flag";
import { BUILTIN_FLAGS, builtinFlag, emojiToCode } from "@/lib/flags";
import { CheckList, Counter, Field, FaqsEditor, ImageField, LinesField, PairsEditor, RegionsEditor, SchemaPanel, SeoPanel, TextArea, TextField, Toggle, type Errors, type Form } from "./fields";

type Kind = "services" | "countries" | "posts";
export type EditorContext = { siteUrl: string; siteName: string; services: { value: string; label: string }[]; categories: { name: string; count: number }[]; tags: { name: string; count: number }[] };

const GRADIENTS = [
  "from-emerald-100 via-green-100 to-green-200", "from-red-100 via-rose-100 to-red-200", "from-indigo-100 via-blue-100 to-indigo-200",
  "from-sky-100 via-blue-100 to-sky-200", "from-cyan-100 via-sky-100 to-blue-200", "from-lime-100 via-emerald-100 to-green-200",
  "from-amber-100 via-yellow-100 to-orange-200", "from-fuchsia-100 via-pink-100 to-purple-200", "from-gray-100 to-gray-200",
];
const singular = { services: "service", countries: "country", posts: "post" } as const;
const base = { services: "/services/", countries: "/countries/", posts: "/blog/" } as const;

const toLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : "");
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function blank(kind: Kind): Form {
  const b = { status: "draft", publishAt: "", slug: "", image: "", imageAlt: "", faqSchema: true, schemaCustom: "", seo: {}, faqs: [], contentHtml: "", answer: "", takeaways: [], summaryTable: [], sources: [] };
  if (kind === "services") return { ...b, title: "", icon: "briefcase", summary: "", relatedSlugs: [], serviceType: "", featured: false };
  if (kind === "countries") return { ...b, name: "", flag: "", flagImage: "", tagline: "", headline: "", summary: "", facts: [], gradient: GRADIENTS[0], categories: [], serviceSlugs: [], featured: false, regions: [], regionsLabel: "" };
  return { ...b, title: "", excerpt: "", category: "", author: "Al Anfal Doc Team", tags: [], readMinutes: "" };
}

function WordCount({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.trim().split(/\s+/).filter(Boolean).length;
  const tone = n === 0 ? "text-a-subtle" : n < min || n > max ? "text-amber-300" : "text-brand";
  return <span className={`text-xs tabular-nums ${tone}`}>{n} words · aim for {min}-{max}</span>;
}

function Box({ title, children, open, className = "" }: { title: string; children: React.ReactNode; open?: boolean; className?: string }) {
  return (
    <details open={open ?? true} className={`group bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] ${className}`}>
      <summary className="flex items-center justify-between cursor-pointer list-none px-3 py-2.5 font-semibold text-[14px] text-a-text select-none group-open:border-b border-a-line">
        {title}<Icon name="caret-up" className="text-a-subtle text-xs transition-transform group-open:rotate-0 rotate-180" />
      </summary>
      <div className="p-3 space-y-3">{children}</div>
    </details>
  );
}

export default function ItemEditor({ kind, id, initial, ctx }: { kind: Kind; id?: string; initial?: Form; ctx: EditorContext }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => ({ ...blank(kind), ...(initial ?? {}), publishAt: toLocal(initial?.publishAt) }));
  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const [editSlug, setEditSlug] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [editDate, setEditDate] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewId, setPreviewId] = useState<string | undefined>(id);
  const slugTouched = useRef(!!id);

  const titleKey = kind === "countries" ? "name" : "title";
  const set = (patch: Form) => { setF((p) => ({ ...p, ...patch })); setDirty(true); setMsg(null); };
  const setTitle = (v: string) => set({ [titleKey]: v, ...(slugTouched.current ? {} : { slug: slugify(v) }) });

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const future = !!f.publishAt && new Date(f.publishAt).getTime() > Date.now();
  const save = (status: "draft" | "published") => start(async () => {
    const payload = { ...f, status, publishAt: fromLocal(f.publishAt) };
    const r = await saveItem(kind, JSON.stringify(payload), id);
    setErrors(r.errors ?? {});
    if (r.ok) {
      setF((p) => ({ ...p, status }));
      setDirty(false);
      setMsg({ ok: true, text: status === "draft" ? "Draft saved." : future ? "Scheduled." : id ? "Updated." : "Published." });
      if (!id && r.id) router.replace(`/admin/${kind}/${r.id}`);
      else router.refresh();
    } else {
      setMsg({ ok: false, text: r.message ?? "Could not save" });
      setTimeout(() => document.querySelector('p[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
  });

  /** WordPress-style preview: stores the CURRENT editor content privately and opens the real page in a new tab */
  const openPreview = async () => {
    const w = window.open("about:blank", "_blank"); // open synchronously so pop-up blockers allow it
    setPreviewing(true);
    const r = await savePreview(kind, JSON.stringify({ ...f, publishAt: fromLocal(f.publishAt) }), id ?? previewId);
    setPreviewing(false);
    if (!r.ok || !r.id) { w?.close(); setMsg({ ok: false, text: r.message ?? "Could not create the preview" }); return; }
    setPreviewId(r.id);
    const url = `/preview/${kind}/${r.id}`;
    if (w) w.location.href = url; else window.open(url, "_blank");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(f.status === "published" ? "published" : "draft"); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const path = `${base[kind]}${f.slug || "…"}`;
  const seoTitle = kind === "countries" ? f.headline || f.name : f.title;
  const seoDesc = kind === "posts" ? f.excerpt : f.summary;
  const isLive = f.status === "published" && !future;

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

  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start">
      {/* ------------ main column ------------ */}
      <div className="space-y-5 min-w-0">
        <div>
          <input
            value={f[titleKey]}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "countries" ? "Enter country name" : "Enter title here"}
            aria-label="Title"
            className="w-full px-3 py-1.5 text-[1.55rem] leading-snug bg-a-surface border border-a-line2 rounded-[3px] placeholder-[#a7aaad] shadow-[inset_0_1px_2px_rgba(0,0,0,.07)] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          {errors[titleKey] && <p role="alert" className="text-xs text-a-red mt-1">{errors[titleKey]}</p>}
          <p className="mt-2 text-[13px] text-a-muted flex flex-wrap items-center gap-x-1.5 gap-y-1 break-all">
            <strong>Permalink:</strong>
            {editSlug ? (
              <span className="inline-flex items-center gap-1.5">{ctx.siteUrl.replace(/^https?:\/\//, "")}{base[kind]}<input aria-label="URL slug" value={f.slug} onChange={(e) => { slugTouched.current = true; set({ slug: slugify(e.target.value) }); }} className="px-1.5 py-0.5 border border-a-line2 rounded-[3px]" /><button type="button" className={btnGhost} onClick={() => setEditSlug(false)}>OK</button></span>
            ) : (
              <><span className="text-brand-text">{ctx.siteUrl.replace(/^https?:\/\//, "")}{path}</span><button type="button" onClick={() => setEditSlug(true)} className={btnGhost}>Edit</button></>
            )}
          </p>
          {errors.slug && <p role="alert" className="text-xs text-a-red mt-1">{errors.slug}</p>}
        </div>

        {kind === "posts" && (
          <Box title="Featured image">
            <ImageField src={f.image} alt={f.imageAlt} error={errors.imageAlt} onChange={(src, alt) => set({ image: src, imageAlt: alt })} label="" />
          </Box>
        )}

        {kind === "countries" && (
          <Box title="Quick facts" className="!bg-a-surface">
            <p className="text-xs text-a-muted">Short facts shown as a list at the top of the page (capital, language, currency…).</p>
            <PairsEditor value={f.facts} onChange={(v) => set({ facts: v })} a="label" b="value" addLabel="Add fact" aPlace="Capital" bPlace="Canberra" />
          </Box>
        )}

        <div>
          <RichEditor value={f.contentHtml} onChange={(html) => set({ contentHtml: html })} placeholder="Write your content here. Use the toolbar for headings, lists, links and images." />
          {errors.contentHtml && <p role="alert" className="text-xs text-a-red mt-1">{errors.contentHtml}</p>}
        </div>

        <Box title={kind === "posts" ? "Excerpt" : "Short description"}>
          <Field label="" htmlFor="desc" error={errors.summary || errors.excerpt} counter={<Counter value={seoDesc ?? ""} max={160} />} hint="Shown on cards and in lists. Also used as the search-engine description unless you write one below.">
            <TextArea id="desc" rows={3} value={seoDesc ?? ""} onChange={(v) => set(kind === "posts" ? { excerpt: v } : { summary: v })} />
          </Field>
        </Box>

        {kind !== "posts" && (
          <Box title="FAQs (optional)" open={(f.faqs?.length ?? 0) > 0}>
            <p className="text-xs text-a-muted">Questions and answers shown on the page. They also help you appear in Google&apos;s FAQ results.</p>
            <FaqsEditor value={f.faqs} onChange={(v) => set({ faqs: v })} />
          </Box>
        )}

        <Box title="AI search & trust signals (GEO)" open={!!(f.answer || f.takeaways?.length || f.summaryTable?.length || f.sources?.length)}>
          <p className="text-xs text-a-muted">AI assistants (ChatGPT, Gemini, Perplexity) and Google quote pages that answer the question first, in short, well-structured blocks. Fill these in and they appear at the top of the page, with matching structured data.</p>
          <Field label="Answer-first summary" htmlFor="answer" counter={<WordCount value={f.answer ?? ""} min={40} max={70} />} hint="One direct paragraph that answers the main question. Shown first on the page as “Quick answer”.">
            <TextArea id="answer" rows={3} value={f.answer ?? ""} onChange={(v) => set({ answer: v })} />
          </Field>
          <Field label="Key takeaways" htmlFor="takeaways" hint="One bullet per line, 3 to 6 short points."><LinesField id="takeaways" rows={4} value={f.takeaways ?? []} onChange={(v) => set({ takeaways: v })} /></Field>
          <Field label="At-a-glance table" hint="Short facts as label / value rows (e.g. Who it is for · Typical timeline · Documents needed)."><PairsEditor value={f.summaryTable ?? []} onChange={(v) => set({ summaryTable: v })} a="label" b="value" addLabel="Add row" aPlace="Typical timeline" bPlace="Usually 2-3 working days" /></Field>
          <Field label="Sources & references" error={errors.sources} hint="Official pages you relied on. Shown at the bottom and added to the page's structured data as citations."><PairsEditor value={f.sources ?? []} onChange={(v) => set({ sources: v })} a="title" b="url" addLabel="Add source" aPlace="UAE Government Portal" bPlace="https://u.ae/en" /></Field>
          {kind !== "posts" && <Field label="Author / reviewer" htmlFor="geo-author" hint="Shown as “Written by …”. Leave empty for the default editorial team."><TextField id="geo-author" value={f.author ?? ""} onChange={(v) => set({ author: v })} placeholder="Al Anfal Doc Team" /></Field>}
        </Box>

        <Box title="Search engine listing (SEO)" open={false}>
          <SeoPanel seo={f.seo} onChange={(s) => set({ seo: s })} errors={errors} fallbackTitle={seoTitle} fallbackDescription={seoDesc ?? ""} path={path} siteUrl={ctx.siteUrl} siteName={ctx.siteName} />
          <details className="rounded-md border border-a-line">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-a-muted">Structured data (schema)</summary>
            <div className="p-4 border-t border-a-line">
              <SchemaPanel faqSchema={f.faqSchema} onFaqSchema={(v) => set({ faqSchema: v })} custom={f.schemaCustom} onCustom={(v) => set({ schemaCustom: v })} error={errors.schemaCustom} preview={preview} hasFaqs={kind !== "posts"} />
            </div>
          </details>
        </Box>
      </div>

      {/* ------------ sidebar ------------ */}
      <aside className="space-y-5 xl:sticky xl:top-4">
        {kind !== "posts" && (
          <Box title="Featured image">
          <ImageField src={f.image} alt={f.imageAlt} error={errors.imageAlt} onChange={(src, alt) => set({ image: src, imageAlt: alt })} label="" />
          </Box>
        )}

        <section className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
          <h2 className="px-3 py-2.5 font-semibold text-[14px] border-b border-a-line">Publish</h2>
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button type="button" disabled={pending || f.status === "published"} onClick={() => save("draft")} className={btnGhost}>Save Draft</button>
              <button type="button" disabled={previewing} onClick={openPreview} className={btnGhost}>Preview</button>
            </div>
            <ul className="text-[13px] space-y-2.5 text-a-text">
              <li className="flex flex-wrap items-center gap-1.5">
                <Icon name="thumbtack" className="text-a-subtle" />Status: <strong>{f.status === "draft" ? "Draft" : future ? "Scheduled" : "Published"}</strong>
                {editStatus ? (
                  <span className="inline-flex items-center gap-1.5 w-full pl-6">
                    <select aria-label="Status" value={f.status} onChange={(e) => set({ status: e.target.value })} className="px-1.5 py-1 border border-a-line2 rounded-[3px] bg-a-surface"><option value="draft">Draft</option><option value="published">Published</option></select>
                    <button type="button" className={btnGhost} onClick={() => setEditStatus(false)}>OK</button>
                  </span>
                ) : <button type="button" onClick={() => setEditStatus(true)} className="text-brand-text underline">Edit</button>}
              </li>
              <li className="flex flex-wrap items-center gap-1.5">
                <Icon name="calendar" className="text-a-subtle" />
                {f.publishAt ? <>{future ? "Schedule for" : "Published on"}: <strong>{new Date(f.publishAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong></> : <strong>Publish immediately</strong>}
                {editDate ? (
                  <span className="inline-flex flex-col gap-1.5 w-full pl-6">
                    <input id="publishAt" type="datetime-local" aria-label="Publish date" value={f.publishAt} onChange={(e) => set({ publishAt: e.target.value })} className={inputCls} />
                    <span className="flex gap-1.5"><button type="button" className={btnGhost} onClick={() => setEditDate(false)}>OK</button><button type="button" className="text-brand-text underline" onClick={() => { set({ publishAt: "" }); setEditDate(false); }}>Publish immediately</button></span>
                    {errors.publishAt && <span role="alert" className="text-xs text-a-red">{errors.publishAt}</span>}
                  </span>
                ) : <button type="button" onClick={() => setEditDate(true)} className="text-brand-text underline">Edit</button>}
              </li>
            </ul>
            {id && initial?.updatedAt && <p className="text-xs text-a-muted">Last edited {new Date(initial.updatedAt).toLocaleString("en-GB")}</p>}
            {msg && <p role={msg.ok ? "status" : "alert"} className={`text-[13px] px-2.5 py-1.5 border-l-4 ${msg.ok ? "bg-a-surface border-brand text-brand" : "bg-a-surface border-a-red text-a-red"}`}>{msg.text}{!msg.ok && errorList.length > 1 && " (see the highlighted fields)"}</p>}
            {!msg && dirty && <p className="text-xs text-amber-300">You have unsaved changes.</p>}
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-a-raised border-t border-a-line">
            {id ? (
              <form action={trashItem.bind(null, kind, id)}><button className="text-[13px] text-a-red underline hover:text-a-red/80">Move to Trash</button></form>
            ) : <span />}
            <button type="button" disabled={pending} onClick={() => save("published")} className={btnPrimary}>{pending ? "Saving…" : f.status === "published" ? (future ? "Schedule" : "Update") : future ? "Schedule" : "Publish"}</button>
          </div>
          {id && isLive && <p className="px-3 py-2 text-[13px] border-t border-a-line"><Link href={path} target="_blank" className="text-brand-text underline">View on website ↗</Link></p>}
        </section>

        {kind === "posts" && (
          <>
            <Box title="Categories"><CategoryBox value={f.category} onChange={(v) => set({ category: v })} options={ctx.categories} error={errors.category} /></Box>
            <Box title="Tags"><TagBox value={f.tags ?? []} onChange={(v) => set({ tags: v })} options={ctx.tags} /></Box>
            <Box title="Author" open={false}><TextField id="author" value={f.author ?? ""} onChange={(v) => set({ author: v })} /></Box>
          </>
        )}

        {kind === "services" && (
          <Box title="Service details">
            <Field label="Icon" htmlFor="icon" error={errors.icon} hint="A Font Awesome name, e.g. passport, building, language">
              <div className="flex gap-2 items-center"><span className="w-10 h-10 shrink-0 rounded-full bg-brand-50 text-brand-text flex items-center justify-center"><Icon name={f.icon || "briefcase"} /></span><TextField id="icon" value={f.icon} onChange={(v) => set({ icon: v })} /></div>
            </Field>
            <Toggle checked={!!f.featured} onChange={(v) => set({ featured: v })} label="Featured service (shown first on the home page)" />
            <details><summary className="cursor-pointer text-sm font-medium text-a-muted">Related services</summary><div className="pt-3"><CheckList options={ctx.services.filter((s) => s.value !== f.slug)} value={f.relatedSlugs} onChange={(v) => set({ relatedSlugs: v })} /></div></details>
          </Box>
        )}

        {kind === "countries" && (
          <Box title="Country details">
            <div className="rounded-md border border-a-line p-3 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-16 h-12 rounded bg-a-raised border border-a-line flex items-center justify-center text-2xl"><Flag country={f as never} size={44} /></span>
                <div className="text-sm"><p className="font-medium">Flag</p><p className="text-xs text-a-muted">{f.flagImage ? "Using your uploaded image" : builtinFlag(emojiToCode(f.flag)) ? "Using the built-in flag" : "No flag image yet"}</p></div>
              </div>
              <Field label="Pick a built-in flag" htmlFor="flagpick">
                <select id="flagpick" value={f.flagImage?.startsWith("/flags/") ? f.flagImage : ""} onChange={(e) => set({ flagImage: e.target.value })} className={inputCls}>
                  <option value="">Automatic / none</option>
                  {BUILTIN_FLAGS.map((c) => <option key={c} value={`/flags/${c}.svg`}>{c.toUpperCase()} - {new Intl.DisplayNames(["en"], { type: "region" }).of(c.toUpperCase())}</option>)}
                </select>
              </Field>
              <ImageField label="…or upload a flag image" showAlt={false} src={f.flagImage?.startsWith("/flags/") ? "" : f.flagImage} alt="" onChange={(src) => set({ flagImage: src })} />
              <Field label="Flag emoji (fallback)" htmlFor="flag" hint="Used only if there is no image."><TextField id="flag" value={f.flag} onChange={(v) => set({ flag: v })} placeholder="🇦🇺" /></Field>
            </div>
            <Field label="Headline" htmlFor="headline"><TextField id="headline" value={f.headline} onChange={(v) => set({ headline: v })} placeholder="Study. Work. Live in…" /></Field>
            <Field label="Tagline" htmlFor="tagline"><TextField id="tagline" value={f.tagline} onChange={(v) => set({ tagline: v })} /></Field>
            <Field label="Banner colour (when there is no image)">
              <div className="flex flex-wrap gap-2">{GRADIENTS.map((g) => <button key={g} type="button" aria-label={g} onClick={() => set({ gradient: g })} className={`w-9 h-7 rounded bg-gradient-to-br ${g} border ${f.gradient === g ? "ring-2 ring-brand border-brand" : "border-a-line"}`} />)}</div>
            </Field>
            <Toggle checked={!!f.featured} onChange={(v) => set({ featured: v })} label="Featured country" />
            <details open={(f.regions?.length ?? 0) > 0}>
              <summary className="cursor-pointer text-sm font-medium text-a-text">States / provinces ({f.regions?.length ?? 0}) <span className="text-a-muted font-normal">· shown instead of "Big Cities", great for local search</span></summary>
              <div className="pt-3 space-y-4">
                <Field label="Section name" htmlFor="regionsLabel" hint="Shown as the heading, e.g. States, Provinces, Regions"><TextField id="regionsLabel" value={f.regionsLabel ?? ""} onChange={(v) => set({ regionsLabel: v })} placeholder="States" /></Field>
                <RegionsEditor value={f.regions ?? []} onChange={(v) => set({ regions: v })} />
              </div>
            </details>
            <details><summary className="cursor-pointer text-sm font-medium text-a-muted">Sidebar links & related services</summary>
              <div className="pt-3 space-y-4">
                <Field label="Visa categories (links)" hint="Leave empty to list the related services."><PairsEditor value={f.categories ?? []} onChange={(v) => set({ categories: v })} a="title" b="href" addLabel="Add link" aPlace="Study Visa" bPlace="/services/visa-processing" /></Field>
                <Field label="Related services"><CheckList options={ctx.services} value={f.serviceSlugs} onChange={(v) => set({ serviceSlugs: v })} /></Field>
              </div>
            </details>
          </Box>
        )}

        {id && (
          <Box title="More actions" open={false}>
            <form action={duplicateItem.bind(null, kind, id)}><button className={`${btnGhost} w-full`}><Icon name="copy" />Duplicate as draft</button></form>
          </Box>
        )}
      </aside>
    </div>
  );
}
