import "server-only";
import { revalidatePath } from "next/cache";

/** Refresh every public page + the sitemap/robots/llms/search files after content changes. */
export function refreshSite() {
  revalidatePath("/", "layout");
  for (const p of ["/sitemap.xml", "/robots.txt", "/llms.txt", "/blog/search-index.json"]) revalidatePath(p);
}
