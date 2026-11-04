import { assertAdminRequest } from "@/lib/auth";
import { mutate } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Mark a chat as read by staff: POST { id } */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "chat.view");
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id ?? "");
  await mutate("chats", (all) => all.map((c) => (c.id === id && c.unreadStaff > 0 ? { ...c, unreadStaff: 0 } : c)));
  return Response.json({ ok: true });
}
