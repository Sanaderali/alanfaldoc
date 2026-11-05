"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { readChat, writeChat } from "./ChatLauncher";
import { beep, flashTitle } from "./chatSound";

type Msg = { id: string; from: "visitor" | "staff" | "system" | "ai"; name?: string; text: string; at: string };

const addMsgs = (prev: Msg[], add: Msg[]) => { const seen = new Set(prev.map((m) => m.id)); const fresh = add.filter((m) => !seen.has(m.id)); return fresh.length ? [...prev, ...fresh] : prev; };

const PHONE_RE = /^\+?[0-9\s()-]{7,20}$/;

/** The chat window. No login: the visitor only gives a phone number (and optionally a name). */
export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const stored = typeof window !== "undefined" ? readChat() : null;
  const [chat, setChat] = useState<{ id: string; token: string } | null>(stored ? { id: stored.id, token: stored.token } : null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [trap, setTrap] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [closedBy, setClosedBy] = useState<"visitor" | "staff" | undefined>();
  const [rated, setRated] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [thanks, setThanks] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const total = useRef(0);
  const known = useRef<Set<string>>(new Set());
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const poll = useCallback(async () => {
    if (!chat) return;
    try {
      const r = await fetch(`/api/chat/poll?id=${chat.id}&token=${chat.token}&since=${total.current}`, { cache: "no-store" });
      if (r.status === 404 || r.status === 403) { writeChat(null); setChat(null); setMsgs([]); total.current = 0; known.current.clear(); return; }
      if (!r.ok) return;
      const d: { total: number; status: "open" | "closed"; messages: Msg[]; closedBy?: "visitor" | "staff"; feedbackGiven?: boolean } = await r.json();
      setStatus(d.status); setClosedBy(d.closedBy); if (d.feedbackGiven) setRated(true);
      if (d.messages.length) {
        const hadAny = known.current.size > 0;
        if (hadAny && d.messages.some((m) => m.from === "staff" && !known.current.has(m.id))) { beep(); flashTitle(); }
        d.messages.forEach((m) => known.current.add(m.id));
        setMsgs((m) => addMsgs(m, d.messages)); total.current = d.total; writeChat({ ...chat, seen: d.total });
      }
    } catch { /* offline: next tick */ }
  }, [chat]);

  useEffect(() => {
    if (!chat) return;
    void poll();
    const t = setInterval(() => void poll(), 2500);
    const vis = () => { if (!document.hidden) void poll(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [chat, poll]);

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs.length]);
  useEffect(() => { input.current?.focus(); }, [chat]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!PHONE_RE.test(phone.trim()) || phone.replace(/\D/g, "").length < 7) return setErr("Please enter a valid phone number.");
    setBusy(true);
    try {
      const r = await fetch("/api/chat/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, name, website: trap, page: location.pathname, referrer: document.referrer }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Could not start the chat");
      writeChat({ id: d.id, token: d.token, seen: d.total });
      total.current = d.total;
      setMsgs(d.messages); d.messages.forEach((m: Msg) => known.current.add(m.id)); setStatus(d.status); setChat({ id: d.id, token: d.token });
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !chat) return;
    setText(""); setErr("");
    try {
      const r = await fetch("/api/chat/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: chat.id, token: chat.token, text: t }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Message not sent");
      if (d.messages?.length) { d.messages.forEach((m: Msg) => known.current.add(m.id)); setMsgs((m) => addMsgs(m, d.messages)); total.current = d.total; writeChat({ ...chat, seen: d.total }); }
    } catch (x) { setErr((x as Error).message); setText(t); }
  };

  const newChat = () => { writeChat(null); setChat(null); setMsgs([]); total.current = 0; setStatus("open"); setClosedBy(undefined); setRated(false); setStars(0); setComment(""); setThanks(false); setConfirmEnd(false); };

  const endChat = async () => {
    if (!chat) return;
    setConfirmEnd(false);
    try {
      const r = await fetch("/api/chat/close", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: chat.id, token: chat.token }) });
      if (r.ok) { const d = await r.json(); setStatus("closed"); setClosedBy(d.closedBy); void poll(); }
    } catch { setErr("Could not end the chat. Please try again."); }
  };
  const sendFeedback = async () => {
    if (!chat || !stars) return;
    try {
      const r = await fetch("/api/chat/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: chat.id, token: chat.token, rating: stars, comment }) });
      if (r.ok) { setRated(true); setThanks(true); }
    } catch { /* try again */ }
  };

  return (
    <div role="dialog" aria-label="Live chat" data-notranslate className="fixed z-[70] bottom-20 left-3 right-3 sm:right-auto sm:left-5 sm:w-[380px] h-[min(560px,calc(100vh-7rem))] flex flex-col bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,.35)] border border-gray-200 overflow-hidden animate-scale-in">
      <header className="bg-brand text-white px-5 py-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"><Icon name="headset" className="text-lg" /></span>
        <div className="flex-1 min-w-0"><p className="font-semibold leading-tight">Chat with us</p><p className="text-xs text-white/80">We usually reply within minutes</p></div>
        {chat && status === "open" && <button type="button" onClick={() => setConfirmEnd(true)} className="text-xs font-semibold rounded-full px-3 py-1.5 hover:bg-white/15 border border-white/30">End chat</button>}
        <button type="button" onClick={onClose} aria-label="Minimise chat" className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center"><Icon name="minus" /></button>
      </header>

      {confirmEnd && (
        <div role="alertdialog" aria-label="End chat" className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-5 w-full text-center space-y-3 shadow-xl">
            <p className="font-semibold text-ink">End this chat?</p>
            <p className="text-sm text-gray-600">You can always start a new one later.</p>
            <div className="flex gap-2"><button type="button" onClick={() => setConfirmEnd(false)} className="btn btn-secondary flex-1">Keep chatting</button><button type="button" onClick={endChat} className="btn btn-cta flex-1">End chat</button></div>
          </div>
        </div>
      )}

      {!chat ? (
        <form onSubmit={start} className="flex-1 overflow-y-auto p-5 space-y-4 bg-canvas">
          <p className="text-sm text-gray-600 leading-relaxed">Enter your phone number to start. No account or password needed. We only use it to reach you if the chat gets disconnected.</p>
          <div>
            <label htmlFor="chat-phone" className="block text-sm font-semibold text-ink mb-1.5">Phone number <span className="text-accent">*</span></label>
            <input ref={input} id="chat-phone" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 5X XXX XXXX" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
          </div>
          <div>
            <label htmlFor="chat-name" className="block text-sm font-semibold text-ink mb-1.5">Name <span className="text-gray-400 font-normal">(optional)</span></label>
            <input id="chat-name" type="text" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />
          {err && <p role="alert" className="text-sm text-accent">{err}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary w-full">{busy ? "Starting…" : "Start chat"}</button>
        </form>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-canvas" aria-live="polite">
            {msgs.map((m) =>
              m.from === "system" ? (
                <p key={m.id} className="text-center text-xs text-gray-500 py-1">{m.text}</p>
              ) : (
                <div key={m.id} className={`flex ${m.from === "visitor" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${m.from === "visitor" ? "bg-brand text-white rounded-2xl rounded-br-md" : "bg-white text-ink border border-gray-200 rounded-2xl rounded-bl-md"}`}>
                    {(m.from === "staff" || m.from === "ai") && <p className="text-[11px] font-semibold text-brand-text mb-0.5">{m.name || "Agent"}</p>}
                    {m.text}
                  </div>
                </div>
              )
            )}
            <div ref={end} />
          </div>
          {status === "closed" ? (
            <div className="p-4 border-t border-gray-200 bg-white text-center space-y-3">
              <p className="text-sm text-gray-600">{closedBy === "visitor" ? "You ended this chat." : "This chat has ended."}</p>
              {!rated ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink">How was your experience?</p>
                  <div className="flex justify-center gap-1" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setStars(n)} className={`text-2xl leading-none ${n <= stars ? "text-amber-400" : "text-gray-300"} hover:text-amber-400`}>★</button>)}
                  </div>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={600} rows={2} aria-label="Comment (optional)" placeholder="Anything you'd like to add? (optional)" className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
                  <button type="button" onClick={sendFeedback} disabled={!stars} className="btn btn-primary w-full disabled:opacity-50">Send feedback</button>
                </div>
              ) : thanks ? <p className="text-sm text-brand-text font-semibold">Thank you for your feedback!</p> : null}
              <button type="button" onClick={newChat} className="btn btn-secondary w-full">Start a new chat</button>
            </div>
          ) : (
            <form onSubmit={send} className="p-3 border-t border-gray-200 bg-white">
              {err && <p role="alert" className="text-xs text-accent mb-2">{err}</p>}
              <div className="flex items-center gap-2">
                <input ref={input} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} aria-label="Type your message" placeholder="Type your message…" className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
                <button type="submit" disabled={!text.trim()} aria-label="Send message" className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark disabled:opacity-40 transition-colors"><Icon name="paper-plane" /></button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
