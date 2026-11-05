"use client";

import { useState } from "react";
import Icon from "@/app/components/Icon";
import type { Region } from "@/types/content";
import { btnGhost, inputCls } from "../../ui";
import { Field, FaqsEditor, PairsEditor, TextArea, TextField, Toggle } from "./fields";
import RichEditor from "./RichEditor";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

/**
 * States / provinces. Every state is a card on the country page; switch on "Give this state its own page" to publish a full page
 * at /countries/<country>/<state> (best for search). One state is open at a time.
 */
export default function RegionsEditor({ value, onChange, countrySlug }: { value: Region[]; onChange: (v: Region[]) => void; countrySlug: string }) {
  const list = value ?? [];
  const [bulk, setBulk] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const addBulk = () => {
    const rows = bulk.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [name = "", summary = "", cities = ""] = l.split("|").map((x) => x.trim());
      return { name, summary, cities } as Region;
    }).filter((r) => r.name);
    if (rows.length) { onChange([...list, ...rows]); setBulk(""); }
  };
  const patch = (i: number, p: Partial<Region>) => onChange(list.map((x, n) => (n === i ? { ...x, ...p } : x)));
  const swap = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= list.length) return; const c = [...list]; [c[i], c[j]] = [c[j], c[i]]; onChange(c); setOpen(j); };

  return (
    <div className="space-y-3">
      {list.map((r, i) => {
        const isOpen = open === i;
        const live = r.page === "published";
        return (
          <div key={i} className={`border rounded-md ${isOpen ? "border-brand/50" : "border-a-line"} bg-a-raised`}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm">
              <Icon name="chevron-right" className={`text-xs text-a-subtle transition-transform ${isOpen ? "rotate-90" : ""}`} />
              <span className="flex-1 min-w-0 truncate font-medium">{r.name || <em className="text-a-subtle">New state</em>}</span>
              {live ? <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand">Page live</span> : r.contentHtml ? <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300">Page draft</span> : <span className="text-xs text-a-subtle">card only</span>}
            </button>
            {isOpen && (
              <div className="px-3 pb-3 pt-3 space-y-4 border-t border-a-line">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Name" htmlFor={`rg-n${i}`}><TextField id={`rg-n${i}`} value={r.name} onChange={(v) => patch(i, { name: v })} placeholder="e.g. Punjab" /></Field>
                  <Field label="Main cities" htmlFor={`rg-c${i}`} hint="Comma separated"><TextField id={`rg-c${i}`} value={r.cities ?? ""} onChange={(v) => patch(i, { cities: v })} /></Field>
                </div>
                <Field label="Card text" htmlFor={`rg-s${i}`} hint="Short text on the country page card (1-2 sentences)."><TextArea id={`rg-s${i}`} rows={3} value={r.summary} onChange={(v) => patch(i, { summary: v })} /></Field>

                <div className="rounded-md border border-a-line p-3 space-y-4">
                  <Toggle checked={live} onChange={(v) => patch(i, { page: v ? "published" : "draft" })} label="Give this state its own page" hint={`Adds /countries/${countrySlug || "country"}/${r.slug || slugify(r.name) || "state"} to the website and sitemap, and links the card to it.`} />
                  <Field label="Page address (URL part)" htmlFor={`rg-u${i}`} hint="Leave empty to use the name."><TextField id={`rg-u${i}`} value={r.slug ?? ""} onChange={(v) => patch(i, { slug: slugify(v) })} placeholder={slugify(r.name)} /></Field>
                  <Field label="Page headline (H1)" htmlFor={`rg-h${i}`}><TextField id={`rg-h${i}`} value={r.headline ?? ""} onChange={(v) => patch(i, { headline: v })} placeholder={`e.g. ${r.name || "Punjab"} community in Dubai`} /></Field>
                  <Field label="Quick answer" htmlFor={`rg-a${i}`} counter={<span className={`text-xs ${words(r.answer ?? "") >= 40 && words(r.answer ?? "") <= 70 ? "text-brand" : "text-amber-300"}`}>{words(r.answer ?? "")} words · aim for 40-70</span>} hint="A direct answer search engines and AI assistants can quote. Only state what your sources support.">
                    <TextArea id={`rg-a${i}`} rows={3} value={r.answer ?? ""} onChange={(v) => patch(i, { answer: v })} />
                  </Field>
                  <Field label="At-a-glance facts" hint="Each fact should be sourced. Include the year, e.g. 'Indian community in the UAE (2023): about 3.5 million'."><PairsEditor value={(r.facts ?? []) as Record<string, string>[]} onChange={(v) => patch(i, { facts: v as never })} a="label" b="value" addLabel="Add fact" aPlace="Label" bPlace="Value (with year)" /></Field>
                  <div>
                    <p className="text-sm font-medium mb-1.5">Page content</p>
                    <RichEditor value={r.contentHtml ?? ""} onChange={(html) => patch(i, { contentHtml: html })} placeholder="Write the page: headings, text, lists and links to your services (/services/...), the country page and blog posts." />
                  </div>
                  <Field label="Frequently asked questions"><FaqsEditor value={r.faqs ?? []} onChange={(v) => patch(i, { faqs: v })} /></Field>
                  <Field label="Sources & references" hint="Original sources for the facts above. https:// links only."><PairsEditor value={(r.sources ?? []) as Record<string, string>[]} onChange={(v) => patch(i, { sources: v as never })} a="title" b="url" addLabel="Add source" aPlace="Ministry of External Affairs" bPlace="https://www.mea.gov.in" /></Field>
                  <details><summary className="cursor-pointer text-sm font-medium text-a-muted">Search engine title & description</summary>
                    <div className="pt-3 space-y-3">
                      <Field label="Meta title" htmlFor={`rg-mt${i}`}><TextField id={`rg-mt${i}`} value={r.seo?.title ?? ""} onChange={(v) => patch(i, { seo: { ...r.seo, title: v } })} /></Field>
                      <Field label="Meta description" htmlFor={`rg-md${i}`}><TextArea id={`rg-md${i}`} rows={2} value={r.seo?.description ?? ""} onChange={(v) => patch(i, { seo: { ...r.seo, description: v } })} /></Field>
                    </div>
                  </details>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => swap(i, -1)} disabled={i === 0} className={btnGhost}><Icon name="arrow-up" />Up</button>
                  <button type="button" onClick={() => swap(i, 1)} disabled={i === list.length - 1} className={btnGhost}><Icon name="arrow-down" />Down</button>
                  <button type="button" onClick={() => { onChange(list.filter((_, n) => n !== i)); setOpen(null); }} className="inline-flex items-center gap-2 px-3 py-1.5 border border-a-red/40 text-a-red text-[13px] font-medium rounded-[3px] hover:bg-a-red/10"><Icon name="trash-can" />Remove</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={() => { onChange([...list, { name: "", summary: "", cities: "" }]); setOpen(list.length); }} className={btnGhost}><Icon name="plus" />Add state</button>
      <details className="rounded-md border border-a-line p-3">
        <summary className="cursor-pointer text-sm font-medium text-a-muted">Paste many at once</summary>
        <p className="text-xs text-a-muted my-2">One state per line: <code>Name | card text | main cities</code>. Card text and cities are optional.</p>
        <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={6} placeholder={"Kerala | Known for backwaters and a strong Gulf link. | Kochi, Thiruvananthapuram\nGujarat | A major trading state. | Ahmedabad, Surat"} className={`${inputCls} font-mono text-xs`} />
        <button type="button" onClick={addBulk} disabled={!bulk.trim()} className={`${btnGhost} mt-2`}>Add these states</button>
      </details>
    </div>
  );
}
