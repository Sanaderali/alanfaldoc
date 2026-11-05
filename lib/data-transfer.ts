import "server-only";
import { site } from "@/data/site";
import { exportTranslations } from "@/lib/translate";
import { readAll } from "@/lib/store";

/** Content that can be exported / imported as one file (a backup that can also be restored or moved to another site). */
export const EXPORT_TYPES = [
  { key: "services", label: "Services", hint: "All service pages with their FAQs" },
  { key: "countries", label: "Countries", hint: "Country guides, including their states / regions" },
  { key: "posts", label: "Blog posts", hint: "Articles, including drafts and scheduled posts" },
  { key: "landings", label: "Service × Country pages", hint: "Service pages written for one country" },
  { key: "faqs", label: "FAQ groups", hint: "The groups shown on the FAQs page" },
  { key: "reviews", label: "Reviews", hint: "Success stories shown on the home page" },
  { key: "pages", label: "Page SEO settings", hint: "SEO and schema settings of home, about, services, contact and the other fixed pages" },
  { key: "translations", label: "Translations", hint: "Website translations by language (English sentence to translation)" },
  { key: "knowledge", label: "AI knowledge", hint: "Answers your team approved for the chat assistant" },
] as const;
export type ExportKey = (typeof EXPORT_TYPES)[number]["key"];

export type ExportOptions = { types: string[]; ids?: Record<string, string[] | null>; status?: "all" | "published"; langs?: string[] };

type Row = { id?: string; status?: string; slug?: string; key?: string };

const label = (k: string, x: Record<string, unknown>) => String(x.title ?? x.name ?? x.key ?? x.slug ?? x.question ?? "(untitled)");

/** Lists shown in the picker: id + label (+ status) per content type. */
export async function listForPicker(): Promise<Record<string, { id: string; label: string; status?: string }[]>> {
  const out: Record<string, { id: string; label: string; status?: string }[]> = {};
  for (const k of ["services", "countries", "posts", "landings", "faqs", "reviews", "pages", "knowledge"] as const) {
    const all = (await readAll(k)) as unknown as (Row & Record<string, unknown>)[];
    out[k] = all.filter((x) => x.status !== "trash").map((x) => ({ id: String(x.id ?? x.slug ?? x.key), label: label(k, x), status: x.status })).sort((a, b) => a.label.localeCompare(b.label));
  }
  return out;
}

export async function buildExport(o: ExportOptions): Promise<Record<string, unknown>> {
  const pack: Record<string, unknown> = { format: "alanfaldoc-content", version: 1, exportedAt: new Date().toISOString(), site: site.url, counts: {} as Record<string, number> };
  const counts = pack.counts as Record<string, number>;
  for (const k of EXPORT_TYPES.map((t) => t.key)) {
    if (!o.types.includes(k)) continue;
    if (k === "translations") {
      const langs = (o.langs && o.langs.length ? o.langs : ["ar", "zh", "hi", "de", "fr", "ja", "ko", "it", "es", "nl"]);
      const t = await exportTranslations(langs);
      pack.translations = t;
      counts.translations = Object.values(t).reduce((n, m) => n + Object.keys(m).length, 0);
      continue;
    }
    const want = o.ids?.[k];
    const all = (await readAll(k)) as unknown as (Row & Record<string, unknown>)[];
    const rows = all.filter((x) => x.status !== "trash")
      .filter((x) => !want || want.includes(String(x.id ?? x.slug ?? x.key)))
      .filter((x) => o.status !== "published" || x.status === undefined || x.status === "published");
    pack[k] = rows;
    counts[k] = rows.length;
  }
  return pack;
}
