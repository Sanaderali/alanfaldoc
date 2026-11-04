import Link from "next/link";
import Icon from "@/app/components/Icon";
import { requireAdmin } from "@/lib/auth";
import { allRows, labelOf, score } from "@/lib/admin-data";
import { visibility } from "@/lib/audit";
import { readAll, CONTENT_DIR } from "@/lib/store";
import { site } from "@/data/site";
import { Badge, Card, Empty, fmtDate, fmtDateTime, LinkButton, PageHeader, StatusBadge } from "../ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  const [rows, media] = await Promise.all([allRows(), readAll("media")]);
  const content = rows.filter((r) => r.kind !== "page");
  const by = (k: string) => rows.filter((r) => r.kind === k);
  const count = (k: string, v: "live" | "draft" | "scheduled") => by(k).filter((r) => visibility(r) === v).length;

  const issues = rows.flatMap((r) => r.issues.map((i) => ({ ...i, row: r })));
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + score(r.issues), 0) / rows.length) : 100;
  const attention = [...errors, ...warns].slice(0, 8);
  const scheduled = content.filter((r) => visibility(r) === "scheduled").sort((a, b) => (a.publishAt! > b.publishAt! ? 1 : -1));
  const recent = [...content].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")).slice(0, 8);

  const setup: { ok: boolean; text: string }[] = [
    { ok: !!process.env.NEXT_PUBLIC_SITE_URL, text: "NEXT_PUBLIC_SITE_URL is set (canonical URLs, sitemap, schema)" },
    { ok: !!process.env.ADMIN_SECRET, text: "ADMIN_SECRET is set (stronger session signing)" },
    { ok: process.env.SITE_INDEXING !== "off", text: "Search engines are allowed to index the site" },
    { ok: !site.social.every((s) => s.href === "#"), text: "Social profile links added (schema sameAs)" },
  ];

  const stats = [
    { label: "Services", kind: "service", href: "/admin/services", icon: "briefcase" },
    { label: "Countries", kind: "country", href: "/admin/countries", icon: "earth-americas" },
    { label: "Blog posts", kind: "post", href: "/admin/posts", icon: "newspaper" },
    { label: "FAQ groups", kind: "faq", href: "/admin/faqs", icon: "circle-question" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Everything you publish here updates the live website within moments, and the site stays fully static for speed."
        actions={<><LinkButton href="/admin/posts/new" primary>New blog post</LinkButton><LinkButton href="/admin/api/export">Download backup</LinkButton></>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {stats.map((s) => (
          <Link key={s.kind} href={s.href}>
            <Card className="p-4 hover:border-brand/60 transition-colors h-full">
              <div className="flex items-center justify-between text-gray-400"><span className="text-sm text-gray-500">{s.label}</span><Icon name={s.icon} /></div>
              <p className="text-3xl font-bold mt-2">{by(s.kind).length}</p>
              <p className="text-xs text-gray-500 mt-1">{count(s.kind, "live")} live · {count(s.kind, "draft")} draft · {count(s.kind, "scheduled")} scheduled</p>
            </Card>
          </Link>
        ))}
        <Link href="/admin/media">
          <Card className="p-4 hover:border-brand/60 transition-colors h-full">
            <div className="flex items-center justify-between text-gray-400"><span className="text-sm text-gray-500">Images</span><Icon name="images" /></div>
            <p className="text-3xl font-bold mt-2">{media.length}</p>
            <p className="text-xs text-gray-500 mt-1">{media.filter((m) => !m.alt.trim()).length} missing alt text</p>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold">Needs attention</h2>
              <div className="flex gap-2"><Badge tone="error">{errors.length} errors</Badge><Badge tone="warn">{warns.length} warnings</Badge></div>
            </div>
            {attention.length === 0 ? <Empty>No SEO problems found. 🎉</Empty> : (
              <ul className="divide-y divide-gray-100">
                {attention.map((i, n) => (
                  <li key={n} className="flex items-start gap-3 px-5 py-3">
                    <Badge tone={i.level}>{i.level === "error" ? "Error" : "Warning"}</Badge>
                    <div className="min-w-0 flex-1">
                      <Link href={i.row.href} className="font-medium text-sm hover:text-brand-text">{i.row.title}</Link>
                      <span className="text-xs text-gray-400"> · {labelOf(i.row.kind)}</span>
                      <p className="text-sm text-gray-600">{i.text}</p>
                    </div>
                    <Link href={i.row.href} className="text-sm text-brand-text hover:underline shrink-0">Fix</Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-gray-200"><h2 className="font-semibold">Recently updated</h2></div>
            {recent.length === 0 ? <Empty>No content yet.</Empty> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-gray-500"><tr><th className="px-5 py-2 font-medium">Title</th><th className="px-3 py-2 font-medium">Type</th><th className="px-3 py-2 font-medium">Status</th><th className="px-5 py-2 font-medium">Updated</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {recent.map((r) => (
                      <tr key={r.kind + r.id}>
                        <td className="px-5 py-2.5"><Link href={r.href} className="font-medium hover:text-brand-text">{r.title}</Link></td>
                        <td className="px-3 py-2.5 text-gray-500">{labelOf(r.kind)}</td>
                        <td className="px-3 py-2.5"><StatusBadge item={r} /></td>
                        <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{fmtDateTime(r.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold mb-3">SEO health</h2>
            <div className="flex items-end gap-2"><span className={`text-4xl font-bold ${avg >= 85 ? "text-emerald-600" : avg >= 65 ? "text-amber-600" : "text-red-600"}`}>{avg}</span><span className="text-gray-400 mb-1">/ 100</span></div>
            <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden"><div className="h-full bg-brand" style={{ width: `${avg}%` }} /></div>
            <p className="text-xs text-gray-500 mt-2">Average across all pages: meta tags, alt text, FAQs and schema.</p>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-gray-200"><h2 className="font-semibold">Scheduled</h2></div>
            {scheduled.length === 0 ? <Empty>Nothing scheduled.</Empty> : (
              <ul className="divide-y divide-gray-100">
                {scheduled.slice(0, 5).map((r) => (
                  <li key={r.kind + r.id} className="px-5 py-3 text-sm"><Link href={r.href} className="font-medium hover:text-brand-text">{r.title}</Link><p className="text-xs text-gray-500">Goes live {fmtDate(r.publishAt)} · {labelOf(r.kind)}</p></li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold mb-3">Launch checklist</h2>
            <ul className="space-y-2 text-sm">
              {setup.map((s) => (
                <li key={s.text} className="flex gap-2"><Icon name={s.ok ? "circle-check" : "circle-exclamation"} className={s.ok ? "text-emerald-600" : "text-amber-500"} /><span className={s.ok ? "text-gray-600" : "text-gray-900"}>{s.text}</span></li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-3 break-all">Content folder: {CONTENT_DIR}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
