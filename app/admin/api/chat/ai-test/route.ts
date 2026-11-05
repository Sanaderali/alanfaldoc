import { assertAdminRequest } from "@/lib/auth";
import { testAI } from "@/lib/ai";

export const dynamic = "force-dynamic";

/** Dashboard "Test AI" button: checks the Groq key, model and connection. */
export async function POST(req: Request) {
  const auth = await assertAdminRequest(req, "chat.reply");
  if ("error" in auth) return auth.error;
  return Response.json(await testAI());
}
