import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { readAll } from "@/lib/store";
import { Badge, Empty, PageHeader, btnGhost, wpDate } from "../../ui";
import { deleteLanding, publishAllLandings, setLandingStatus } from "../landings-actions";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const me = await requirePerm("content.view");
  const { q = "", status = "all" } = await searchParams;
  const all = (await readAll("landings")).sort((a, b) => a.slug.localeCompare(b.slug));
  const rows = all.filter((l) => (status === "all" || (status === "draft" ? l.status === "draft" : l.status === "published")) && (!q || `${l.title} ${l.slug}`.toLowerCase().includes(q.toLowerCase())));
  const drafts = all.filter((l) => l.status === "draft").length;
  const canPub = can(me, "content.publish");
  return (
    <>
      <PageHeader title="Service × Country pages" subtitle="Service pages written for one country, such as Company Formation for Indian investors. Create them by importing a content pack, then review and publish." />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <ul className="flex items-center gap-1 text-[13px]">
          {([["all", `All (${all.length})`], ["draft", `Draft (${drafts})`], ["published", `Published (${all.length - drafts})`]] as const).map(([k, label], i) => (
            <li key={k} className="flex items-center gap-1">{i > 0 && <span className="text-a-subtle">|</span>}<Link href={`/admin/landings${k === "all" ? "" : `?status=${k}`}`} className={`hover:text-brand-dark ${status === k ? "font-semibold text-a-text" : "text-brand-text"}`}>{label}</Link></li>
          ))}
        </ul>
        <div className="flex gap-2 flex-wrap">
          <form role="search" className="flex gap-1.5"><input type="hidden" name="status" value={status === "all" ? "" : status} /><input name="q" defaultValue={q} aria-label="Search pages" className="px-2 py-1 text-[13px] border border-a-line2 rounded-[3px] w-44" /><button className={btnGhost}>Search</button></form>
          {canPub && drafts > 0 && <form action={publishAllLandings}><button className={btnGhost}>Publish all {drafts} drafts</button></form>}
          <Link href="/admin/import" className={btnGhost}>Import pack</Link>
        </div>
      </div>
      <div className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] overflow-x-auto">
        {rows.length === 0 ? <Empty>{all.length === 0 ? <>No pages yet. Import a content pack that contains <code>landings</code>.</> : "No pages match."}</Empty> : (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left border-b border-a-line"><th className="px-3 py-2.5 font-normal">Title</th><th className="px-3 py-2.5 font-normal">URL</th><th className="px-3 py-2.5 font-normal">Status</th><th className="px-3 py-2.5 font-normal">Updated</th><th className="px-3 py-2.5 font-normal">Actions</th></tr></thead>
            <tbody>{rows.map((l, n) => (
              <tr key={l.id} className={`align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                <td className="px-3 py-2.5 font-semibold text-[14px]">{l.title}</td>
                <td className="px-3 py-2.5 text-a-muted">/services/{l.slug}</td>
                <td className="px-3 py-2.5">{l.status === "published" ? <Badge tone="ok">Published</Badge> : <Badge tone="warn">Draft</Badge>}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-a-muted">{wpDate(l.updatedAt)}</td>
                <td className="px-3 py-2.5"><div className="flex flex-wrap items-center gap-1.5">
                  {l.status === "published" ? <Link href={`/services/${l.slug}`} target="_blank" className="text-brand-text hover:underline">View</Link> : <span className="text-a-muted">Not public yet</span>}
                  {canPub && <><span className="text-a-subtle">|</span><form action={setLandingStatus.bind(null, l.id!, l.status === "published" ? "draft" : "published")}><button className="text-brand-text hover:underline">{l.status === "published" ? "Move to draft" : "Publish"}</button></form></>}
                  {can(me, "content.delete") && <><span className="text-a-subtle">|</span><form action={deleteLanding.bind(null, l.id!)}><button className="text-a-red hover:underline">Delete</button></form></>}
                </div></td>
              </tr>))}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
