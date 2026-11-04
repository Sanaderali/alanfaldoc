import { assertAdminRequest } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await assertAdminRequest(req);
  if ("error" in auth) return auth.error;
  if (!can(auth.user, "media.manage") && !can(auth.user, "content.edit")) return new Response("Forbidden", { status: 403 });
  return Response.json({ items: await readAll("media") });
}
