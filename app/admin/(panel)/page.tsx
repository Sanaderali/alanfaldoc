import Link from "next/link";
import Icon from "@/app/components/Icon";
import { requireAdmin } from "@/lib/auth";
import { allRows, labelOf } from "@/lib/admin-data";
import { visibility } from "@/lib/audit";
import { Card, Empty, fmtDate, LinkButton, PageHeader, StatusBadge } from "../ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  const rows = (await allRows()).filter((r) => r.kind !== "page" && r.kind !== "faq");
  const drafts = rows.filter((r) => visibility(r) === "draft").sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")).slice(0, 5);
  const recent = [...rows].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")).slice(0, 6);
  const scheduled = rows.filter((r) => visibility(r) === "scheduled");
  const todo = rows.flatMap((r) => r.issues.filter((i) => i.level === "error").map((i) => ({ ...i, row: r }))).slice(0, 4);
  const count = (k: string) => rows.filter((r) => r.kind === k).length;

  const glance = [
    { label: "Posts", n: count("post"), href: "/admin/posts", icon: "newspaper" },
    { label: "Services", n: count("service"), href: "/admin/services", icon: "briefcase" },
    { label: "Countries", n: count("country"), href: "/admin/countries", icon: "earth-americas" },
  ];

  return (
    <>
      <PageHeader title="Welcome back" subtitle="Add or edit your website content. Changes appear on the live site within moments." />

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <LinkButton href="/admin/posts/new" primary><Icon name="plus" />New post</LinkButton>
        <LinkButton href="/admin/services/new"><Icon name="plus" />New service</LinkButton>
        <LinkButton href="/admin/countries/new"><Icon name="plus" />New country</LinkButton>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {glance.map((g) => (
          <Link key={g.label} href={g.href}>
            <Card className="p-4 hover:border-brand/60 transition-colors h-full">
              <div className="flex items-center justify-between text-gray-400"><span className="text-sm text-gray-500">{g.label}</span><Icon name={g.icon} /></div>
              <p className="text-3xl font-bold mt-1">{g.n}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-5 py-4 border-b border-gray-200"><h2 className="font-semibold">Drafts</h2></div>
          {drafts.length === 0 ? <Empty>No drafts. Everything is published.</Empty> : (
            <ul className="divide-y divide-gray-100">
              {drafts.map((r) => (
                <li key={r.kind + r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0"><Link href={r.href} className="font-medium hover:text-brand-text">{r.title}</Link><p className="text-xs text-gray-400">{labelOf(r.kind)}</p></div>
                  <Link href={r.href} className="text-brand-text hover:underline shrink-0">Continue</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-gray-200"><h2 className="font-semibold">Recent activity</h2></div>
          <ul className="divide-y divide-gray-100">
            {recent.map((r) => (
              <li key={r.kind + r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0"><Link href={r.href} className="font-medium hover:text-brand-text">{r.title}</Link><p className="text-xs text-gray-400">{labelOf(r.kind)} · {fmtDate(r.updatedAt)}</p></div>
                <StatusBadge item={r} />
              </li>
            ))}
          </ul>
        </Card>

        {(todo.length > 0 || scheduled.length > 0) && (
          <Card className="lg:col-span-2">
            <div className="px-5 py-4 border-b border-gray-200"><h2 className="font-semibold">To do</h2></div>
            <ul className="divide-y divide-gray-100">
              {todo.map((t, n) => (
                <li key={n} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span><span className="font-medium">{t.row.title}</span> <span className="text-gray-500">: {t.text}</span></span>
                  <Link href={t.row.href} className="text-brand-text hover:underline shrink-0">Fix</Link>
                </li>
              ))}
              {scheduled.map((r) => (
                <li key={r.kind + r.id} className="px-5 py-3 text-sm"><span className="font-medium">{r.title}</span> <span className="text-gray-500">goes live {fmtDate(r.publishAt)}</span></li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
