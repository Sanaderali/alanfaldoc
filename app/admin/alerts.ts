"use client";

/** Audio + visual alerts for new chats / messages / tickets in the dashboard (client only). */

const KEY = "aa-alert-sound";
let ctx: AudioContext | null = null;

export function soundEnabled(): boolean {
  try { return localStorage.getItem(KEY) !== "0"; } catch { return true; }
}
export function setSoundEnabled(on: boolean) {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* ignore */ }
}

/** two-tone "ding-dong", generated with the Web Audio API (no audio file needed) */
export function playBeep(): boolean {
  if (!soundEnabled()) return false;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime;
    [[880, 0], [1320, 0.16]].forEach(([freq, delay]) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0 + delay);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.28);
      o.connect(g).connect(ctx!.destination);
      o.start(t0 + delay);
      o.stop(t0 + delay + 0.3);
    });
    return ctx.state === "running";
  } catch {
    return false;
  }
}

/** blink the browser tab title until the tab is focused again */
let flashTimer: ReturnType<typeof setInterval> | null = null;
let baseTitle = "";
export function flashTitle(text: string) {
  if (typeof document === "undefined" || !document.hidden) return;
  if (flashTimer) return;
  baseTitle = document.title;
  let on = false;
  flashTimer = setInterval(() => { document.title = (on = !on) ? text : baseTitle; }, 1000);
  const stop = () => {
    if (flashTimer) clearInterval(flashTimer);
    flashTimer = null;
    document.title = baseTitle;
    window.removeEventListener("focus", stop);
    document.removeEventListener("visibilitychange", stop);
  };
  window.addEventListener("focus", stop);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) stop(); });
}

export function desktopNotify(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted" && document.hidden) new Notification(title, { body, tag: "aa-chat" });
  } catch { /* ignore */ }
}
export async function askDesktopPermission() {
  try { if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission(); } catch { /* ignore */ }
}
