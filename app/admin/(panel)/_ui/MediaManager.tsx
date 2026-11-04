"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";
import type { MediaItem } from "@/types/content";
import { btnGhost, btnPrimary, inputCls } from "../../ui";
import { deleteMedia, updateMedia } from "../actions";

function Card({ m }: { m: MediaItem }) {
  const router = useRouter();
  const [alt, setAlt] = useState(m.alt);
  const [caption, setCaption] = useState(m.caption ?? "");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) => start(async () => { const r = await fn(); setMsg(r.message ?? ""); if (r.ok) router.refresh(); });
  return (
    <li className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/uploads/${m.file}`} alt={m.alt} loading="lazy" className="w-full h-40 object-cover bg-gray-100" />
      <div className="p-3 space-y-2 flex-1">
        <input value={alt} onChange={(e) => setAlt(e.target.value)} aria-label="Alt text" placeholder="Alt text (required)" className={inputCls} />
        <input value={caption} onChange={(e) => setCaption(e.target.value)} aria-label="Caption" placeholder="Caption (optional)" className={inputCls} />
        <p className="text-xs text-gray-400">{m.width}×{m.height} · {(m.bytes / 1024).toFixed(0)} KB</p>
        {msg && <p role="status" className="text-xs text-gray-600">{msg}</p>}
      </div>
      <div className="flex gap-2 p-3 pt-0">
        <button type="button" disabled={pending} onClick={() => run(() => updateMedia(m.id, alt, caption))} className={`${btnGhost} flex-1`}>Save</button>
        <button type="button" onClick={() => navigator.clipboard?.writeText(`/uploads/${m.file}`).then(() => setMsg("URL copied"))} className={btnGhost} aria-label="Copy URL"><Icon name="copy" /></button>
        <button type="button" disabled={pending} onClick={() => confirm("Delete this image?") && run(() => deleteMedia(m.id))} className="px-3 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50" aria-label="Delete"><Icon name="trash-can" /></button>
      </div>
    </li>
  );
}

export default function MediaManager({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setErr("");
    if (!alt.trim()) return setErr("Write the alt text first (describe the image).");
    setBusy(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", alt);
      const r = await fetch("/admin/api/upload", { method: "POST", body: fd });
      if (!r.ok) { setErr((await r.json()).error ?? "Upload failed"); break; }
    }
    setBusy(false);
    setAlt("");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-3">
        <h2 className="font-semibold">Upload image</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text: describe the image (required)" aria-label="Alt text" className={inputCls} />
          <label className={`${btnPrimary} cursor-pointer whitespace-nowrap`}>{busy ? "Uploading…" : "Choose file"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden disabled={busy} onChange={(e) => upload(e.target.files)} /></label>
        </div>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <p className="text-xs text-gray-500">JPG, PNG, WebP or GIF up to 8 MB. Images are resized to 1600px wide and converted to WebP for speed. SVG is not accepted.</p>
      </div>
      {items.length === 0 ? <p className="text-sm text-gray-500 text-center py-10">No images yet.</p> : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">{items.map((m) => <Card key={m.id} m={m} />)}</ul>
      )}
    </div>
  );
}
