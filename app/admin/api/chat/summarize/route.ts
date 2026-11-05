import { assertAdminRequest } from "@/lib/auth";
import { summarizeChat } from "@/lib/ai";
import { mutate, now, readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Create (or refresh) the summary of one chat: POST { id } */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "chat.view");
  if ("error" in auth) return auth.error;
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  const chat = (await readAll("chats")).find((c) => c.id === id);
  if (!chat) return Response.json({ error: "Chat not found" }, { status: 404 });
  const summary = await summarizeChat(chat);
  if (!summary) return Response.json({ error: "Could not create a summary. Check the AI status in Live chat." }, { status: 502 });
  await mutate("chats", (all) => all.map((c) => (c.id === chat.id ? { ...c, summary, summaryAt: now() } : c)));
  return Response.json({ summary });
}
