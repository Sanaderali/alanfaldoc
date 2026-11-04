import Link from "next/link";
import Icon from "@/app/components/Icon";
import { requireAdmin } from "@/lib/auth";
import { allRows, score } from "@/lib/admin-data";
import { visibility } from "@/lib/audit";
import { readAll } from "@/lib/store";
import { Card, PageHeader } from "../ui";

export const dynamic = "force-dynamic";

/** Dashboard home: statistics only. Adding/editing is done from each section's list. */
export default async function Dashboard() {
  await requireAdmin();
  const [rows, media] = await Promise.all([allRows(), readAll("media")]);
  const by = (k: string) => rows.filter((r) => r.kind === k);
  const n = (k: string, v: "live" | "draft" | "scheduled") => by(k).filter((r) => visibility(r) === v).length;

  const content = rows.filter((r) => r.kind !== "page");
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + score(r.issues), 0) / rows.length) : 100;
  const errors = rows.flatMap((r) => r.issues).filter((i) => i.level === "error").length;
  const warns = rows.flatMap((r) => r.issues).filter((i) => i.level === "warn").length;

  const cards = [
    { label: "Posts", kind: "post", href: "/admin/posts", icon: "newspaper" },
    { label: "Services", kind: "service", href: "/admin/services", icon: "briefcase" },
    { label: "Countries", kind: "country", href: "/admin/countries", icon: "earth-americas" },
    { label: "FAQ groups", kind: "faq", href: "/admin/faqs", icon: "circle-question" },
  ];
  const total = content.length || 1;
  const live = content.filter((r) => visibility(r) === "live").length;
  const draft = content.filter((r) => visibility(r) === "draft").length;
  const sched = content.filter((r) => visibility(r) === "scheduled").length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="An overview of your website content." />

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {cards.map((c) => (
          <Link key={c.kind} href={c.href}>
            <Card className="p-5 hover:border-brand/60 transition-colors h-full">
              <div className="flex items-center justify-between text-gray-400"><span className="text-sm text-gray-500">{c.label}</span><Icon name={c.icon} /></div>
              <p className="text-4xl font-bold mt-2">{by(c.kind).length}</p>
              <p className="text-xs text-gray-500 mt-2">{n(c.kind, "live")} published · {n(c.kind, "draft")} draft{n(c.kind, "scheduled") ? ` · ${n(c.kind, "scheduled")} scheduled` : ""}</p>
            </Card>
          </Link>
        ))}
        <Link href="/admin/media">
          <Card className="p-5 hover:border-brand/60 transition-colors h-full">
            <div className="flex items-center justify-between text-gray-400"><span className="text-sm text-gray-500">Images</span><Icon name="images" /></div>
            <p className="text-4xl font-bold mt-2">{media.length}</p>
            <p className="text-xs text-gray-500 mt-2">{media.filter((m) => !m.alt.trim()).length} missing alt text</p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Publishing status</h2>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100" role="img" aria-label={`${live} published, ${draft} draft, ${sched} scheduled`}>
            <div className="bg-emerald-500" style={{ width: `${(live / total) * 100}%` }} />
            <div className="bg-gray-400" style={{ width: `${(draft / total) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${(sched / total) * 100}%` }} />
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <li><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />Published <strong className="block text-2xl mt-1">{live}</strong></li>
            <li><span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400 mr-2" />Draft <strong className="block text-2xl mt-1">{draft}</strong></li>
            <li><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 mr-2" />Scheduled <strong className="block text-2xl mt-1">{sched}</strong></li>
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-4">SEO health</h2>
          <div className="flex items-end gap-2"><span className={`text-5xl font-bold ${avg >= 85 ? "text-emerald-600" : avg >= 65 ? "text-amber-600" : "text-red-600"}`}>{avg}</span><span className="text-gray-400 mb-1.5">/ 100</span></div>
          <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden"><div className="h-full bg-brand" style={{ width: `${avg}%` }} /></div>
          <p className="text-sm text-gray-500 mt-3">{errors} errors · {warns} warnings across meta tags, alt text, FAQs and schema.</p>
        </Card>
      </div>
    </>
  );
}
