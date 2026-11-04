import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/store";

export const runtime = "nodejs";

/** Public image server for dashboard uploads. Filenames contain a content hash, so they can be cached forever. */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-z0-9][a-z0-9._-]*\.webp$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
