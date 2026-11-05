import { requirePerm } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { Empty, PageHeader } from "../../ui";
import { deleteKnowledge } from "../enquiries-actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("chat.reply");
  const items = await readAll("knowledge");
  return (
    <>
      <PageHeader title="AI knowledge" subtitle="Answers your team approved for the chat assistant. Add one from Live chat with &quot;Learn from this reply&quot;. Replies that mention money, bank or contact details are never saved. Delete anything that is outdated." />
      <div className="bg-a-surface border border-a-line">
        {items.length === 0 ? <Empty>Nothing learned yet. Open a chat, then click &quot;Learn from this reply&quot; under one of your answers.</Empty> : (
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
