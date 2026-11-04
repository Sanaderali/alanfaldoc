import Link from "next/link";
import Icon from "@/app/components/Icon";
import { auditCountry, auditPost, auditService, score, visibility } from "@/lib/audit";
import { readAll } from "@/lib/store";
import { Badge, btnGhost, Card, Empty, fmtDate, LinkButton, PageHeader, StatusBadge } from "../../ui";
import { setStatus } from "../actions";

type Kind = "services" | "countries" | "posts";
const meta = {
  services: { title: "Services", singular: "service", pub: "/services", sub: "Company formation, visas, attestation and more." },
  countries: { title: "Countries", singular: "country", pub: "/countries", sub: "Destination pages with facts, FAQs and sidebar links." },
  posts: { title: "Blog posts", singular: "post", pub: "/blog", sub: "News and guides. Schedule posts to publish automatically." },
} as const;

type Item = { id?: string; slug: string; status?: string; publishAt?: string; updatedAt?: string; date?: string; title?: string; name?: string; category?: string; image?: string; imageAlt?: string };

export default async function ResourceList({ kind, searchParams }: { kind: Kind; searchParams: { q?: string; status?: string } }) {
  const m = meta[kind];
  const all = (await readAll(kind)) as unknown as Item[];
  const q = (searchParams.q ?? "").toLowerCase().trim();
  const status = searchParams.status ?? "all";
  const issuesOf = (x: Item) => (kind === "services" ? auditService(x as never) : kind === "countries" ? auditCountry(x as never) : auditPost(x as never));

  const rows = all
    .filter((x) => (!q || `${x.title ?? x.name} ${x.slug} ${x.category ?? ""}`.toLowerCase().includes(q)) && (status === "all" || visibility(x) === status))
    .sort((a, b) => (kind === "posts" ? (b.date ?? "").localeCompare(a.date ?? "") : (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")));
  const counts = { all: all.length, live: all.filter((x) => visibility(x) === "live").length, draft: all.filter((x) => visibility(x) === "draft").length, scheduled: all.filter((x) => visibility(x) === "scheduled").length };

  return (
    <>
      <PageHeader title={m.title} subtitle={m.sub} actions={<LinkButton href={`/admin/${kind}/new`} primary>Add {m.singular}</LinkButton>} />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-200">
          <nav aria-label="Filter by status" className="flex gap-1 text-sm">
            {(["all", "live", "draft", "scheduled"] as const).map((s) => (
              <Link key={s} href={`/admin/${kind}?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`px-3 py-1.5 rounded-md ${status === s ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {s === "live" ? "Published" : s[0].toUpperCase() + s.slice(1)} <span className="opacity-60">{counts[s]}</span>
              </Link>
            ))}
          </nav>
          <form className="flex gap-2" role="search">
            <input type="hidden" name="status" value={status} />
            <input name="q" defaultValue={q} placeholder="Search…" aria-label="Search" className="px-3 py-2 text-sm border border-gray-300 rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-brand/40" />
            <button className={btnGhost}><Icon name="magnifying-glass" />Search</button>
          </form>
        </div>

        {rows.length === 0 ? <Empty>Nothing found.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500 bg-gray-50">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Title</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">{kind === "posts" ? "Publish date" : "Updated"}</th>
                  <th className="px-3 py-2.5 font-medium">SEO</th>
                  <th className="px-5 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((x) => {
                  const issues = issuesOf(x);
                  const sc = score(issues);
                  const live = visibility(x) === "live";
                  return (
                    <tr key={x.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3">
                        <Link href={`/admin/${kind}/${x.id}`} className="font-medium text-gray-900 hover:text-brand-text">{x.title ?? x.name}</Link>
                        <p className="text-xs text-gray-400">{m.pub}/{x.slug}{x.category ? ` · ${x.category}` : ""}</p>
                      </td>
                      <td className="px-3 py-3"><StatusBadge item={x} /></td>
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{fmtDate(kind === "posts" ? x.date : x.updatedAt)}</td>
                      <td className="px-3 py-3">
                        <span title={issues.map((i) => i.text).join("\n") || "No issues"}><Badge tone={sc >= 85 ? "ok" : sc >= 65 ? "warn" : "error"}>{sc}</Badge></span>
                        {issues.some((i) => i.level === "error") && <span className="ml-1.5 text-xs text-red-600">alt text</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end items-center gap-1.5">
                          {live && <Link href={`${m.pub}/${x.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-gray-700" aria-label="View live"><Icon name="arrow-up-right-from-square" /></Link>}
                          <form action={setStatus.bind(null, kind, x.id!, x.status === "draft" ? "published" : "draft")}>
                            <button className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50">{x.status === "draft" ? "Publish" : "Unpublish"}</button>
                          </form>
                          <Link href={`/admin/${kind}/${x.id}`} className="px-2.5 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-700">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
