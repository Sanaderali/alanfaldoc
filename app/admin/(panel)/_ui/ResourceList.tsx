import Link from "next/link";
import Icon from "@/app/components/Icon";
import Flag from "@/app/components/Flag";
import { auditCountry, auditPost, auditService, score, visibility } from "@/lib/audit";
import { readAll } from "@/lib/store";
import { slugify } from "@/lib/validate";
import { btnGhost, Badge, Empty, PageHeader, wpDate } from "../../ui";
import { bulkAction, deletePermanently, duplicateItem, emptyTrash, restoreItem, trashItem } from "../actions";
import SelectAll from "./SelectAll";

type Kind = "services" | "countries" | "posts";
const meta = {
  services: { title: "Services", single: "Service", plural: "Services", pub: "/services" },
  countries: { title: "Countries", single: "Country", plural: "Countries", pub: "/countries" },
  posts: { title: "Posts", single: "Post", plural: "Posts", pub: "/blog" },
} as const;

export type ListParams = { q?: string; status?: string; orderby?: string; order?: string; paged?: string; m?: string; cat?: string };
type Item = { id?: string; slug: string; status?: string; publishAt?: string; updatedAt?: string; createdAt?: string; date?: string; title?: string; name?: string; category?: string; tags?: string[]; author?: string; flag?: string; flagImage?: string; icon?: string };
const PER_PAGE = 20;

const linkBtn = "text-brand-text hover:text-brand-dark hover:underline";

export default async function ResourceList({ kind, params }: { kind: Kind; params: ListParams }) {
  const m = meta[kind];
  const all = (await readAll(kind)) as unknown as Item[];
  const title = (x: Item) => x.title ?? x.name ?? "";
  const when = (x: Item) => (kind === "posts" ? x.publishAt ?? (x.date ? `${x.date}T00:00:00.000Z` : x.updatedAt) : x.updatedAt);

  const q = (params.q ?? "").toLowerCase().trim();
  const status = params.status ?? "all";
  const orderby = params.orderby === "title" ? "title" : "date";
  const order = params.order === "asc" ? "asc" : "desc";
  const paged = Math.max(1, Number(params.paged) || 1);
  const mo = params.m ?? "";
  const cat = params.cat ?? "";

  const nonTrash = all.filter((x) => x.status !== "trash");
  const counts = {
    all: nonTrash.length,
    live: nonTrash.filter((x) => visibility(x) === "live").length,
    draft: nonTrash.filter((x) => visibility(x) === "draft").length,
    scheduled: nonTrash.filter((x) => visibility(x) === "scheduled").length,
    trash: all.length - nonTrash.length,
  };

  const months = [...new Set(all.map((x) => (when(x) ?? "").slice(0, 7)).filter(Boolean))].sort().reverse();
  const cats = kind === "posts" ? [...new Set(all.map((x) => x.category).filter(Boolean) as string[])].sort() : [];

  let rows = all.filter((x) => {
    const v = visibility(x);
    if (status === "trash" ? v !== "trash" : v === "trash") return false;
    if (status !== "all" && status !== "trash" && v !== status) return false;
    if (q && !`${title(x)} ${x.slug} ${x.category ?? ""} ${(x.tags ?? []).join(" ")}`.toLowerCase().includes(q)) return false;
    if (mo && (when(x) ?? "").slice(0, 7) !== mo) return false;
    if (cat && slugify(x.category ?? "") !== cat) return false;
    return true;
  });
  rows = rows.sort((a, b) => {
    const r = orderby === "title" ? title(a).localeCompare(title(b)) : (when(a) ?? "").localeCompare(when(b) ?? "");
    return order === "asc" ? r : -r;
  });

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const page = Math.min(paged, pages);
  const shown = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const href = (over: Record<string, string | undefined>) => {
    const p = { q: params.q, status: params.status, orderby: params.orderby, order: params.order, m: params.m, cat: params.cat, paged: params.paged, ...over };
    const s = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
    return `/admin/${kind}${s ? `?${s}` : ""}`;
  };
  const sortHref = (col: "title" | "date") => href({ orderby: col, order: orderby === col && order === "asc" ? "desc" : "asc", paged: undefined });
  const arrow = (col: string) => (orderby === col ? <span className="text-[10px] ml-1" aria-hidden="true">{order === "asc" ? "▲" : "▼"}</span> : null);

  const tabs: { key: string; label: string; n: number }[] = [
    { key: "all", label: "All", n: counts.all },
    { key: "live", label: "Published", n: counts.live },
    { key: "draft", label: "Draft", n: counts.draft },
    { key: "scheduled", label: "Scheduled", n: counts.scheduled },
    { key: "trash", label: "Trash", n: counts.trash },
  ].filter((t) => t.key === "all" || t.n > 0);

  const inTrash = status === "trash";
  const issues = (x: Item) => (kind === "services" ? auditService(x as never) : kind === "countries" ? auditCountry(x as never) : auditPost(x as never));
  const pagination = (
    <div className="flex items-center gap-1 text-[13px]">
      <span className="text-a-muted mr-1">{rows.length} item{rows.length === 1 ? "" : "s"}</span>
      {pages > 1 && (
        <>
          {[["«", 1], ["‹", page - 1]].map(([l, p]) => (page > 1 ? <Link key={String(l)} href={href({ paged: String(p) })} className="w-7 h-7 flex items-center justify-center border border-a-line bg-a-raised rounded-[3px] text-brand-text">{l}</Link> : <span key={String(l)} className="w-7 h-7 flex items-center justify-center border border-a-line bg-a-raised rounded-[3px] text-a-subtle">{l}</span>))}
          <span className="px-2">{page} of {pages}</span>
          {[["›", page + 1], ["»", pages]].map(([l, p]) => (page < pages ? <Link key={String(l)} href={href({ paged: String(p) })} className="w-7 h-7 flex items-center justify-center border border-a-line bg-a-raised rounded-[3px] text-brand-text">{l}</Link> : <span key={String(l)} className="w-7 h-7 flex items-center justify-center border border-a-line bg-a-raised rounded-[3px] text-a-subtle">{l}</span>))}
        </>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title={m.title} addNew={{ href: `/admin/${kind}/new`, label: `Add New ${m.single}` }} />

      {/* filter links + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <ul className="flex flex-wrap items-center gap-1 text-[13px] text-a-muted">
          {tabs.map((t, i) => (
            <li key={t.key} className="flex items-center gap-1">
              {i > 0 && <span className="text-a-subtle">|</span>}
              <Link href={`/admin/${kind}${t.key === "all" ? "" : `?status=${t.key}`}`} aria-current={status === t.key ? "page" : undefined} className={`hover:text-brand-text ${status === t.key ? "font-semibold text-a-text" : "text-brand-text"}`}>
                {t.label} <span className="text-a-muted font-normal">({t.n})</span>
              </Link>
            </li>
          ))}
        </ul>
        <form role="search" className="flex gap-1.5">
          <input type="hidden" name="status" value={status === "all" ? "" : status} />
          <input name="q" defaultValue={params.q ?? ""} aria-label={`Search ${m.plural}`} className="px-2 py-1 text-[13px] border border-a-line2 rounded-[3px] w-48 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
          <button className={btnGhost}>Search {m.plural}</button>
        </form>
      </div>

      {/* bulk form target (inputs elsewhere join it with form="bulk") */}
      <form id="bulk" action={bulkAction} />
      <input type="hidden" name="kind" value={kind} form="bulk" />

      {/* table navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <select name="action" form="bulk" aria-label="Bulk actions" className="px-2 py-1 text-[13px] border border-a-line2 rounded-[3px] bg-a-surface">
              <option value="">Bulk actions</option>
              {inTrash ? (<><option value="restore">Restore</option><option value="delete">Delete Permanently</option></>) : (<><option value="publish">Publish</option><option value="draft">Move to Draft</option><option value="trash">Move to Trash</option></>)}
            </select>
            <button type="submit" form="bulk" className={btnGhost}>Apply</button>
          </div>
          <form className="flex items-center gap-1.5">
            <input type="hidden" name="status" value={status === "all" ? "" : status} />
            <input type="hidden" name="q" value={params.q ?? ""} />
            <select name="m" defaultValue={mo} aria-label="Filter by date" className="px-2 py-1 text-[13px] border border-a-line2 rounded-[3px] bg-a-surface">
              <option value="">All dates</option>
              {months.map((x) => <option key={x} value={x}>{new Date(`${x}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}</option>)}
            </select>
            {kind === "posts" && (
              <select name="cat" defaultValue={cat} aria-label="Filter by category" className="px-2 py-1 text-[13px] border border-a-line2 rounded-[3px] bg-a-surface">
                <option value="">All Categories</option>
                {cats.map((c) => <option key={c} value={slugify(c)}>{c}</option>)}
              </select>
            )}
            <button className={btnGhost}>Filter</button>
          </form>
          {inTrash && counts.trash > 0 && <form action={emptyTrash.bind(null, kind)}><button className={btnGhost}>Empty Trash</button></form>}
        </div>
        {pagination}
      </div>

      <div className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] overflow-x-auto">
        {shown.length === 0 ? <Empty>No {m.plural.toLowerCase()} found.</Empty> : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left border-b border-a-line">
                <td className="w-10 px-3 py-2.5"><SelectAll /></td>
                <th className="px-3 py-2.5 font-normal"><Link href={sortHref("title")} className="text-brand-text hover:text-brand-dark">Title{arrow("title")}</Link></th>
                {kind === "posts" && <><th className="px-3 py-2.5 font-normal">Author</th><th className="px-3 py-2.5 font-normal">Categories</th><th className="px-3 py-2.5 font-normal">Tags</th></>}
                {kind !== "posts" && <><th className="px-3 py-2.5 font-normal">URL</th><th className="px-3 py-2.5 font-normal">SEO</th></>}
                <th className="px-3 py-2.5 font-normal whitespace-nowrap"><Link href={sortHref("date")} className="text-brand-text hover:text-brand-dark">Date{arrow("date")}</Link></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((x, n) => {
                const v = visibility(x);
                const sc = score(issues(x));
                const editHref = `/admin/${kind}/${x.id}`;
                const viewHref = v === "live" ? `${m.pub}/${x.slug}` : `/preview/${kind}/${x.id}`;
                return (
                  <tr key={x.id} className={`group align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                    <th scope="row" className="px-3 py-2.5 font-normal"><input type="checkbox" name="ids" value={x.id} form="bulk" aria-label={`Select ${title(x)}`} className="rounded-[3px] border-a-line2 text-brand focus:ring-brand" /></th>
                    <td className="px-3 py-2.5 min-w-[14rem]">
                      <div className="flex items-center gap-2">
                        {kind === "countries" && <Flag country={x as never} size={22} />}
                        {kind === "services" && x.icon && <Icon name={x.icon} className="text-a-subtle" />}
                        <Link href={inTrash ? "#" : editHref} className="font-semibold text-[14px] text-brand-text hover:text-brand-dark">{title(x)}</Link>
                        {v === "draft" && <span className="font-semibold text-a-muted"> — Draft</span>}
                        {v === "scheduled" && <span className="font-semibold text-amber-300"> — Scheduled</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity">
                        {inTrash ? (
                          <>
                            <form action={restoreItem.bind(null, kind, x.id!)}><button className={linkBtn}>Restore</button></form>
                            <span className="text-a-subtle">|</span>
                            <form action={deletePermanently.bind(null, kind, x.id!)}><button className="text-a-red hover:text-a-red/80 hover:underline">Delete Permanently</button></form>
                          </>
                        ) : (
                          <>
                            <Link href={editHref} className={linkBtn}>Edit</Link><span className="text-a-subtle">|</span>
                            <form action={duplicateItem.bind(null, kind, x.id!)}><button className={linkBtn}>Duplicate</button></form><span className="text-a-subtle">|</span>
                            <form action={trashItem.bind(null, kind, x.id!)}><button className="text-a-red hover:text-a-red/80 hover:underline">Trash</button></form><span className="text-a-subtle">|</span>
                            <Link href={viewHref} target="_blank" className={linkBtn}>{v === "live" ? "View" : "Preview"}</Link>
                          </>
                        )}
                      </div>
                    </td>
                    {kind === "posts" && (
                      <>
                        <td className="px-3 py-2.5 text-brand-text">{x.author ?? "-"}</td>
                        <td className="px-3 py-2.5">{x.category ? <Link href={`/admin/posts?cat=${slugify(x.category)}`} className="text-brand-text hover:underline">{x.category}</Link> : "—"}</td>
                        <td className="px-3 py-2.5 text-brand-text">{(x.tags ?? []).length ? x.tags!.join(", ") : <span className="text-a-muted">—</span>}</td>
                      </>
                    )}
                    {kind !== "posts" && (
                      <>
                        <td className="px-3 py-2.5 text-a-muted">{m.pub}/{x.slug}</td>
                        <td className="px-3 py-2.5" title={issues(x).map((i) => i.text).join("\n") || "No issues"}><Badge tone={sc >= 85 ? "ok" : sc >= 65 ? "warn" : "error"}>{sc}</Badge></td>
                      </>
                    )}
                    <td className="px-3 py-2.5 whitespace-nowrap text-a-muted">
                      {v === "live" ? (kind === "posts" ? "Published" : "Last Modified") : v === "scheduled" ? "Scheduled" : v === "trash" ? "Last Modified" : "Last Modified"}
                      <br />{wpDate(when(x))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="text-left border-t border-a-line">
                <td className="px-3 py-2.5"><SelectAll label="Select all (bottom)" /></td>
                <th className="px-3 py-2.5 font-normal text-brand-text">Title</th>
                {kind === "posts" ? <><th className="px-3 py-2.5 font-normal">Author</th><th className="px-3 py-2.5 font-normal">Categories</th><th className="px-3 py-2.5 font-normal">Tags</th></> : <><th className="px-3 py-2.5 font-normal">URL</th><th className="px-3 py-2.5 font-normal">SEO</th></>}
                <th className="px-3 py-2.5 font-normal text-brand-text">Date</th>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
      <div className="flex justify-end mt-3">{pagination}</div>
    </>
  );
}
