import { assertAdminRequest } from "@/lib/auth";
import { aiEnabled } from "@/lib/ai";
import { summary } from "@/lib/chat";
import { readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Inbox data for the dashboard: GET ?id=<chat>&since=<n messages already loaded> */
export async function GET(req: Request) {
  const auth = await assertAdminRequest(req, "chat.view");
  if ("error" in auth) return auth.error;
  const u = new URL(req.url);
  const id = u.searchParams.get("id");
  const since = Math.max(0, Number(u.searchParams.get("since")) || 0);
  const chats = (await readAll("chats")).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  const names = new Map((await readAll("users")).map((u) => [u.id, u.name]));
  const selected = id ? chats.find((c) => c.id === id) : undefined;
  return Response.json({
    chats: chats.slice(0, 200).map(summary),
    ai: aiEnabled(),
    unread: chats.filter((c) => c.unreadStaff > 0).length,
    selected: selected
      ? {
          id: selected.id, name: selected.name ?? "", phone: selected.phone, status: selected.status, createdAt: selected.createdAt,
          ip: selected.ip, country: selected.country, city: selected.city, page: selected.page, referrer: selected.referrer, userAgent: selected.userAgent, language: selected.language,
          aiPaused: !!selected.aiPaused, aiReplies: selected.aiReplies ?? 0,
          handledBy: selected.assignedTo ? names.get(selected.assignedTo) ?? "" : "",
          total: selected.messages.length, messages: selected.messages.slice(since),
        }
      : null,
  }, { headers: { "Cache-Control": "no-store" } });
}
