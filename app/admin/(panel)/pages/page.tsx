import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { auditPage, score } from "@/lib/audit";
import { Badge, Card, fmtDate, PageHeader } from "../../ui";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const pages = await readAll("pages");
  return (
    <>
      <PageHeader title="Pages & SEO" subtitle="Meta tags and schema for the fixed pages: home, about, lists, FAQs and contact." />
      <Card>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500 bg-gray-50"><tr><th className="px-5 py-2.5 font-medium">Page</th><th className="px-3 py-2.5 font-medium">Meta title</th><th className="px-3 py-2.5 font-medium hidden md:table-cell">Meta description</th><th className="px-3 py-2.5 font-medium">SEO</th><th className="px-5 py-2.5 font-medium">Updated</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {pages.map((p) => {
              const sc = score(auditPage(p));
              return (
                <tr key={p.key} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3"><Link href={`/admin/pages/${p.key}`} className="font-medium hover:text-brand-text">{p.name}</Link><p className="text-xs text-gray-400">{p.path}</p></td>
                  <td className="px-3 py-3 text-gray-600 max-w-[16rem] truncate">{p.seo?.title ?? <span className="text-gray-400">Default</span>}</td>
                  <td className="px-3 py-3 text-gray-600 max-w-[22rem] truncate hidden md:table-cell">{p.seo?.description ?? <span className="text-gray-400">Default</span>}</td>
                  <td className="px-3 py-3"><Badge tone={sc >= 85 ? "ok" : sc >= 65 ? "warn" : "error"}>{sc}</Badge></td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{fmtDate(p.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
