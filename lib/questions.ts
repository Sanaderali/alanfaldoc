import "server-only";
import { detectLang, looksPersonal, questionKey, scrubPII, type LangCode } from "@/lib/local-ai";
import { mutate, readAll } from "@/lib/store";

/**
 * Daily record of the questions visitors ask (personal details removed). The dashboard shows the most asked ones,
 * how each was answered (our library, Groq or the team), and lets the team approve an answer so it is served from the library next time.
 */
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export async function recordQuestion(text: string, source: "local" | "groq" | "team", answer?: string, langHint?: string) {
  if (looksPersonal(text)) return; // someone describing their own case is not a reusable question
  const lang = detectLang(text, langHint) as LangCode;
  const key = questionKey(text, lang);
  if (!key) return;
  const day = dayKey();
  const stamp = new Date().toISOString();
  await mutate("questions", (all) => {
    const i = all.findIndex((x) => x.key === key && x.lang === lang);
    const ans = answer ? scrubPII(answer).slice(0, 700) : undefined;
    let next = all;
    if (i >= 0) {
      const x = all[i];
      const days = { ...x.days, [day]: (x.days[day] ?? 0) + 1 };
      for (const d of Object.keys(days)) if (Date.parse(d) < Date.now() - 60 * 86400_000) delete days[d];
      next = all.map((y, n) => (n === i ? { ...x, count: x.count + 1, days, [source]: (x[source] ?? 0) + 1, lastAnswer: source === "local" ? x.lastAnswer : ans ?? x.lastAnswer, lastAt: stamp, updatedAt: stamp } : y));
    } else {
      next = [{ id: crypto.randomUUID(), key, sample: scrubPII(text), count: 1, days: { [day]: 1 }, local: source === "local" ? 1 : 0, groq: source === "groq" ? 1 : 0, team: source === "team" ? 1 : 0, lastAnswer: source === "local" ? undefined : ans, lang, lastAt: stamp, createdAt: stamp, updatedAt: stamp }, ...all];
    }
    return next.sort((a, b) => b.lastAt.localeCompare(a.lastAt)).slice(0, 500);
  });
}

/** most asked questions in the last `days` days that the library could not answer yet */
export async function topQuestions(days = 14, limit = 40) {
  const since = Date.now() - days * 86400_000;
  const rows = (await readAll("questions")).filter((q) => q.status !== "draft").map((q) => ({ q, n: Object.entries(q.days).filter(([d]) => Date.parse(d) >= since - 86400_000).reduce((s, [, c]) => s + c, 0) })).filter((x) => x.n > 0);
  return rows.sort((a, b) => b.n - a.n).slice(0, limit);
}
