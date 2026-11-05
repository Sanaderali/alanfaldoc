"use client";

import { useCallback, useEffect, useState } from "react";
import { LANGUAGES } from "@/lib/languages";
import { btnPrimary } from "../../ui";

type Job = { running: boolean; lang: string; langs: string[]; pagesDone: number; pagesTotal: number; stringsDone: number; stringsTotal: number; startedAt: number; finishedAt?: number; error?: string; log: string[] };

export default function TranslationsRunner() {
  const langs = LANGUAGES.filter((l) => l.code !== "en");
  const [picked, setPicked] = useState<string[]>(langs.map((l) => l.code));
  const [scope, setScope] = useState<"core" | "main" | "all">("core");
  const [job, setJob] = useState<Job | null>(null);
  const [ai, setAi] = useState(true);
  const [msg, setMsg] = useState("");
  const tick = useCallback(async () => { const r = await fetch("/admin/api/translations", { cache: "no-store" }); if (r.ok) { const d = await r.json(); setJob(d.job); setAi(d.ai); } }, []);
  useEffect(() => { void tick(); const t = setInterval(() => void tick(), 2500); return () => clearInterval(t); }, [tick]);
  const start = async () => {
    setMsg("");
    const r = await fetch("/admin/api/translations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ langs: picked, scope }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(d.message ?? "Could not start."); void tick();
  };
  const pct = job && job.stringsTotal ? Math.min(100, Math.round((job.stringsDone / job.stringsTotal) * 100)) : 0;
  return (
    <div className="space-y-4 max-w-3xl">
      {!ai && <p className="text-[13px] text-amber-300">GROQ_API_KEY is not set on the server, so translating is not possible yet.</p>}
      <fieldset className="bg-a-surface border border-a-line p-4">
        <legend className="px-1 text-[13px] font-semibold">Languages</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
          {langs.map((l) => <label key={l.code} className="inline-flex items-center gap-1.5"><input type="checkbox" checked={picked.includes(l.code)} onChange={(e) => setPicked(e.target.checked ? [...picked, l.code] : picked.filter((x) => x !== l.code))} />{l.english} <span className="text-a-subtle">({l.name})</span></label>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-5 text-[13px]">
          <label className="inline-flex items-center gap-1.5"><input type="radio" name="scope" checked={scope === "core"} onChange={() => setScope("core")} />Core pages (home, about, contact, services, countries, blog, FAQs, header and footer) - fastest</label>
          <label className="inline-flex items-center gap-1.5"><input type="radio" name="scope" checked={scope === "main"} onChange={() => setScope("main")} />Main pages (home, about, contact, lists, every service and country page)</label>
          <label className="inline-flex items-center gap-1.5"><input type="radio" name="scope" checked={scope === "all"} onChange={() => setScope("all")} />Every page in the sitemap (slower)</label>
        </div>
        <div className="mt-4"><button type="button" onClick={start} disabled={!!job?.running || !picked.length || !ai} className={btnPrimary}>{job?.running ? "Translating…" : "Translate the site now"}</button>{msg && <span role="alert" className="ml-3 text-[13px] text-a-red">{msg}</span>}</div>
      </fieldset>
      {job && (
        <div className="bg-a-surface border border-a-line p-4 text-[13px] space-y-2" role="status">
          <p>{job.running ? (job.pagesDone < job.pagesTotal ? `Reading pages… ${job.pagesDone} of ${job.pagesTotal}` : `Translating ${LANGUAGES.find((l) => l.code === job.lang)?.english ?? job.lang}…`) : job.error ? `Stopped: ${job.error}` : `Finished in ${Math.round(((job.finishedAt ?? Date.now()) - job.startedAt) / 1000)} seconds.`}</p>
          {job.stringsTotal > 0 && <div className="h-2 bg-a-raised border border-a-line"><div className="h-full bg-brand" style={{ width: `${pct}%` }} /></div>}
          {job.stringsTotal > 0 && <p className="text-a-muted">{job.stringsDone} of {job.stringsTotal} sentences checked ({pct}%)</p>}
          {job.log.length > 0 && <p className="text-a-subtle">{job.log.slice(-3).join(" · ")}</p>}
        </div>
      )}
    </div>
  );
}
