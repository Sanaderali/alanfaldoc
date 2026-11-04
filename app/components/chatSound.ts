"use client";

/** Visitor-side alerts: a two-tone beep (Web Audio) and a flashing tab title when the tab is in the background. */
let actx: AudioContext | null = null;
const AC = () => window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

/** browsers only allow sound after the visitor has interacted with the page once; call this on the first click/key/touch */
export function unlockSound() {
  try { actx ??= new (AC())(); if (actx.state === "suspended") void actx.resume(); } catch { /* sound is optional */ }
}

export function beep() {
  try {
    unlockSound();
    const c = actx!, t0 = c.currentTime;
    [[880, 0], [1320, 0.16]].forEach(([f, d]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.25, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.28);
      o.connect(g).connect(c.destination); o.start(t0 + d); o.stop(t0 + d + 0.3);
    });
  } catch { /* ignore */ }
}

let timer: ReturnType<typeof setInterval> | null = null;
export function flashTitle(text = "New reply - Al Anfal Doc") {
  if (typeof document === "undefined" || !document.hidden || timer) return;
  const base = document.title; let on = false;
  timer = setInterval(() => { document.title = (on = !on) ? text : base; }, 1000);
  const stop = () => { if (document.hidden) return; if (timer) clearInterval(timer); timer = null; document.title = base; document.removeEventListener("visibilitychange", stop); };
  document.addEventListener("visibilitychange", stop);
}

/** call once per page: unlocks sound on the first interaction anywhere on the site */
export function armSound() {
  const f = () => { unlockSound(); ["pointerdown", "keydown", "touchstart"].forEach((e) => window.removeEventListener(e, f)); };
  ["pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, f, { passive: true }));
  return () => ["pointerdown", "keydown", "touchstart"].forEach((e) => window.removeEventListener(e, f));
}
