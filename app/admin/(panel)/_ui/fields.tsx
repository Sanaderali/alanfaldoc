"use client";

import { useEffect, useState, type ReactNode } from "react";
import Icon from "@/app/components/Icon";
import type { MediaItem } from "@/types/content";
import { btnGhost, btnPrimary, inputCls } from "../../ui";

/** Reusable form controls for the dashboard editors. All controlled; the editor owns the state. */

export type Errors = Record<string, string>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Form = Record<string, any>;

export function Section({ title, hint, children, id }: { title: string; hint?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)]">
      <div className="px-5 py-4 border-b border-a-line">
        <h2 className="font-semibold">{title}</h2>
        {hint && <p className="text-xs text-a-muted mt-0.5">{hint}</p>}
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, error, children, htmlFor, counter }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string; counter?: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-a-text">{label}</label>
        {counter}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-a-muted mt-1">{hint}</p>}
      {error && <p role="alert" className="text-xs text-a-red mt-1">{error}</p>}
    </div>
  );
}

/** "123 / 160" counter that turns amber/red outside the recommended range */
export function Counter({ value, min, max }: { value: string; min?: number; max: number }) {
  const n = value.trim().length;
  const tone = n > max ? "text-a-red" : min && n > 0 && n < min ? "text-amber-300" : "text-a-subtle";
  return <span className={`text-xs tabular-nums ${tone}`}>{n} / {max}</span>;
}

export function TextField({ id, value, onChange, placeholder, type = "text", maxLength }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; maxLength?: number }) {
  return <input id={id} type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className={inputCls} />;
}

export function TextArea({ id, value, onChange, rows = 4, placeholder, mono }: { id: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; mono?: boolean }) {
  return <textarea id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${inputCls} ${mono ? "font-mono text-xs" : ""} resize-y`} />;
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative mt-0.5 w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-brand" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-a-surface rounded-full shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
      <span><span className="text-sm font-medium text-a-text">{label}</span>{hint && <span className="block text-xs text-a-muted">{hint}</span>}</span>
    </label>
  );
}

/** one item per line <-> string[] */
export function LinesField({ id, value, onChange, rows = 4, placeholder }: { id: string; value: string[]; onChange: (v: string[]) => void; rows?: number; placeholder?: string }) {
  const [text, setText] = useState((value ?? []).join("\n"));
  return <TextArea id={id} rows={rows} placeholder={placeholder} value={text} onChange={(t) => { setText(t); onChange(t.split("\n").map((l) => l.trim()).filter(Boolean)); }} />;
}

function Row({ children, onRemove, onUp, onDown, index }: { children: ReactNode; onRemove: () => void; onUp?: () => void; onDown?: () => void; index: number }) {
  return (
    <div className="border border-a-line rounded-md p-3 bg-a-raised/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-a-subtle">#{index + 1}</span>
        <div className="flex gap-1">
          {onUp && <button type="button" onClick={onUp} aria-label="Move up" className="px-2 py-1 text-a-muted hover:text-a-text"><Icon name="arrow-up" /></button>}
          {onDown && <button type="button" onClick={onDown} aria-label="Move down" className="px-2 py-1 text-a-muted hover:text-a-text"><Icon name="arrow-down" /></button>}
          <button type="button" onClick={onRemove} aria-label="Remove" className="px-2 py-1 text-a-red hover:text-a-red/80"><Icon name="trash-can" /></button>
        </div>
      </div>
      {children}
    </div>
  );
}

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const c = [...arr];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
}

export function Repeater<T>({ items, onChange, render, empty, addLabel, blank }: { items: T[]; onChange: (v: T[]) => void; render: (item: T, set: (patch: Partial<T>) => void, i: number) => ReactNode; empty: T; addLabel: string; blank?: string }) {
  const list = items ?? [];
  return (
    <div className="space-y-3">
      {list.length === 0 && blank && <p className="text-sm text-a-muted">{blank}</p>}
      {list.map((it, i) => (
        <Row key={i} index={i} onRemove={() => onChange(list.filter((_, n) => n !== i))} onUp={i > 0 ? () => onChange(move(list, i, -1)) : undefined} onDown={i < list.length - 1 ? () => onChange(move(list, i, 1)) : undefined}>
          {render(it, (patch) => onChange(list.map((x, n) => (n === i ? { ...x, ...patch } : x))), i)}
        </Row>
      ))}
      <button type="button" onClick={() => onChange([...list, { ...empty }])} className={btnGhost}><Icon name="plus" />{addLabel}</button>
    </div>
  );
}

type Faq = { question: string; answer: string };
/** Collapsible Q&A list: one question open at a time, so long lists stay tidy. */
export function FaqsEditor({ value, onChange }: { value: Faq[]; onChange: (v: Faq[]) => void }) {
  const list = value ?? [];
  const [open, setOpen] = useState<number | null>(null);
  const patch = (i: number, p: Partial<Faq>) => onChange(list.map((x, n) => (n === i ? { ...x, ...p } : x)));
  const swap = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= list.length) return; const c = [...list]; [c[i], c[j]] = [c[j], c[i]]; onChange(c); setOpen(j); };
  return (
    <div className="space-y-2">
      {list.length === 0 && <p className="text-sm text-a-muted">No questions yet.</p>}
      {list.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`border rounded-md ${isOpen ? "border-brand/50 bg-a-surface" : "border-a-line bg-a-raised/60"}`}>
            <div className="flex items-center">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 text-left">
                <Icon name="chevron-right" className={`text-xs text-a-subtle transition-transform ${isOpen ? "rotate-90" : ""}`} />
                <span className="text-xs font-semibold text-a-subtle">{i + 1}</span>
                <span className="truncate text-sm font-medium text-a-text">{f.question || <em className="text-a-subtle">New question</em>}</span>
              </button>
              <div className="flex pr-1">
                <button type="button" onClick={() => swap(i, -1)} disabled={i === 0} aria-label="Move up" className="px-2 py-1 text-a-subtle hover:text-a-text disabled:opacity-20"><Icon name="arrow-up" /></button>
                <button type="button" onClick={() => swap(i, 1)} disabled={i === list.length - 1} aria-label="Move down" className="px-2 py-1 text-a-subtle hover:text-a-text disabled:opacity-20"><Icon name="arrow-down" /></button>
                <button type="button" onClick={() => { onChange(list.filter((_, n) => n !== i)); setOpen(null); }} aria-label="Remove question" className="px-2 py-1 text-a-red hover:text-a-red/80"><Icon name="trash-can" /></button>
              </div>
            </div>
            {isOpen && (
              <div className="px-3 pb-3 pt-1 space-y-3 border-t border-a-line">
                <Field label="Question" htmlFor={`fq${i}`}><TextField id={`fq${i}`} value={f.question} onChange={(v) => patch(i, { question: v })} placeholder="e.g. How long does it take?" /></Field>
                <Field label="Answer" htmlFor={`fa${i}`}><TextArea id={`fa${i}`} rows={3} value={f.answer} onChange={(v) => patch(i, { answer: v })} /></Field>
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={() => { onChange([...list, { question: "", answer: "" }]); setOpen(list.length); }} className={btnGhost}><Icon name="plus" />Add question</button>
    </div>
  );
}

type Sec = { heading: string; minor?: boolean; paragraphs?: string[]; list?: string[]; twoColumns?: boolean };
export function SectionsEditor({ value, onChange }: { value: Sec[]; onChange: (v: Sec[]) => void }) {
  return (
    <Repeater<Sec> items={value} onChange={onChange} empty={{ heading: "", paragraphs: [], list: [] }} addLabel="Add section" blank="No sections yet."
      render={(s, set, i) => (
        <div className="space-y-3">
          <Field label="Heading" htmlFor={`sh${i}`}><TextField id={`sh${i}`} value={s.heading} onChange={(v) => set({ heading: v })} /></Field>
          <Field label="Paragraphs" hint="Separate paragraphs with a blank line" htmlFor={`sp${i}`}>
            <ParagraphsField id={`sp${i}`} value={s.paragraphs ?? []} onChange={(v) => set({ paragraphs: v })} />
          </Field>
          <Field label="Bullet list" hint="One bullet per line" htmlFor={`sl${i}`}><LinesField id={`sl${i}`} rows={3} value={s.list ?? []} onChange={(v) => set({ list: v })} /></Field>
          <div className="flex flex-wrap gap-6">
            <Toggle checked={!!s.minor} onChange={(v) => set({ minor: v })} label="Smaller heading (h3)" />
            <Toggle checked={!!s.twoColumns} onChange={(v) => set({ twoColumns: v })} label="List in two columns" />
          </div>
        </div>
      )} />
  );
}

export function ParagraphsField({ id, value, onChange }: { id: string; value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState((value ?? []).join("\n\n"));
  return <TextArea id={id} rows={4} value={text} onChange={(t) => { setText(t); onChange(t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)); }} />;
}

export function PairsEditor({ value, onChange, a, b, addLabel, aPlace, bPlace }: { value: Record<string, string>[]; onChange: (v: Record<string, string>[]) => void; a: string; b: string; addLabel: string; aPlace?: string; bPlace?: string }) {
  return (
    <Repeater<Record<string, string>> items={value} onChange={onChange} empty={{ [a]: "", [b]: "" }} addLabel={addLabel}
      render={(p, set, i) => (
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField id={`pa${a}${i}`} value={p[a]} onChange={(v) => set({ [a]: v })} placeholder={aPlace ?? a} />
          <TextField id={`pb${b}${i}`} value={p[b]} onChange={(v) => set({ [b]: v })} placeholder={bPlace ?? b} />
        </div>
      )} />
  );
}

export function CheckList({ options, value, onChange }: { options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  const set = new Set(value ?? []);
  return (
    <div className="grid sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={set.has(o.value)} onChange={(e) => { const n = new Set(set); e.target.checked ? n.add(o.value) : n.delete(o.value); onChange([...n]); }} className="rounded border-a-line2 text-brand focus:ring-brand" />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/* ---------------- media picker + image field ---------------- */

export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (m: MediaItem) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/admin/api/media").then((r) => r.json()).then((d) => setItems(d.items)).catch(() => setItems([]));
  }, [open]);

  if (!open) return null;
  const upload = async (file: File) => {
    setErr("");
    if (!alt.trim()) return setErr("Write the alt text first (describe the image)");
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt", alt);
    const r = await fetch("/admin/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Upload failed");
    onPick(d.item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Choose an image">
      <div className="bg-a-surface rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-a-line">
          <h3 className="font-semibold">Choose an image</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-a-muted hover:text-a-text"><Icon name="xmark" /></button>
        </div>
        <div className="p-5 border-b border-a-line bg-a-raised space-y-2">
          <p className="text-sm font-medium">Upload a new image</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text: describe the image (required)" className={inputCls} />
            <label className={`${btnPrimary} cursor-pointer whitespace-nowrap`}>
              {busy ? "Uploading…" : "Select file"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </div>
          {err && <p role="alert" className="text-xs text-a-red">{err}</p>}
          <p className="text-xs text-a-muted">JPG, PNG, WebP or GIF up to 8 MB. Resized to 1600px and converted to WebP automatically.</p>
        </div>
        <div className="p-5 overflow-y-auto">
          {!items ? <p className="text-sm text-a-muted">Loading…</p> : items.length === 0 ? <p className="text-sm text-a-muted">No images yet. Upload one above.</p> : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => { onPick(m); onClose(); }} className="group block w-full text-left border border-a-line rounded-lg overflow-hidden hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/uploads/${m.file}`} alt={m.alt} loading="lazy" className="w-full h-24 object-cover bg-a-line" />
                    <span className="block px-2 py-1.5 text-xs text-a-muted truncate">{m.alt}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function ImageField({ src, alt, onChange, error, label = "Cover image", showAlt = true }: { src?: string; alt?: string; onChange: (src: string, alt: string) => void; error?: string; label?: string; showAlt?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-a-text">{label}</p>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || ""} className="w-full h-36 object-cover rounded-md border border-a-line bg-a-line" />
      ) : (
        <div className="h-24 rounded-md border border-dashed border-a-line2 flex items-center justify-center text-sm text-a-subtle">No image</div>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(true)} className={btnGhost}><Icon name="image" />{src ? "Change" : "Choose"}</button>
        {src && <button type="button" onClick={() => onChange("", "")} className={btnGhost}>Remove</button>}
      </div>
      {src && showAlt && (
        <Field label="Alt text" error={error} hint="Describe what is in the image. Used by screen readers and image search." htmlFor={`alt-${label}`}>
          <TextField id={`alt-${label}`} value={alt ?? ""} onChange={(v) => onChange(src, v)} placeholder="e.g. Dubai skyline at sunset" />
        </Field>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(m) => onChange(`/uploads/${m.file}`, m.alt)} />
    </div>
  );
}

/* ---------------- SEO panel with live Google preview ---------------- */

export function SeoPanel({ seo, onChange, errors, fallbackTitle, fallbackDescription, path, siteUrl, siteName }: { seo: Form; onChange: (s: Form) => void; errors: Errors; fallbackTitle: string; fallbackDescription: string; path: string; siteUrl: string; siteName: string }) {
  const s = seo ?? {};
  const set = (patch: Form) => onChange({ ...s, ...patch });
  const title = (s.title || fallbackTitle || "Page title").trim();
  const desc = (s.description || fallbackDescription || "").trim();
  const keywords = Array.isArray(s.keywords) ? s.keywords.join(", ") : s.keywords ?? "";
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-a-line bg-a-surface p-4">
        <p className="text-xs text-a-muted mb-2">Google preview</p>
        <p className="text-xs text-a-muted truncate">{siteUrl.replace(/^https?:\/\//, "")}{path}</p>
        <p className="text-lg leading-snug text-[#8ab4f8] truncate">{title.length > 60 ? title.slice(0, 57) + "…" : title} | {siteName}</p>
        <p className="text-sm text-a-muted line-clamp-2">{desc.length > 160 ? desc.slice(0, 157) + "…" : desc || "No description. Search engines will pick text from the page."}</p>
      </div>
      <Field label="Meta title" htmlFor="seo-title" counter={<Counter value={s.title ?? ""} min={15} max={60} />} hint={`Leave empty to use "${fallbackTitle}"`}>
        <TextField id="seo-title" value={s.title ?? ""} onChange={(v) => set({ title: v })} />
      </Field>
      <Field label="Meta description" htmlFor="seo-desc" counter={<Counter value={s.description ?? ""} min={70} max={160} />} hint="120–160 characters works best. Leave empty to use the summary." error={errors["seo.description"]}>
        <TextArea id="seo-desc" rows={3} value={s.description ?? ""} onChange={(v) => set({ description: v })} />
      </Field>
      <details className="rounded-md border border-a-line">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-a-muted">Advanced SEO options</summary>
        <div className="p-4 pt-2 space-y-5 border-t border-a-line">
      <Field label="Keywords" htmlFor="seo-kw" hint="Comma separated. Optional, search engines mostly ignore them but AI tools and internal search can use them.">
        <TextField id="seo-kw" value={keywords} onChange={(v) => set({ keywords: v.split(",").map((x) => x.trim()).filter(Boolean) })} />
      </Field>
      <Field label="Canonical URL" htmlFor="seo-canon" error={errors["seo.canonical"]} hint="Only set if this content also exists on another URL. Default is the page's own URL.">
        <TextField id="seo-canon" value={s.canonical ?? ""} onChange={(v) => set({ canonical: v })} placeholder="https://" />
      </Field>
      <ImageField label="Social share image (Open Graph)" showAlt={false} src={s.image} alt="" onChange={(src) => set({ image: src })} />
      <Toggle checked={!!s.noindex} onChange={(v) => set({ noindex: v })} label="Hide from search engines (noindex)" hint="Also removes the page from the sitemap." />
        </div>
      </details>
    </div>
  );
}

export function SchemaPanel({ faqSchema, onFaqSchema, custom, onCustom, error, preview, hasFaqs }: { faqSchema: boolean; onFaqSchema: (v: boolean) => void; custom: string; onCustom: (v: string) => void; error?: string; preview: unknown; hasFaqs?: boolean }) {
  return (
    <div className="space-y-5">
      {hasFaqs !== false && <Toggle checked={faqSchema} onChange={onFaqSchema} label="FAQ schema (FAQPage)" hint="Adds structured data so Google and AI assistants can show these questions as rich answers. Always generated from the visible FAQs." />}
      <details className="rounded-md border border-a-line bg-a-raised">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium">Generated schema (automatic, read-only)</summary>
        <pre className="px-4 pb-4 text-xs overflow-auto max-h-80">{JSON.stringify(preview, null, 2)}</pre>
      </details>
      <Field label="Custom schema (advanced)" htmlFor="schema-custom" error={error} hint="Optional extra JSON-LD, e.g. a Review or HowTo. Must be valid JSON including @context and @type.">
        <TextArea id="schema-custom" rows={6} mono value={custom ?? ""} onChange={onCustom} placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "..."\n}'} />
      </Field>
    </div>
  );
}

