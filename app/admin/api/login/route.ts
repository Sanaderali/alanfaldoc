import { checkCredentials, clearFailures, clientIp, recordFailure, startSession, throttled } from "@/lib/auth";

export const dynamic = "force-dynamic";

const to = (path: string) => new Response(null, { status: 303, headers: { Location: path, "Cache-Control": "no-store" } });

/**
 * Plain HTML form POST (no client-side fetch), so login keeps working even if JavaScript is slow,
 * blocked by an extension, or the dev server restarts mid-request.
 */
export async function POST(req: Request) {
  // reject cross-site form posts
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return new Response("Forbidden", { status: 403 });

  const ip = await clientIp();
  if (throttled(ip)) return to("/admin/login?e=throttle");

  const form = await req.formData();
  const ok = checkCredentials(String(form.get("user") ?? ""), String(form.get("password") ?? ""));
  if (!ok) {
    recordFailure(ip);
    return to("/admin/login?e=bad");
  }
  clearFailures(ip);
  await startSession();
  return to("/admin");
}
