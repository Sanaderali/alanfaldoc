import { requirePerm } from "@/lib/auth";
import { topQuestions } from "@/lib/questions";
import { readAll } from "@/lib/store";
import { Empty, PageHeader, btnGhost } from "../../ui";
import { approveQuestion, deleteKnowledge } from "../enquiries-actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("chat.reply");
  const [items, top, chats] = await Promise.all([readAll("knowledge"), topQuestions(14, 30), readAll("chats")]);
  const week = Date.now() - 7 * 86400_000;
  let local = 0, groq = 0;
  for (const c of chats) for (const m of c.messages) if (m.from === "ai" && Date.parse(m.at) >= week) { if (m.src === "local") local++; else if (m.src === "groq") groq++; }
  const fallbacks = chats.filter((c) => c.fallbackSent && Date.parse(c.lastMessageAt) >= week).length;
  const pct = local + groq ? Math.round((local / (local + groq)) * 100) : 0;
  return (
    <>
      <PageHeader title="AI knowledge" subtitle="The assistant's own answer library. Everyday questions and approved answers are answered without using Groq. Approve frequent questions below, or add answers from Live chat with &quot;Learn from this reply&quot;." />

      <div className="grid sm:grid-cols-4 gap-3 mb-5 text-[13px]">
        {[["Answered by the library (7 days)", String(local)], ["Answered by Groq (7 days)", String(groq)], ["Share without Groq", `${pct}%`], ["Handed to the team (Groq unavailable)", String(fallbacks)]].map(([k, v]) => <div key={k} className="bg-a-surface border border-a-line p-3"><div className="text-a-muted">{k}</div><div className="text-xl font-semibold mt-1">{v}</div></div>)}
      </div>

      <h2 className="font-semibold text-[14px] mb-2">Most asked questions (last 14 days)</h2>
      <div className="bg-a-surface border border-a-line mb-6">
        {top.length === 0 ? <Empty>No questions recorded yet. Visitors&apos; questions appear here once they chat (personal details are removed).</Empty> : (
          <ul className="divide-y divide-a-line">
            {top.map(({ q, n }) => (
              <li key={q.id} className="p-3 text-[13px]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-semibold">&ldquo;{q.sample}&rdquo;</p><p className="text-a-muted text-[12px] mt-0.5">Asked {n} time{n === 1 ? "" : "s"} · answered by {[q.local ? `library ${q.local}` : "", q.groq ? `Groq ${q.groq}` : "", q.team ? `team ${q.team}` : ""].filter(Boolean).join(", ") || "-"} · {q.lang ?? "en"}</p></div>
                </div>
                {(q.groq > 0 || q.team > 0) && (
                  <form action={approveQuestion} className="mt-2 flex flex-col sm:flex-row gap-2">
                    <input type="hidden" name="id" value={q.id} />
                    <textarea name="answer" defaultValue={q.lastAnswer ?? ""} rows={2} aria-label="Answer to approve" className="flex-1 px-2.5 py-1.5 border border-a-line2 rounded-[3px] text-[13px] bg-a-surface" placeholder="Write or edit the answer the library should give (no prices, bank or contact details)" />
                    <button className={btnGhost}>Approve as library answer</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className="font-semibold text-[14px] mb-2">Approved answers ({items.length})</h2>
      <div className="bg-a-surface border border-a-line">
        {items.length === 0 ? <Empty>Nothing approved yet.</Empty> : (
          <ul className="divide-y divide-a-line">
            {items.map((k) => (
              <li key={k.id} className="p-3 text-[13px] flex items-start justify-between gap-4">
                <div><p className="font-semibold">Q: {k.question}</p><p className="text-a-muted mt-0.5 whitespace-pre-wrap">A: {k.answer}</p><p className="text-[11px] text-a-subtle mt-1">Added by {k.addedBy || "team"} · {k.createdAt ? new Date(k.createdAt).toLocaleDateString("en-GB") : ""}</p></div>
                <form action={deleteKnowledge.bind(null, k.id!)}><button className="text-a-red hover:underline text-[13px]">Delete</button></form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
