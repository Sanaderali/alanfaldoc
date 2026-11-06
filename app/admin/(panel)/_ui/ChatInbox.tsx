"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/app/components/Icon";
import { askDesktopPermission, desktopNotify, flashTitle, playBeep, setSoundEnabled, soundEnabled } from "../../alerts";
import { btnGhost, btnPrimary } from "../../ui";

type Summary = { id: string; name: string; phone: string; status: "open" | "closed"; unread: number; lastAt: string; createdAt: string; preview: string; lastFrom?: string; country?: string; city?: string };
type Msg = { id: string; from: "visitor" | "staff" | "system" | "ai"; name?: string; text: string; at: string; src?: "local" | "groq" };
type Profile = { name?: string; email?: string; nationality?: string; basedIn?: string; businessType?: string; companyName?: string; visaStatus?: string; stayDuration?: string; travelHistory?: string; query?: string };
type Selected = { id: string; name: string; phone: string; status: "open" | "closed"; createdAt: string; ip?: string; country?: string; city?: string; page?: string; referrer?: string; userAgent?: string; language?: string; handledBy?: string; profile?: Profile | null; returning?: { count: number; lastAt: string } | null; followUp?: boolean; summary?: string; closedBy?: "visitor" | "staff"; closedByName?: string; closedAt?: string; feedback?: { rating: number; comment?: string; at: string } | null; aiPaused?: boolean; aiReplies?: number; total: number; messages: Msg[] };

const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};
const device = (ua = "") => `${/Mobile|Android|iPhone/i.test(ua) ? "Mobile" : "Desktop"} · ${/Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser"}`;

/** Real-time chat inbox (polls every 2s). Plays a sound + visual alert for every new chat or visitor message. */
export default function ChatInbox({ canReply, initialId }: { canReply: boolean; initialId?: string }) {
  const [chats, setChats] = useState<Summary[]>([]);
  const [aiOn, setAiOn] = useState(false);
  const [aiState, setAiState] = useState<"ok" | "no-key" | "off">("no-key");
  const [aiTest, setAiTest] = useState<{ ok: boolean; message: string } | "busy" | null>(null);
  const [sel, setSel] = useState<Selected | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sound, setSound] = useState(true);
  const [toast, setToast] = useState<{ id: string; text: string } | null>(null);
  const [mobileThread, setMobileThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const seen = useRef<Map<string, number>>(new Map()); // chat id -> unread count last time
  const first = useRef(true);
  const selRef = useRef<{ id: string | null; total: number }>({ id: null, total: 0 });
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { setSound(soundEnabled()); }, []);
  useEffect(() => { if (initialId) { selRef.current = { id: initialId, total: 0 }; setSelId(initialId); setMobileThread(true); } }, [initialId]);
  useEffect(() => { selRef.current.id = selId; if (!selId) { setSel(null); selRef.current.total = 0; } }, [selId]);

  const tick = useCallback(async () => {
    const { id, total } = selRef.current;
    try {
      const r = await fetch(`/admin/api/chat${id ? `?id=${id}&since=${total}` : ""}`, { cache: "no-store" });
      if (!r.ok) return;
      const d: { chats: Summary[]; selected: Selected | null; ai?: boolean; aiStatus?: "ok" | "no-key" | "off" } = await r.json();
      setChats(d.chats);
      setAiOn(!!d.ai);
      if (d.aiStatus) setAiState(d.aiStatus);
      setLoaded(true);

      // ---- alerts: new chat, or more unread messages than before (for chats you are not looking at right now) ----
      let alertText = "";
      for (const c of d.chats) {
        const prev = seen.current.get(c.id);
        const viewing = c.id === selRef.current.id && !document.hidden;
        if (!first.current && !viewing && c.unread > (prev ?? 0)) alertText = prev === undefined ? `New chat from ${c.name || c.phone}` : `New message from ${c.name || c.phone}`;
        seen.current.set(c.id, c.unread);
      }
      first.current = false;
      if (alertText) {
        playBeep();
        flashTitle(`● ${alertText}`);
        desktopNotify("Live chat", alertText);
        setToast({ id: d.chats.find((c) => c.unread > 0)?.id ?? "", text: alertText });
        setTimeout(() => setToast(null), 6000);
      }

      // ---- selected conversation ----
      if (d.selected && d.selected.id === selRef.current.id) {
        setSel((cur) => {
          if (!cur || cur.id !== d.selected!.id) { selRef.current.total = d.selected!.total; return d.selected; }
          if (d.selected!.messages.length === 0 && cur.status === d.selected!.status) return cur;
          selRef.current.total = d.selected!.total;
          return { ...d.selected!, messages: [...cur.messages, ...d.selected!.messages] };
        });
        const row = d.chats.find((c) => c.id === d.selected!.id);
        if (row && row.unread > 0 && !document.hidden) { void fetch("/admin/api/chat/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row.id }) }); if (d.selected.messages.some((m) => m.from === "visitor")) playBeep(); }
      }
    } catch { /* offline: try again on the next tick */ }
  }, []);

  useEffect(() => {
    void tick();
    const t = setInterval(() => void tick(), 2000);
    return () => clearInterval(t);
  }, [tick]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [sel?.messages.length, sel?.id]);

  const open = (id: string) => { selRef.current = { id, total: 0 }; setSelId(id); setSel(null); setMobileThread(true); setError(""); void tick(); };
  const post = async (url: string, body: object) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const send = async () => {
    if (!sel || !text.trim()) return;
    setSending(true); setError("");
    const r = await post("/admin/api/chat/reply", { id: sel.id, text });
    setSending(false);
    if (!r.ok) return setError("Could not send. Check your connection.");
    setText(""); void tick();
  };
  const setAi = async (paused: boolean) => { if (!sel) return; setSel({ ...sel, aiPaused: paused }); await post("/admin/api/chat/ai", { id: sel.id, paused }); void tick(); };
  const runAiTest = async () => { setAiTest("busy"); try { const r = await post("/admin/api/chat/ai-test", {}); setAiTest(await r.json()); } catch { setAiTest({ ok: false, message: "Could not run the test." }); } };
  const [note, setNote] = useState("");
  const learn = async (messageId: string) => { if (!sel) return; const r = await post("/admin/api/chat/learn", { id: sel.id, messageId }); const d = await r.json().catch(() => ({})); setNote(r.ok ? "Saved. The assistant will use this answer from now on (Dashboard > AI knowledge)." : d.error ?? "Could not save."); setTimeout(() => setNote(""), 6000); };
  const summarize = async () => { if (!sel) return; setNote("Creating summary…"); const r = await post("/admin/api/chat/summarize", { id: sel.id }); const d = await r.json().catch(() => ({})); setNote(r.ok ? "" : d.error ?? "Could not create a summary."); void tick(); };
  const setStatus = async (status: "open" | "closed") => { if (!sel) return; await post("/admin/api/chat/status", { id: sel.id, status }); void tick(); };
  const toggleSound = () => { const n = !sound; setSound(n); setSoundEnabled(n); if (n) { playBeep(); void askDesktopPermission(); } };

  return (
    <div className="relative bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] grid lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_280px] h-[calc(100vh-9rem)] min-h-[32rem]">
      {toast && (
        <button type="button" onClick={() => { if (toast.id) open(toast.id); setToast(null); }} className="absolute z-20 top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-a-bar text-white text-[13px] px-4 py-2.5 shadow-lg border-l-4 border-brand animate-slide-down">
          <Icon name="bell" />{toast.text}
        </button>
      )}

      {/* ---------- conversation list ---------- */}
      <section className={`border-r border-a-line flex flex-col min-h-0 ${mobileThread ? "hidden lg:flex" : "flex"}`}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-a-line">
          <h2 className="font-semibold text-[14px]">Conversations</h2>
          <button type="button" onClick={toggleSound} aria-pressed={sound} title={sound ? "Sound alerts on" : "Sound alerts off"} className={`inline-flex items-center gap-1.5 text-[12px] px-2 py-1 border rounded-[3px] ${sound ? "border-brand text-brand-text" : "border-a-line text-a-muted"}`}><Icon name={sound ? "volume-high" : "volume-xmark"} />{sound ? "Sound on" : "Sound off"}</button>
        </div>
        {canReply && (
          <div className="px-3 py-2 border-b border-a-line text-[12px] text-a-muted">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5"><span className={`inline-block h-2 w-2 rounded-full ${aiState === "ok" ? "bg-green-500" : "bg-amber-400"}`} aria-hidden="true" />AI assistant: {aiState === "ok" ? "on" : aiState === "off" ? "switched off (AI_CHAT=off)" : "not configured"}</span>
              <button type="button" onClick={runAiTest} disabled={aiTest === "busy"} className={btnGhost}>{aiTest === "busy" ? "Testing…" : "Test AI"}</button>
            </div>
            {aiTest && aiTest !== "busy" && <p role="status" className={`mt-1.5 ${aiTest.ok ? "text-green-500" : "text-amber-300"}`}>{aiTest.message}</p>}
          </div>
        )}
        <ul className="flex-1 overflow-y-auto divide-y divide-a-line">
          {!loaded && <li className="p-4 text-[13px] text-a-muted">Loading…</li>}
          {loaded && chats.length === 0 && <li className="p-6 text-[13px] text-a-muted text-center">No chats yet. When a visitor starts a chat you will hear a sound and see it here instantly.</li>}
          {chats.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => open(c.id)} className={`w-full text-left px-3 py-2.5 hover:bg-a-raised ${selId === c.id ? "bg-brand-50" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-[13px] ${c.unread ? "font-bold" : "font-medium"}`}>{c.name || c.phone}</span>
                  <span className="text-[11px] text-a-subtle whitespace-nowrap">{ago(c.lastAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="truncate text-xs text-a-muted">{c.lastFrom === "staff" ? "You: " : ""}{c.preview}</span>
                  {c.unread > 0 ? <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-a-red text-white text-[11px] font-semibold flex items-center justify-center">{c.unread}</span> : c.status === "closed" ? <span className="text-[10px] uppercase text-a-subtle">closed</span> : <span className="w-2 h-2 rounded-full bg-brand" title="open" />}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- thread ---------- */}
      <section className={`flex-col min-h-0 min-w-0 ${mobileThread ? "flex" : "hidden lg:flex"}`}>
        {!sel ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-a-muted p-6 text-center">{selId ? "Loading conversation…" : "Select a conversation"}</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-a-line">
              <div className="flex items-center gap-2 min-w-0">
                <button type="button" onClick={() => setMobileThread(false)} className="lg:hidden text-brand-text" aria-label="Back"><Icon name="arrow-left" /></button>
                <div className="min-w-0"><p className="font-semibold text-[14px] truncate">{sel.name || "Visitor"}</p><a href={`tel:${sel.phone}`} className="text-xs text-brand-text">{sel.phone}</a></div>
              </div>
              {canReply && aiOn && sel.status === "open" && (sel.aiPaused ? <button type="button" onClick={() => setAi(false)} className={btnGhost} title="The assistant is silent in this chat. Click to let it answer visitor messages again.">Resume AI assistant</button> : <span className="inline-flex items-center gap-2 text-[12px] text-a-muted"><span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />AI assistant answering<button type="button" onClick={() => setAi(true)} className={btnGhost}>Take over</button></span>)}
              {canReply && (sel.status === "open" ? <button type="button" onClick={() => setStatus("closed")} className={btnGhost}>Close chat</button> : <button type="button" onClick={() => setStatus("open")} className={btnGhost}>Reopen</button>)}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-a-raised" aria-live="polite">
              {sel.messages.map((m) =>
                m.from === "system" ? (
                  <p key={m.id} className="text-center text-xs text-a-subtle">{m.text}</p>
                ) : (
                  <div key={m.id} className={`flex ${m.from === "staff" || m.from === "ai" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${m.from === "staff" ? "bg-brand text-a-on" : m.from === "ai" ? "bg-a-surface border border-brand/50" : "bg-a-surface border border-a-line"}`}>
                      <p className={`text-[11px] mb-0.5 ${m.from === "staff" ? "text-a-on/70" : "text-a-subtle"}`}>{m.from === "staff" ? m.name || "Agent" : m.from === "ai" ? `AI assistant${m.src === "local" ? " · library" : m.src === "groq" ? " · Groq" : ""}` : sel.name || "Visitor"} · {new Date(m.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                      {m.text}
                      {m.from === "staff" && canReply && <button type="button" onClick={() => learn(m.id)} className="block mt-1 text-[11px] underline opacity-70 hover:opacity-100" title="Let the assistant use this answer for similar questions">Learn from this reply</button>}
                    </div>
                  </div>
                )
              )}
              <div ref={bottom} />
            </div>
            {canReply ? (
              <div className="p-3 border-t border-a-line space-y-2">
                {error && <p role="alert" className="text-xs text-a-red">{error}</p>}
                {sel.status === "closed" && <p className="text-xs text-a-muted">This chat is closed. Sending a reply reopens it.</p>}
                <div className="flex gap-2">
                  <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={2} aria-label="Reply" placeholder="Type a reply… (Enter to send, Shift+Enter for a new line)" className="flex-1 px-2.5 py-1.5 border border-a-line2 rounded-[3px] text-[13px] bg-a-surface focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                  <button type="button" onClick={send} disabled={sending || !text.trim()} className={btnPrimary}><Icon name="paper-plane" />Send</button>
                </div>
              </div>
            ) : <p className="p-3 border-t border-a-line text-xs text-a-muted">You can view this chat but not reply.</p>}
          </>
        )}
      </section>

      {/* ---------- visitor info ---------- */}
      <aside className="hidden xl:block border-l border-a-line overflow-y-auto">
        <h2 className="px-3 py-2.5 font-semibold text-[14px] border-b border-a-line">Visitor</h2>
        {sel ? (
          <dl className="p-3 text-[13px] space-y-3">
            {([
              ["Name", sel.name || "Not given"], ["Phone", sel.phone], ["IP address", sel.ip || "-"],
              ["Location", [sel.city, sel.country].filter(Boolean).join(", ") || "Unknown"], ["Page", sel.page || "-"], ["Came from", sel.referrer || "Direct"],
              ["Device", device(sel.userAgent)], ["Language", sel.language || "-"], ["Started", new Date(sel.createdAt).toLocaleString("en-GB")], ["Handled by", sel.handledBy || "Unassigned (first reply claims it)"],
            ] as [string, string][]).map(([k, v]) => <div key={k}><dt className="text-[11px] uppercase tracking-wide text-a-subtle">{k}</dt><dd className="break-all">{v}</dd></div>)}
          </dl>
        ) : <p className="p-3 text-[13px] text-a-muted">Select a conversation to see visitor details.</p>}
        {sel && (
          <div className="p-3 border-t border-a-line text-[13px] space-y-3">
            {sel.returning && <p className="px-2 py-1.5 border border-brand/60 text-brand-text">Returning client: this phone number chatted {sel.returning.count} time{sel.returning.count === 1 ? "" : "s"} before (last {new Date(sel.returning.lastAt).toLocaleDateString("en-GB")}). <a href={`/admin/enquiries?q=${encodeURIComponent(sel.phone)}`} className="underline">See earlier chats</a></p>}
            {sel.followUp && <p className="px-2 py-1.5 border border-amber-400/60 text-amber-300">The assistant promised this client a follow-up. Reply to clear this flag.</p>}
            <h3 className="font-semibold text-[13px]">Client details (noted from the chat)</h3>
            <dl className="space-y-2">
              {([["Name", sel.profile?.name], ["Email", sel.profile?.email], ["Nationality", sel.profile?.nationality], ["Based in", sel.profile?.basedIn], ["Business", sel.profile?.businessType], ["Company", sel.profile?.companyName], ["Visa / in or out of UAE", sel.profile?.visaStatus], ["Length of stay", sel.profile?.stayDuration], ["Travel history", sel.profile?.travelHistory], ["Wants", sel.profile?.query]] as [string, string | undefined][]).map(([k, v]) => <div key={k}><dt className="text-[11px] uppercase tracking-wide text-a-subtle">{k}</dt><dd className={v ? "break-words" : "text-a-subtle"}>{v || "Not mentioned yet"}</dd></div>)}
            </dl>
            <div>
              <div className="flex items-center justify-between"><h3 className="font-semibold text-[13px]">Summary</h3>{canReply && <button type="button" onClick={summarize} className={btnGhost}>{sel.summary ? "Refresh" : "Create"}</button>}</div>
              <p className={`mt-1 whitespace-pre-wrap ${sel.summary ? "" : "text-a-subtle"}`}>{sel.summary || "No summary yet. It is created automatically when the chat is closed."}</p>
            </div>
            {sel.status === "closed" && <p className="text-a-muted">Closed by <strong>{sel.closedBy === "visitor" ? "the client" : sel.closedByName || "staff"}</strong>{sel.closedAt ? ` · ${new Date(sel.closedAt).toLocaleString("en-GB")}` : ""}</p>}
            {sel.feedback && <p className="text-a-muted"><span className="text-amber-400">{"★".repeat(sel.feedback.rating)}{"☆".repeat(5 - sel.feedback.rating)}</span>{sel.feedback.comment ? ` "${sel.feedback.comment}"` : ""}</p>}
            {note && <p role="status" className="text-a-muted">{note}</p>}
          </div>
        )}
      </aside>
    </div>
  );
}
