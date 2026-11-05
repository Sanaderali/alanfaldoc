"use client";

import { useRef, useState, useTransition } from "react";
import Icon from "@/app/components/Icon";
import { Badge, btnPrimary } from "../../ui";
import type { ImportResult } from "../import-core";
import ItemPicker, { type PickItem } from "./ItemPicker";

type Mode = "draft" | "keep" | "restore" | "schedule";
const LABELS: Record<string, string> = { services: "Services", countries: "Countries", posts: "Blog posts", landings: "Service × Country pages", faqs: "FAQ groups", reviews: "Reviews", pages: "Page SEO settings", knowledge: "AI knowledge", regions: "States / regions", servicePatches: "Service changes", countryPatches: "Country changes" };
const labelOf = (x: Record<string, unknown>) => String(x.title ?? x.name ?? x.key ?? x.question ?? x.slug ?? "(untitled)");

type Section = { key: string; label: string; items: PickItem[]; kind: "list" | "translations" };

/** Upload a file (an export, or a content pack), see what is inside, tick what to import, then import it. */
export default function ImportPanel() {
  const [fileName, setFileName] = useState("");
  const [pack, setPack] = useState<Record<string, unknown> | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [on, setOn] = useState<string[]>([]);
  const [chosen, setChosen] = useState<Record<string, string[]>>({});
  const [mode, setMode] = useState<Mode>("draft");
  const [err, setErr] = useState("");
  const [res, setRes] = useState<ImportResult | null>(null);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const pick = async (f?: File) => {
    setRes(null); setErr(""); setPack(null); setSections([]); setOn([]); setChosen({});
    if (!f) { setFileName(""); return; }
    setFileName(`${f.name} (${Math.round(f.size / 1024)} KB)`);
    let p: Record<string, unknown>;
    try { p = JSON.parse(await f.text()); } catch { setErr("That file is not valid JSON."); return; }
    if (!p || typeof p !== "object" || Array.isArray(p)) { setErr("The file must be a JSON object (an export or a content pack)."); return; }
    // a translations-only file has the language codes at the top: { "ar": { "English": "translation" }, "de": { ... } }
    const CODES = ["ar", "zh", "hi", "de", "fr", "ja", "ko", "it", "es", "nl"];
    if (!p.translations && CODES.some((c) => p[c] && typeof p[c] === "object" && !Array.isArray(p[c]))) {
      p = { ...Object.fromEntries(Object.entries(p).filter(([k]) => !CODES.includes(k))), translations: Object.fromEntries(CODES.filter((c) => p[c] && typeof p[c] === "object" && !Array.isArray(p[c])).map((c) => [c, p[c]])) };
    }
    const found: Section[] = [];
    for (const [k, label] of Object.entries(LABELS)) {
      const list = p[k];
      if (Array.isArray(list) && list.length) found.push({ key: k, label, kind: "list", items: (list as Record<string, unknown>[]).map((x, i) => ({ id: String(i), label: labelOf(x), status: typeof x.status === "string" ? x.status : undefined })) });
    }
    const t = p.translations;
    if (t && typeof t === "object" && !Array.isArray(t)) {
      const langs = Object.entries(t as Record<string, Record<string, string>>).filter(([, m]) => m && typeof m === "object");
      if (langs.length) found.push({ key: "translations", label: "Translations", kind: "translations", items: langs.map(([l, m]) => ({ id: l, label: `${l} (${Object.keys(m).length} sentences)` })) });
    }
    if (!found.length) { setErr("Nothing importable was found in this file."); return; }
    setPack(p); setSections(found);
    setOn(found.map((s) => s.key));
    setChosen(Object.fromEntries(found.map((s) => [s.key, s.items.map((i) => i.id)])));
  };

  const run = () => {
    if (!pack) return;
    const out: Record<string, unknown> = {};
    for (const s of sections) {
      if (!on.includes(s.key)) continue;
      const ids = new Set(chosen[s.key] ?? []);
      if (s.kind === "translations") {
        const t = pack.translations as Record<string, unknown>;
        out.translations = Object.fromEntries(Object.entries(t).filter(([l]) => ids.has(l)));
      } else out[s.key] = (pack[s.key] as unknown[]).filter((_, i) => ids.has(String(i)));
    }
    start(async () => {
      try {
        const r = await fetch("/admin/api/data/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pack: out, mode }) });
        setRes(await r.json());
      } catch { setRes({ ok: false, message: "The import could not be completed (connection lost). Check what was imported, then run it again: it is safe to repeat.", rows: [] }); }
    });
  };

  const picked = (s: Section) => (chosen[s.key] ?? []).length;
  const nothing = sections.every((s) => !on.includes(s.key) || picked(s) === 0);
  const tone = { created: "ok", updated: "info", error: "error" } as const;

  return (
    <div className="max-w-4xl space-y-5">
      <section className="bg-a-surface border border-a-line p-4 space-y-4">
        <div>
          <label htmlFor="file" className="text-sm font-medium">1. Choose a file (.json): an export from this dashboard or a content pack</label>
          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            <input ref={input} id="file" type="file" accept=".json,application/json" onChange={(e) => void pick(e.target.files?.[0])} className="text-sm" />
            {fileName && <span className="text-xs text-a-muted">{fileName}</span>}
          </div>
          {err && <p role="alert" className="mt-2 text-sm text-a-red">{err}</p>}
        </div>

        {sections.length > 0 && (
          <>
            <div>
              <h2 className="text-sm font-medium mb-2">2. Tick what to import</h2>
              <ul className="space-y-3">
                {sections.map((s) => (
                  <li key={s.key} className="text-sm">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={on.includes(s.key)} onChange={(e) => setOn(e.target.checked ? [...on, s.key] : on.filter((x) => x !== s.key))} /><strong>{s.label}</strong> <span className="text-a-muted">({picked(s)} of {s.items.length})</span></label>
                    {on.includes(s.key) && <ItemPicker items={s.items} selected={chosen[s.key] ?? []} onChange={(v) => setChosen({ ...chosen, [s.key]: v })} />}
                  </li>
                ))}
              </ul>
            </div>
            <fieldset className="space-y-2 text-sm">
              <legend className="font-medium mb-1">3. If something with the same URL already exists</legend>
              <label className="flex items-start gap-2"><input type="radio" name="mode" checked={mode === "draft"} onChange={() => setMode("draft")} className="mt-1" /><span><strong>Update it and save it as a draft</strong> (safest: nothing goes live until you review and publish it).</span></label>
              <label className="flex items-start gap-2"><input type="radio" name="mode" checked={mode === "keep"} onChange={() => setMode("keep")} className="mt-1" /><span><strong>Update it and keep its current status</strong> (new items still arrive as drafts).</span></label>
              <label className="flex items-start gap-2"><input type="radio" name="mode" checked={mode === "restore"} onChange={() => setMode("restore")} className="mt-1" /><span><strong>Restore exactly as exported</strong> (published stays published, drafts stay drafts): use this to restore a backup. Needs the publish permission.</span></label>
              <label className="flex items-start gap-2"><input type="radio" name="mode" checked={mode === "schedule"} onChange={() => setMode("schedule")} className="mt-1" /><span><strong>Schedule blog posts</strong> that carry a publishing day (day 1 = tomorrow). Everything else is saved as a draft.</span></label>
            </fieldset>
            <button type="button" onClick={run} disabled={pending || nothing} className={btnPrimary}><Icon name="file-import" />{pending ? "Importing…" : "Import selected"}</button>
          </>
        )}
      </section>

      {res && (
        <section className="bg-a-surface border border-a-line">
          <h2 className="px-4 py-3 font-semibold text-sm border-b border-a-line">{res.message ? <span className="text-a-red">{res.message}</span> : res.ok ? <><Icon name="circle-check" className="text-brand mr-1.5" />Import finished</> : "Import finished with problems"}</h2>
          {res.rows.length > 0 && (
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="text-left border-b border-a-line"><th className="px-3 py-2 font-normal">Type</th><th className="px-3 py-2 font-normal">Title</th><th className="px-3 py-2 font-normal">URL</th><th className="px-3 py-2 font-normal">Result</th></tr></thead>
                <tbody>{res.rows.map((r, n) => (
                  <tr key={n} className={`align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                    <td className="px-3 py-2">{r.kind}</td><td className="px-3 py-2">{r.title}</td><td className="px-3 py-2 text-a-muted">{r.slug}</td>
                    <td className="px-3 py-2"><Badge tone={tone[r.result]}>{r.result}</Badge>{r.message && <div className={`text-xs mt-1 ${r.result === "error" ? "text-a-red" : "text-a-muted"}`}>{r.message}</div>}</td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
