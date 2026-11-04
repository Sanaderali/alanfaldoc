import { assertAdminRequest } from "@/lib/auth";
import { readAll } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Backup: all content as one JSON file. (Uploaded images live in content/uploads, copy that folder too.) */
export async function GET(req: Request) {
  const auth = await assertAdminRequest(req, "backup.export");
  if ("error" in auth) return auth.error;
  const data = {
    exportedAt: new Date().toISOString(),
    services: await readAll("services"),
    countries: await readAll("countries"),
    posts: await readAll("posts"),
    faqs: await readAll("faqs"),
    pages: await readAll("pages"),
    media: await readAll("media"),
    // tickets + chats include customer contact details: keep this file private. User accounts / password hashes are never exported.
    tickets: await readAll("tickets"),
    chats: (await readAll("chats")).map(({ tokenHash, ...c }) => { void tokenHash; return c; }),
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="alanfaldoc-backup-${data.exportedAt.slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
