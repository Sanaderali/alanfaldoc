"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { armSound, beep, flashTitle } from "./chatSound";

/** Floating live-chat button (bottom right). The chat panel itself is loaded only when opened, so it costs nothing at page load. */
const Panel = dynamic(() => import("./ChatPanel"), { ssr: false });

export const CHAT_KEY = "aa-chat";
type Stored = { id: string; token: string; seen: number };
export const readChat = (): Stored | null => { try { return JSON.parse(localStorage.getItem(CHAT_KEY) ?? "null"); } catch { return null; } };
export const writeChat = (v: Stored | null) => { try { v ? localStorage.setItem(CHAT_KEY, JSON.stringify(v)) : localStorage.removeItem(CHAT_KEY); } catch { /* private mode */ } };

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const notified = useRef(0);
  useEffect(() => armSound(), []);

  // while closed, quietly check (every 5s, also in a background tab) whether an agent replied, to show a badge
  const check = useCallback(async () => {
    const c = readChat();
    if (!c) return;
    try {
      const r = await fetch(`/api/chat/poll?id=${c.id}&token=${c.token}&since=${c.seen}`, { cache: "no-store" });
      if (r.status === 404 || r.status === 403) return writeChat(null);
      if (!r.ok) return;
      const d: { messages: { from: string }[] } = await r.json();
      const n = d.messages.filter((m) => m.from === "staff").length;
      if (n > notified.current) { beep(); flashTitle(); }
      notified.current = n;
      setUnread(n);
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    if (open) return;
    notified.current = 0;
    const first = setTimeout(check, 2000);
    const t = setInterval(check, 5000);
    const vis = () => { if (!document.hidden) void check(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearTimeout(first); clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [open, check]);

  return (
    <>
      {open && <Panel onClose={() => { setOpen(false); setUnread(0); }} />}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setUnread(0); }}
        aria-label={open ? "Close live chat" : "Open live chat"}
        aria-expanded={open}
        title={open ? "Close live chat" : "Live chat"}
        className="fixed z-[70] bottom-5 left-4 sm:left-5 w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-[0_8px_22px_-6px_rgba(10,92,54,.6)] hover:scale-105 active:scale-95 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/40"
      >
        <Icon name={open ? "xmark" : "comments"} fixedWidth={false} className="text-xl" />
        {!open && unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">{unread}</span>}
      </button>
    </>
  );
}
