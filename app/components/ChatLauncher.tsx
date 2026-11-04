"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Icon from "./Icon";

/** Floating live-chat button (bottom right). The chat panel itself is loaded only when opened, so it costs nothing at page load. */
const Panel = dynamic(() => import("./ChatPanel"), { ssr: false });

export const CHAT_KEY = "aa-chat";
type Stored = { id: string; token: string; seen: number };
export const readChat = (): Stored | null => { try { return JSON.parse(localStorage.getItem(CHAT_KEY) ?? "null"); } catch { return null; } };
export const writeChat = (v: Stored | null) => { try { v ? localStorage.setItem(CHAT_KEY, JSON.stringify(v)) : localStorage.removeItem(CHAT_KEY); } catch { /* private mode */ } };

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // while closed, quietly check (every 20s) whether an agent replied, to show a badge
  const check = useCallback(async () => {
    const c = readChat();
    if (!c || document.hidden) return;
    try {
      const r = await fetch(`/api/chat/poll?id=${c.id}&token=${c.token}&since=${c.seen}`, { cache: "no-store" });
      if (r.status === 404 || r.status === 403) return writeChat(null);
      if (!r.ok) return;
      const d: { messages: { from: string }[] } = await r.json();
      setUnread(d.messages.filter((m) => m.from === "staff").length);
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    if (open) return;
    const first = setTimeout(check, 3000);
    const t = setInterval(check, 20000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [open, check]);

  return (
    <>
      {open && <Panel onClose={() => { setOpen(false); setUnread(0); }} />}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setUnread(0); }}
        aria-label={open ? "Close live chat" : "Open live chat"}
        aria-expanded={open}
        className="fixed z-[70] bottom-5 right-5 inline-flex items-center gap-2.5 h-14 pl-5 pr-6 rounded-full bg-brand text-white font-semibold text-[15px] shadow-[0_10px_30px_-5px_rgba(10,92,54,.55)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-5px_rgba(10,92,54,.65)] active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/40"
      >
        <Icon name={open ? "xmark" : "comments"} className="text-lg" />
        <span className="hidden sm:inline">{open ? "Close" : "Chat with us"}</span>
        {!open && unread > 0 && <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">{unread}</span>}
      </button>
    </>
  );
}
