"use client";

import { useState } from "react";
import { btnGhost, inputCls } from "../../ui";

type Opt = { name: string; count: number };

/** WordPress "Categories" box (single choice here: each post has one main category). */
export function CategoryBox({ value, onChange, options, error }: { value: string; onChange: (v: string) => void; options: Opt[]; error?: string }) {
  const [tab, setTab] = useState<"all" | "used">("all");
  const [adding, setAdding] = useState(false);
  const [extra, setExtra] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const names = [...new Set([...options.map((o) => o.name), ...extra, ...(value ? [value] : [])])];
  const list = tab === "all" ? [...names].sort((a, b) => a.localeCompare(b)) : [...names].sort((a, b) => (options.find((o) => o.name === b)?.count ?? 0) - (options.find((o) => o.name === a)?.count ?? 0));

  return (
    <div>
      <div className="flex text-[13px] border-b border-a-line" role="tablist">
        {([["all", "All Categories"], ["used", "Most Used"]] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-2.5 py-1.5 -mb-px border ${tab === k ? "border-a-line border-b-white bg-a-surface font-medium" : "border-transparent text-brand-text"}`}>{l}</button>
        ))}
      </div>
      <ul className="max-h-40 overflow-y-auto border border-t-0 border-a-line p-2 space-y-1.5 text-[13px]">
        {list.length === 0 && <li className="text-a-muted">No categories yet.</li>}
        {list.map((n) => (
          <li key={n}><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="post-category" checked={value === n} onChange={() => onChange(n)} className="text-brand focus:ring-brand" />{n}</label></li>
        ))}
      </ul>
      {error && <p role="alert" className="text-xs text-a-red mt-1">{error}</p>}
      {adding ? (
        <div className="mt-2 flex gap-2">
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const n = draft.trim(); if (n) { setExtra((x) => [...x, n]); onChange(n); setDraft(""); setAdding(false); } } }} placeholder="New category name" aria-label="New category name" className={inputCls} />
          <button type="button" className={btnGhost} onClick={() => { const n = draft.trim(); if (n) { setExtra((x) => [...x, n]); onChange(n); setDraft(""); setAdding(false); } }}>Add</button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="mt-2 text-[13px] text-brand-text hover:underline">+ Add New Category</button>
      )}
    </div>
  );
}

/** WordPress "Tags" box: type + Add, removable chips, "Choose from the most used tags". */
export function TagBox({ value, onChange, options }: { value: string[]; onChange: (v: string[]) => void; options: Opt[] }) {
  const [draft, setDraft] = useState("");
  const [cloud, setCloud] = useState(false);
  const add = (raw: string) => {
    const incoming = raw.split(",").map((t) => t.trim()).filter(Boolean);
    if (incoming.length) onChange([...new Set([...value, ...incoming])]);
    setDraft("");
  };
  const popular = [...options].sort((a, b) => b.count - a.count).slice(0, 20);
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); } }} aria-label="Add tag" className={inputCls} />
        <button type="button" onClick={() => add(draft)} className={btnGhost}>Add</button>
      </div>
      <p className="text-xs italic text-a-muted">Separate tags with commas</p>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((t) => (
            <li key={t} className="inline-flex items-center gap-1 text-[13px] bg-a-canvas border border-a-line rounded-[3px] pl-2 pr-1 py-0.5">
              {t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="w-4 h-4 leading-none text-a-muted hover:text-a-red">×</button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => setCloud((c) => !c)} className="text-[13px] text-brand-text underline">Choose from the most used tags</button>
      {cloud && (
        <ul className="flex flex-wrap gap-x-2.5 gap-y-1 text-[13px]">
          {popular.length === 0 && <li className="text-a-muted">No tags yet.</li>}
          {popular.map((o) => <li key={o.name}><button type="button" onClick={() => add(o.name)} className="text-brand-text hover:underline">{o.name}</button></li>)}
        </ul>
      )}
    </div>
  );
}
