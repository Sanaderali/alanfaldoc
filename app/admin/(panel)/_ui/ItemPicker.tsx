"use client";

import { useMemo, useState } from "react";

export type PickItem = { id: string; label: string; status?: string };

/**
 * A checkbox for a whole group plus an expandable list to choose single items.
 * `selected` holds the chosen ids; an empty group is simply unticked.
 */
export default function ItemPicker({ items, selected, onChange }: { items: PickItem[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => items.filter((i) => !q || i.label.toLowerCase().includes(q.toLowerCase())), [items, q]);
  const set = new Set(selected);
  const toggle = (id: string) => onChange(set.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <details className="mt-1.5 ml-6 text-[13px]">
      <summary className="cursor-pointer text-brand-text">Choose items ({selected.length} of {items.length} selected)</summary>
      <div className="mt-2 border border-a-line bg-a-raised p-2">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search items" className="px-2 py-1 text-[13px] border border-a-line2 rounded-[3px] w-44 bg-a-surface" />
          <button type="button" onClick={() => onChange(items.map((i) => i.id))} className="text-brand-text hover:underline">Select all</button>
          <button type="button" onClick={() => onChange([])} className="text-brand-text hover:underline">Clear</button>
          {q && <button type="button" onClick={() => onChange([...new Set([...selected, ...shown.map((i) => i.id)])])} className="text-brand-text hover:underline">Select the {shown.length} shown</button>}
        </div>
        <ul className="max-h-56 overflow-y-auto space-y-1">
          {shown.map((i) => (
            <li key={i.id}><label className="flex items-start gap-2"><input type="checkbox" checked={set.has(i.id)} onChange={() => toggle(i.id)} className="mt-0.5" /><span>{i.label}{i.status && i.status !== "published" && <span className="ml-1.5 text-a-subtle">({i.status})</span>}</span></label></li>
          ))}
          {shown.length === 0 && <li className="text-a-muted">Nothing matches.</li>}
        </ul>
      </div>
    </details>
  );
}
