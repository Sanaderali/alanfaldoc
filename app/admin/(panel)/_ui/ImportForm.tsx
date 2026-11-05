"use client";

import { useRef, useState, useTransition } from "react";
import Icon from "@/app/components/Icon";
import { Badge } from "../../ui";
import { btnPrimary } from "../../ui";
import { importPack, type ImportResult } from "../import-actions";

/** Upload a content pack (JSON). New items are created as drafts; same-URL items are updated. */
export default function ImportForm() {
  const file = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"draft" | "keep" | "schedule">("draft");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [res, setRes] = useState<ImportResult | null>(null);
  const [pending, start] = useTransition();

  const pick = async (f?: File) => {
    setRes(null);
    if (!f) { setName(""); setText(""); return; }
    setName(`${f.name} (${Math.round(f.size / 1024)} KB)`);
    setText(await f.text());
  };
  const run = () => start(async () => setRes(await importPack(text, mode)));
  const tone = { created: "ok", updated: "info", error: "error" } as const;

  return (
    <div className="max-w-4xl space-y-5">
      <section className="bg-a-surface border border-a-line p-4 space-y-4">
        <div>
          <label htmlFor="pack" className="text-sm font-medium">Content pack (.json)</label>
          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            <input ref={file} id="pack" type="file" accept=".json,application/json" onChange={(e) => pick(e.target.files?.[0])} className="text-sm" />
            {name && <span className="text-xs text-a-muted">{name}</span>}
          </div>
        </div>
        <fieldset className="space-y-2 text-sm">
          <legend className="font-medium mb-1">If a page with the same URL already exists</legend>
          <label className="flex items-start gap-2"><input type="radio" name="mode" checked={mode === "draft"} onChange={() => setMode("draft")} className="mt-1" /><span><strong>Update it and save it as a draft</strong> (safest: the live page is taken offline until you review and publish it).</span></label>
          <label className="flex items-start gap-2"><input type="radio" name="mode" checked={mode === "keep"} onChange={() => setMode("keep")} className="mt-1" /><span><strong>Update it and keep its current status</strong> (a live page goes live with the new text straight away).</span></label>
          <label className="flex items-start gap-2"><input type="radio" name="mode" checked={mode === "schedule"} onChange={() => setMode("schedule")} className="mt-1" /><span><strong>Schedule blog posts</strong> that carry a publishing day in the pack: they are published automatically on those days (day 1 = tomorrow). Everything else is saved as a draft.</span></label>
        </fieldset>
        <p className="text-xs text-a-muted">A pack can hold services, countries, service changes (featured / hide), FAQ groups and reviews. New pages, FAQ groups and reviews are always created as drafts. Open each one, read it, then press Publish.</p>
        <button type="button" onClick={run} disabled={pending || !text} className={btnPrimary}>{pending ? "Importing…" : "Import"}</button>
      </section>

      {res && (
        <section className="bg-a-surface border border-a-line">
          <h2 className="px-4 py-3 font-semibold text-sm border-b border-a-line">{res.message ? <span className="text-a-red">{res.message}</span> : res.ok ? <><Icon name="circle-check" className="text-brand mr-1.5" />Import finished</> : "Import finished with problems"}</h2>
          {res.rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="text-left border-b border-a-line"><th className="px-3 py-2 font-normal">Type</th><th className="px-3 py-2 font-normal">Title</th><th className="px-3 py-2 font-normal">URL</th><th className="px-3 py-2 font-normal">Result</th></tr></thead>
                <tbody>{res.rows.map((r, n) => (
                  <tr key={n} className={`align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                    <td className="px-3 py-2">{r.kind}</td><td className="px-3 py-2">{r.title}</td><td className="px-3 py-2 text-a-muted">{r.slug}</td>
                    <td className="px-3 py-2"><Badge tone={tone[r.result]}>{r.result}</Badge>{r.message && <div className="text-xs text-a-red mt-1">{r.message}</div>}</td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
