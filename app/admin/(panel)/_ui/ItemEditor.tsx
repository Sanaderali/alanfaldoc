"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";
import { articleLd, countryPageLd, faqLd, serviceLd } from "@/lib/seo";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { saveItem, deleteItem, duplicateItem } from "../actions";
import RichEditor from "./RichEditor";
import { CheckList, Counter, Field, FaqsEditor, ImageField, PairsEditor, SchemaPanel, SeoPanel, TextArea, TextField, Toggle, type Errors, type Form } from "./fields";

type Kind = "services" | "countries" | "posts";
export type EditorContext = { siteUrl: string; siteName: string; services: { value: string; label: string }[]; categories: string[] };

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
  const b = { status: "draft", publishAt: "", slug: "", image: "", imageAlt: "", faqSchema: true, schemaCustom: "", seo: {}, faqs: [], contentHtml: "" };
  if (kind === "services") return { ...b, title: "", icon: "briefcase", summary: "", relatedSlugs: [], serviceType: "" };
  if (kind === "countries") return { ...b, name: "", flag: "", tagline: "", headline: "", summary: "", facts: [], gradient: GRADIENTS[0], categories: [], serviceSlugs: [], featured: false };
  return { ...b, title: "", excerpt: "", category: "", author: "Al Anfal Doc Team", tags: [], readMinutes: "" };
}

function Box({ title, children, open, className = "" }: { title: string; children: React.ReactNode; open?: boolean; className?: string }) {
  return (
    <details open={open ?? true} className={`group bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 font-semibold text-sm select-none">
        {title}<Icon name="chevron-down" className="text-gray-400 text-xs transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100">{children}</div>
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
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
      {/* ------------ main column ------------ */}
      <div className="space-y-5 min-w-0">
        <div>
          <input
            value={f[titleKey]}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "countries" ? "Country name" : "Add title"}
            aria-label="Title"
            className="w-full px-4 py-3 text-2xl sm:text-3xl font-bold bg-white border border-gray-300 rounded-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          {errors[titleKey] && <p role="alert" className="text-xs text-red-600 mt-1">{errors[titleKey]}</p>}
          <p className="mt-2 text-sm text-gray-500 flex flex-wrap items-center gap-2">
            <span>Link:</span>
            {editSlug ? (
              <span className="inline-flex items-center gap-1">{base[kind]}<input aria-label="URL slug" value={f.slug} onChange={(e) => { slugTouched.current = true; set({ slug: slugify(e.target.value) }); }} className="px-2 py-1 text-sm border border-gray-300 rounded" /><button type="button" className="text-brand-text font-medium" onClick={() => setEditSlug(false)}>OK</button></span>
            ) : (
              <><span className="text-gray-800">{ctx.siteUrl.replace(/^https?:\/\//, "")}{path}</span><button type="button" onClick={() => setEditSlug(true)} className="text-brand-text font-medium hover:underline">Edit</button></>
            )}
          </p>
          {errors.slug && <p role="alert" className="text-xs text-red-600 mt-1">{errors.slug}</p>}
        </div>

        {kind === "countries" && (
          <Box title="Quick facts" className="!bg-white">
            <p className="text-xs text-gray-500">Short facts shown as a list at the top of the page (capital, language, currency…).</p>
            <PairsEditor value={f.facts} onChange={(v) => set({ facts: v })} a="label" b="value" addLabel="Add fact" aPlace="Capital" bPlace="Canberra" />
          </Box>
        )}

        <div>
          <RichEditor value={f.contentHtml} onChange={(html) => set({ contentHtml: html })} placeholder="Write your content here. Use the toolbar for headings, lists, links and images." />
          {errors.contentHtml && <p role="alert" className="text-xs text-red-600 mt-1">{errors.contentHtml}</p>}
        </div>

        <Box title={kind === "posts" ? "Excerpt" : "Short description"}>
          <Field label="" htmlFor="desc" error={errors.summary || errors.excerpt} counter={<Counter value={seoDesc ?? ""} max={160} />} hint="Shown on cards and in lists. Also used as the search-engine description unless you write one below.">
            <TextArea id="desc" rows={3} value={seoDesc ?? ""} onChange={(v) => set(kind === "posts" ? { excerpt: v } : { summary: v })} />
          </Field>
        </Box>

        {kind !== "posts" && (
          <Box title="FAQs (optional)" open={(f.faqs?.length ?? 0) > 0}>
            <p className="text-xs text-gray-500">Questions and answers shown on the page. They also help you appear in Google&apos;s FAQ results.</p>
            <FaqsEditor value={f.faqs} onChange={(v) => set({ faqs: v })} />
          </Box>
        )}

        <Box title="Search engine listing (SEO)" open={false}>
          <SeoPanel seo={f.seo} onChange={(s) => set({ seo: s })} errors={errors} fallbackTitle={seoTitle} fallbackDescription={seoDesc ?? ""} path={path} siteUrl={ctx.siteUrl} siteName={ctx.siteName} />
          <details className="rounded-md border border-gray-200">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700">Structured data (schema)</summary>
            <div className="p-4 border-t border-gray-100">
              <SchemaPanel faqSchema={f.faqSchema} onFaqSchema={(v) => set({ faqSchema: v })} custom={f.schemaCustom} onCustom={(v) => set({ schemaCustom: v })} error={errors.schemaCustom} preview={preview} hasFaqs={kind !== "posts"} />
            </div>
          </details>
        </Box>
      </div>

      {/* ------------ sidebar ------------ */}
      <aside className="space-y-5 xl:sticky xl:top-4">
        <Box title="Featured image">
          <ImageField src={f.image} alt={f.imageAlt} error={errors.imageAlt} onChange={(src, alt) => set({ image: src, imageAlt: alt })} label="" />
        </Box>

        <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="px-4 py-3 font-semibold text-sm border-b border-gray-100">Publish</h2>
          <div className="p-4 space-y-4">
            <p className="text-sm flex items-center gap-2">
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium ${isLive ? "text-emerald-700" : future ? "text-amber-700" : "text-gray-700"}`}>{f.status === "draft" ? "Draft" : future ? "Scheduled" : "Published"}</span>
            </p>
            <Field label="Publish date" htmlFor="publishAt" error={errors.publishAt} hint={future ? "Goes live automatically on this date." : "Leave empty to publish immediately. Pick a future date to schedule."}>
              <input id="publishAt" type="datetime-local" value={f.publishAt} onChange={(e) => set({ publishAt: e.target.value })} className={inputCls} />
            </Field>
            {id && initial?.updatedAt && <p className="text-xs text-gray-400">Last updated {new Date(initial.updatedAt).toLocaleString("en-GB")}</p>}

            {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm rounded-md px-3 py-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}{!msg.ok && errorList.length > 1 && " (see the highlighted fields)"}</p>}
            {!msg && dirty && <p className="text-xs text-amber-700">You have unsaved changes.</p>}

            <div className="flex flex-col gap-2">
              {f.status === "published" ? (
                <>
                  <button type="button" disabled={pending} onClick={() => save("published")} className={`${btnPrimary} w-full`}>{pending ? "Saving…" : "Update"}</button>
                  <button type="button" disabled={pending} onClick={() => save("draft")} className={`${btnGhost} w-full`}>Switch to draft</button>
                </>
              ) : (
                <>
                  <button type="button" disabled={pending} onClick={() => save("published")} className={`${btnPrimary} w-full`}>{pending ? "Saving…" : future ? "Schedule" : "Publish"}</button>
                  <button type="button" disabled={pending} onClick={() => save("draft")} className={`${btnGhost} w-full`}>Save draft</button>
                </>
              )}
              {id && isLive && <Link href={path} target="_blank" className="text-center text-sm text-brand-text hover:underline">View on website ↗</Link>}
            </div>
          </div>
        </section>

        {kind === "posts" && (
          <Box title="Post details">
            <Field label="Category" htmlFor="category" error={errors.category}>
              <input id="category" list="cats" value={f.category} onChange={(e) => set({ category: e.target.value })} className={inputCls} />
              <datalist id="cats">{ctx.categories.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Tags" htmlFor="tags" hint="Separate with commas"><TextField id="tags" value={(f.tags ?? []).join(", ")} onChange={(v) => set({ tags: v.split(",").map((x: string) => x.trim()).filter(Boolean) })} /></Field>
            <Field label="Author" htmlFor="author"><TextField id="author" value={f.author ?? ""} onChange={(v) => set({ author: v })} /></Field>
          </Box>
        )}

        {kind === "services" && (
          <Box title="Service details">
            <Field label="Icon" htmlFor="icon" error={errors.icon} hint="A Font Awesome name, e.g. passport, building, language">
              <div className="flex gap-2 items-center"><span className="w-10 h-10 shrink-0 rounded-full bg-brand-50 text-brand-text flex items-center justify-center"><Icon name={f.icon || "briefcase"} /></span><TextField id="icon" value={f.icon} onChange={(v) => set({ icon: v })} /></div>
            </Field>
            <details><summary className="cursor-pointer text-sm font-medium text-gray-700">Related services</summary><div className="pt-3"><CheckList options={ctx.services.filter((s) => s.value !== f.slug)} value={f.relatedSlugs} onChange={(v) => set({ relatedSlugs: v })} /></div></details>
          </Box>
        )}

        {kind === "countries" && (
          <Box title="Country details">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Flag" htmlFor="flag"><TextField id="flag" value={f.flag} onChange={(v) => set({ flag: v })} placeholder="🇦🇺" /></Field>
              <div className="col-span-2"><Field label="Headline" htmlFor="headline"><TextField id="headline" value={f.headline} onChange={(v) => set({ headline: v })} placeholder="Study. Work. Live in…" /></Field></div>
            </div>
            <Field label="Tagline" htmlFor="tagline"><TextField id="tagline" value={f.tagline} onChange={(v) => set({ tagline: v })} /></Field>
            <Field label="Banner colour (when there is no image)">
              <div className="flex flex-wrap gap-2">{GRADIENTS.map((g) => <button key={g} type="button" aria-label={g} onClick={() => set({ gradient: g })} className={`w-9 h-7 rounded bg-gradient-to-br ${g} border ${f.gradient === g ? "ring-2 ring-brand border-brand" : "border-gray-200"}`} />)}</div>
            </Field>
            <Toggle checked={!!f.featured} onChange={(v) => set({ featured: v })} label="Featured country" />
            <details><summary className="cursor-pointer text-sm font-medium text-gray-700">Sidebar links & related services</summary>
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
            <form action={deleteItem.bind(null, kind, id)} onSubmit={(e) => { if (!confirm(`Delete this ${singular[kind]} permanently? This cannot be undone.`)) e.preventDefault(); }}>
              <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50"><Icon name="trash-can" />Move to trash (delete)</button>
            </form>
          </Box>
        )}
      </aside>
    </div>
  );
}
