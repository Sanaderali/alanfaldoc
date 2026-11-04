import Link from "next/link";
import Icon from "@/app/components/Icon";
import { auditCountry, auditPost, auditService, score, visibility } from "@/lib/audit";
import { readAll } from "@/lib/store";
import { btnGhost, Card, Empty, fmtDate, LinkButton, PageHeader, StatusBadge } from "../../ui";
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
      <PageHeader title={m.title} subtitle={m.sub} actions={<LinkButton href={`/admin/${kind}/new`} primary>Add new {m.singular}</LinkButton>} />

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

        {rows.length === 0 ? <Empty>Nothing found. <Link href={`/admin/${kind}/new`} className="text-brand-text hover:underline">Add one</Link></Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500 bg-gray-50">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Title</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium whitespace-nowrap">{kind === "posts" ? "Date" : "Last updated"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((x) => {
                  const issues = issuesOf(x);
                  const sc = score(issues);
                  const live = visibility(x) === "live";
                  return (
                    <tr key={x.id} className="group hover:bg-gray-50/60 align-top">
                      <td className="px-5 py-3">
                        <Link href={`/admin/${kind}/${x.id}`} className="font-semibold text-gray-900 hover:text-brand-text">{x.title ?? x.name}</Link>
                        {x.status === "draft" && <span className="text-gray-500"> — Draft</span>}
                        <p className="text-xs text-gray-400">{x.category ? `${x.category} · ` : ""}{m.pub}/{x.slug}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity">
                          <Link href={`/admin/${kind}/${x.id}`} className="text-brand-text hover:underline">Edit</Link>
                          {live && <Link href={`${m.pub}/${x.slug}`} target="_blank" className="text-brand-text hover:underline">View</Link>}
                          <form action={setStatus.bind(null, kind, x.id!, x.status === "draft" ? "published" : "draft")}>
                            <button className="text-brand-text hover:underline">{x.status === "draft" ? "Publish" : "Switch to draft"}</button>
                          </form>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <StatusBadge item={x} />
                        {sc < 85 && <p className="mt-1 text-xs text-amber-700" title={issues.map((i) => i.text).join("\n")}>SEO could be better</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{fmtDate(kind === "posts" ? x.date : x.updatedAt)}</td>
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
