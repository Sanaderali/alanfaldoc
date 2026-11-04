"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { addTerm, deleteTerm, renameTerm } from "../actions";

type Row = { name: string; slug: string; count: number };

/** WordPress-style Categories / Tags screen: add form on the left, table on the right. */
export default function TermManager({ type, rows }: { type: "category" | "tag"; rows: Row[] }) {
  const router = useRouter();
  const label = type === "category" ? "Category" : "Tag";
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message?: string }>, after?: () => void) => start(async () => { const r = await fn(); setMsg(r.ok ? "" : r.message ?? "Error"); if (r.ok) { after?.(); router.refresh(); } });

  return (
    <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
      <section>
        <h2 className="text-[16px] font-semibold mb-3">Add New {label}</h2>
        <form onSubmit={(e) => { e.preventDefault(); run(() => addTerm(type, name), () => setName("")); }} className="space-y-3">
          <div>
            <label htmlFor="term-name" className="block text-[13px] font-semibold mb-1">Name</label>
            <input id="term-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            <p className="text-xs text-[#646970] mt-1">The name is how it appears on your site.</p>
          </div>
          {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
          <button type="submit" disabled={pending || !name.trim()} className={btnPrimary}>Add New {label}</button>
        </form>
      </section>

      <section className="bg-white border border-[#c3c4c7] shadow-[0_1px_1px_rgba(0,0,0,.04)] overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left border-b border-[#c3c4c7]"><th className="px-3 py-2.5 font-normal">Name</th><th className="px-3 py-2.5 font-normal">Slug</th><th className="px-3 py-2.5 font-normal text-right">Count</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={3} className="px-3 py-8 text-center text-[#50575e]">No {label.toLowerCase()}s found.</td></tr>}
            {rows.map((r, n) => (
              <tr key={r.name} className={`group align-top ${n % 2 ? "bg-white" : "bg-[#f6f7f7]"}`}>
                <td className="px-3 py-2.5">
                  {editing === r.name ? (
                    <form onSubmit={(e) => { e.preventDefault(); run(() => renameTerm(type, r.name, draft), () => setEditing(null)); }} className="flex gap-2">
                      <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="New name" className={inputCls} />
                      <button className={btnPrimary} disabled={pending}>Update</button>
                      <button type="button" className={btnGhost} onClick={() => setEditing(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <span className="font-semibold text-[14px] text-brand-text">{r.name}</span>
                      <div className="mt-1 flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity">
                        <button type="button" onClick={() => { setEditing(r.name); setDraft(r.name); }} className="text-brand-text hover:underline">Edit</button><span className="text-[#a7aaad]">|</span>
                        <button type="button" onClick={() => confirm(`Delete "${r.name}"? ${type === "category" ? "Its posts move to Uncategorized." : "It is removed from its posts."}`) && run(() => deleteTerm(type, r.name))} className="text-red-600 hover:underline">Delete</button><span className="text-[#a7aaad]">|</span>
                        <Link href={type === "category" ? `/admin/posts?cat=${r.slug}` : `/admin/posts?q=${encodeURIComponent(r.name)}`} className="text-brand-text hover:underline">View posts</Link>
                      </div>
                    </>
                  )}
                </td>
                <td className="px-3 py-2.5 text-[#50575e]">{r.slug}</td>
                <td className="px-3 py-2.5 text-right text-brand-text">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
