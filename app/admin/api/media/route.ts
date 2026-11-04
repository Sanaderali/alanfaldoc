import { assertAdminRequest } from "@/lib/auth";
import { readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminRequest(req);
  if (denied) return denied;
  return Response.json({ items: await readAll("media") });
}
