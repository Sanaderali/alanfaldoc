import "server-only";
import { askAI, AI_NAME, aiEnabled, MAX_AI_REPLIES, refreshSummary, updateProfile, wantsHuman } from "@/lib/ai";
import { msg } from "@/lib/chat";
import { detectIntent, detectLang, localReply, looksPersonal, template } from "@/lib/local-ai";
import { recordQuestion } from "@/lib/questions";
import { mutate, now, readAll } from "@/lib/store";
import type { Chat } from "@/types/content";

/**
 * Who answers a visitor message, in this order:
 *   1. a request for a person -> the team is alerted and the assistant steps back
 *   2. our own library (everyday questions, FAQs, approved answers): no Groq tokens
 *   3. Groq, for everything else
 *   4. if Groq is unavailable (limit reached, error): a polite "passing this to the team" message, the chat is flagged for follow-up
 * Replies are paced: the first replies take 5, 10 and 15 seconds (CHAT_DELAYS="5,10,15"), later ones 2-7 seconds, with the "typing..." indicator showing.
 */
export const assistantOn = () => process.env.AI_CHAT !== "off";

const busy = new Set<string>();
/** the last visitor message of each chat that the assistant has already dealt with (so an unanswered one is not retried in a loop) */
const handled = new Map<string, string>();
const DELAYS = (process.env.CHAT_DELAYS ?? "5,10,15").split(",").map((n) => Math.max(0, Number(n) || 0) * 1000);
const find = async (id: string) => (await readAll("chats")).find((c) => c.id === id);
const lastVisitor = (c?: Chat) => [...(c?.messages ?? [])].reverse().find((m) => m.from === "visitor");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const NIGHT: Record<string, string> = {
  en: "Our office is closed right now, so the reply will come first thing in the morning.",
  ar: "المكتب مغلق حاليًا، لذا سيصلك الرد صباحًا.",
  zh: "我们的办公室目前已下班,团队会在明早第一时间回复您。",
  hi: "हमारा कार्यालय अभी बंद है, इसलिए उत्तर कल सुबह सबसे पहले मिलेगा।",
  de: "Unser Büro ist gerade geschlossen, die Antwort kommt daher morgen früh.",
  fr: "Notre bureau est fermé pour le moment ; la réponse vous parviendra demain matin.",
  ja: "ただいま営業時間外のため、翌朝一番にご返信いたします。",
  ko: "현재 사무실이 닫혀 있어 내일 아침 가장 먼저 답변드리겠습니다.",
  it: "Il nostro ufficio è chiuso al momento, quindi la risposta arriverà domattina.",
  es: "Nuestra oficina está cerrada ahora, así que la respuesta llegará por la mañana.",
  nl: "Ons kantoor is nu gesloten, dus het antwoord volgt morgenochtend.",
};
const dubaiNight = () => { const h = new Date(Date.now() + 4 * 3600_000).getUTCHours(); return h >= 21 || h < 8; };

/** how long (ms, counted from when the visitor wrote) before this reply may appear */
function pace(replyIndex: number, len: number, instant: boolean): number {
  if (instant) return 0;
  if (replyIndex < DELAYS.length) return DELAYS[replyIndex];
  return Math.min(7000, 2000 + len * 25);
}

type Extra = (c: Chat) => Partial<Chat>;
async function post(id: string, text: string, src: "local" | "groq", extra?: Extra) {
  await mutate("chats", (all) => all.map((c) => {
    if (c.id !== id) return c;
    if (c.aiPaused || c.status !== "open") return { ...c, aiTyping: false }; // a person took over meanwhile
    const a = { ...msg("ai", text, AI_NAME), src };
    return { ...c, aiTyping: false, messages: [...c.messages, a], unreadVisitor: c.unreadVisitor + 1, aiReplies: (c.aiReplies ?? 0) + 1, lastMessageAt: a.at, updatedAt: now(), ...(extra ? extra(c) : {}) };
  }));
}
const setTyping = (id: string, on: boolean) => mutate("chats", (all) => all.map((c) => (c.id === id ? { ...c, aiTyping: on } : c)));

async function answerOne(chat: Chat, text: string): Promise<"local" | "groq" | "none"> {
  const lang = detectLang(text, chat.lang);
  const name = chat.profile?.name || chat.name;
  const idx = chat.aiReplies ?? 0;
  const started = Date.now();
  const intent = detectIntent(text);
  const wait = async (len: number) => { const ms = pace(idx, len, intent === "late") - (Date.now() - started); if (ms > 0) await sleep(ms); };
  await setTyping(chat.id, true);

  // 1. the visitor asks for a person
  if (wantsHuman(text)) {
    const r = template(lang, "hold", { name });
    await wait(r.length);
    await post(chat.id, r, "local", (c) => ({ aiPaused: true, followUp: true, unreadStaff: c.unreadStaff + 1 }));
    return "local";
  }

  // 2. our own library
  let reply: string | undefined, src: "local" | "groq" = "local", followUp = false;
  const local = await localReply(text, { lang, name });
  if (process.env.CHAT_DEBUG) console.error("[chat]", chat.id.slice(0, 8), JSON.stringify(text.slice(0, 50)), "local:", local ? local.kind : "no");
  if (local) reply = local.text;
  // 3. Groq
  else if (aiEnabled()) {
    const r = await askAI(chat);
    if (r) { reply = r.text; src = "groq"; followUp = r.followUp; }
    if (process.env.CHAT_DEBUG) console.error("[chat]", chat.id.slice(0, 8), "groq:", r ? "ok" : "failed", Date.now() - started, "ms");
  }
  // 4. nobody could answer (Groq unavailable): hand over to the team, once per chat
  if (!reply) {
    if (chat.fallbackSent) { await setTyping(chat.id, false); return "none"; }
    reply = template(lang, "hold", { name }) + (dubaiNight() ? " " + (NIGHT[lang] ?? NIGHT.en) : "");
    await wait(reply.length);
    await post(chat.id, reply, "local", (c) => ({ fallbackSent: true, followUp: true, unreadStaff: c.unreadStaff + 1 }));
    return "none";
  }
  await wait(reply.length);
  await post(chat.id, reply, src, followUp ? (c) => ({ followUp: true, unreadStaff: c.unreadStaff + 1 }) : undefined);
  await recordQuestion(text, src, reply, chat.lang);
  return src;
}

/** Called after every visitor message. One reply at a time per chat; messages that arrive meanwhile are answered afterwards. */
export async function handleChat(id: string) {
  const first = await find(id);
  if (!first) return;
  if (busy.has(id)) {
    // the visitor asks "are you there?" while a reply is still being written: reassure at once, the loop below answers the rest
    const last = lastVisitor(first);
    if (last && first.status === "open" && !first.aiPaused && detectIntent(last.text) === "late" && first.messages[first.messages.length - 1]?.from === "visitor") {
      await post(id, template(detectLang(last.text, first.lang), "late"), "local");
    }
    return;
  }
  busy.add(id);
  let lastSrc: "local" | "groq" | "none" = "none";
  try {
    for (let i = 0; i < 5; i++) {
      const chat = await find(id);
      if (!chat || chat.status !== "open" || chat.aiPaused || (chat.aiReplies ?? 0) >= MAX_AI_REPLIES) break;
      const last = chat.messages[chat.messages.length - 1];
      if (last?.from !== "visitor" || handled.get(id) === last.id) break;
      handled.set(id, last.id);
      lastSrc = await answerOne(chat, last.text);
    }
  } finally {
    busy.delete(id);
    await setTyping(id, false);
  }
  // a message may have arrived just as the lock was released: answer it now
  const again = await find(id);
  const tail = again?.messages[again.messages.length - 1];
  if (again && again.status === "open" && !again.aiPaused && tail?.from === "visitor" && handled.get(id) !== tail.id && !busy.has(id)) { await handleChat(id); return; }
  if (handled.size > 2000) handled.clear();

  // notes for the dashboard cost Groq tokens: only when the visitor talked about themselves (or wrote a longer message Groq answered). They never delay a reply.
  const lt = lastVisitor(again)?.text ?? "";
  if (aiEnabled() && (looksPersonal(lt) || (lastSrc === "groq" && lt.length >= 30))) await updateProfile(id, true);
  if (aiEnabled()) await refreshSummary(id);
}
