import { assertAdminRequest } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Tiny payload polled from every dashboard page for the menu badges + notification sound. */
export async function GET(req: Request) {
  const auth = await assertAdminRequest(req);
  if ("error" in auth) return auth.error;
  const out: { chats: number; chatUnreadMessages: number; tickets: number } = { chats: 0, chatUnreadMessages: 0, tickets: 0 };
  if (can(auth.user, "chat.view")) {
    const chats = await readAll("chats");
    out.chats = chats.filter((c) => c.unreadStaff > 0).length;
    out.chatUnreadMessages = chats.reduce((n, c) => n + c.unreadStaff, 0);
  }
  if (can(auth.user, "tickets.view")) out.tickets = (await readAll("tickets")).filter((t) => t.unreadStaff && t.status !== "closed").length;
  return Response.json(out, { headers: { "Cache-Control": "no-store" } });
}
