import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { assertAdminRequest } from "@/lib/auth";
import { mutate, now, UPLOAD_DIR } from "@/lib/store";
import { slugify } from "@/lib/validate";

export const runtime = "nodejs";
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * POST multipart/form-data { file, alt }.
 * Accepts JPG / PNG / WebP / GIF / AVIF only (SVG is refused: it can carry scripts).
 * Images are auto-rotated, limited to 1600px wide and stored as WebP for page speed.
 */
export async function POST(req: Request) {
  const denied = await assertAdminRequest(req);
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim().slice(0, 300);
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Image is larger than 8 MB" }, { status: 413 });
  if (!alt) return Response.json({ error: "Alt text is required" }, { status: 400 });

  const input = Buffer.from(await file.arrayBuffer());
  let out: Buffer, info: { width: number; height: number };
  try {
    const meta = await sharp(input).metadata();
    if (!meta.format || !["jpeg", "png", "webp", "gif", "heif", "avif"].includes(meta.format)) throw new Error("format");
    ({ data: out, info } = await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true }));
  } catch {
    return Response.json({ error: "Not a valid JPG, PNG, WebP or GIF image" }, { status: 400 });
  }

  const base = slugify(path.parse(file.name).name) || "image";
  const name = `${base}-${createHash("sha1").update(out).digest("hex").slice(0, 8)}.webp`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), out);

  const item = { id: randomUUID(), file: name, alt, width: info.width, height: info.height, bytes: out.length, createdAt: now() };
  await mutate("media", (items) => (items.some((m) => m.file === name) ? items : [item, ...items]));
  return Response.json({ item });
}
