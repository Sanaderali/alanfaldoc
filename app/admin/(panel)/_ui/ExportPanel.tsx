"use client";

import { useState } from "react";
import Icon from "@/app/components/Icon";
import { btnPrimary } from "../../ui";
import ItemPicker, { type PickItem } from "./ItemPicker";

type Type = { key: string; label: string; hint: string };
type Lang = { code: string; name: string; total: number; exportable: number };

/** Choose what to export (whole groups or single items) and download it as one JSON file. */
export default function ExportPanel({ types, lists, langs }: { types: Type[]; lists: Record<string, PickItem[]>; langs: Lang[] }) {
  const [on, setOn] = useState<string[]>(["services", "countries", "posts"]);
  const [ids, setIds] = useState<Record<string, string[]>>(() => Object.fromEntries(Object.entries(lists).map(([k, v]) => [k, v.map((i) => i.id)])));
  const [status, setStatus] = useState<"all" | "published">("all");
  const [pickedLangs, setPickedLangs] = useState<string[]>(langs.filter((l) => l.exportable > 0).map((l) => l.code));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const count = (k: string) => (k === "translations" ? langs.filter((l) => pickedLangs.includes(l.code)).reduce((n, l) => n + l.exportable, 0) : (ids[k] ?? []).length);
  const total = (k: string) => (k === "translations" ? langs.reduce((n, l) => n + l.exportable, 0) : (lists[k] ?? []).length);

  const download = async () => {
    setBusy(true); setMsg("");
    try {
      const body = { types: on, status, langs: pickedLangs, ids: Object.fromEntries(on.filter((k) => lists[k]).map((k) => [k, ids[k].length === lists[k].length ? null : ids[k]])) };
      const r = await fetch("/admin/api/data/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) { setMsg((await r.json().catch(() => ({}))).error ?? "Export failed."); setBusy(false); return; }
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = r.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "export.json";
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
      setMsg("Downloaded. Keep the file safe: you can import it again on this or another site.");
    } catch { setMsg("Export failed. Check your connection."); }
    setBusy(false);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <section className="bg-a-surface border border-a-line p-4 space-y-3">
        <h2 className="font-semibold text-sm">What do you want to export?</h2>
        <ul className="space-y-3">
          {types.map((t) => (
            <li key={t.key} className="text-sm">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={on.includes(t.key)} onChange={(e) => setOn(e.target.checked ? [...on, t.key] : on.filter((x) => x !== t.key))} className="mt-1" />
                <span><strong>{t.label}</strong> <span className="text-a-muted">({count(t.key)} of {total(t.key)})</span><br /><span className="text-xs text-a-muted">{t.hint}</span></span>
              </label>
              {on.includes(t.key) && lists[t.key] && lists[t.key].length > 0 && <ItemPicker items={lists[t.key]} selected={ids[t.key] ?? []} onChange={(v) => setIds({ ...ids, [t.key]: v })} />}
              {on.includes(t.key) && t.key === "translations" && (
                <div className="mt-1.5 ml-6 text-[13px]">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {langs.map((l) => <label key={l.code} className={`inline-flex items-center gap-1.5 ${l.exportable ? "" : "opacity-50"}`}><input type="checkbox" disabled={!l.exportable} checked={pickedLangs.includes(l.code)} onChange={(e) => setPickedLangs(e.target.checked ? [...pickedLangs, l.code] : pickedLangs.filter((x) => x !== l.code))} />{l.name} <span className="text-a-subtle">({l.exportable})</span></label>)}
                  </div>
                  <p className="mt-1 text-a-subtle">Only sentences whose English text is on record can be exported (everything translated or imported with this version qualifies).</p>
                </div>
              )}
            </li>
          ))}
        </ul>
        <fieldset className="pt-2 border-t border-a-line text-sm">
          <legend className="font-medium mb-1">Which status?</legend>
          <label className="mr-5 inline-flex items-center gap-1.5"><input type="radio" name="st" checked={status === "all"} onChange={() => setStatus("all")} />Everything (published, drafts and scheduled): best for a backup</label>
          <label className="inline-flex items-center gap-1.5"><input type="radio" name="st" checked={status === "published"} onChange={() => setStatus("published")} />Published only</label>
        </fieldset>
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" onClick={download} disabled={busy || on.length === 0} className={btnPrimary}><Icon name="download" />{busy ? "Preparing…" : "Download export"}</button>
          {msg && <span role="status" className="text-[13px] text-a-muted">{msg}</span>}
        </div>
      </section>
      <p className="text-xs text-a-muted">Uploaded images are not inside the file: they live in your content folder&apos;s <code>uploads</code> folder, so copy that folder as well for a complete backup. Customer chats and tickets are not exported here (they hold personal data); the separate &quot;Download backup&quot; in the account menu includes them.</p>
    </div>
  );
}
