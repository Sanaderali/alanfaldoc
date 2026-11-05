import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { readAll } from "@/lib/store";
import { Empty, PageHeader, btnGhost } from "../../ui";
import { feedbackToReview } from "../enquiries-actions";

export const dynamic = "force-dynamic";

const dash = (v?: string) => v || <span className="text-a-subtle">-</span>;

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; s?: string }> }) {
  const me = await requirePerm("chat.view");
  const { q = "", s = "" } = await searchParams;
  const all = (await readAll("chats")).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  const rows = all.filter((c) => (!s || (s === "open" ? c.status === "open" : s === "closed" ? c.status === "closed" : !!c.feedback)) && (!q || [c.name, c.phone, c.profile?.email, c.profile?.nationality, c.profile?.businessType, c.profile?.companyName, c.profile?.query, c.summary].join(" ").toLowerCase().includes(q.toLowerCase())));
  const canReview = can(me, "content.edit");
  return (
    <>
      <PageHeader title="Enquiries" subtitle="What each visitor asked and what they told us during the chat. Details are noted automatically from the conversation. Click a row to open the chat." />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <ul className="flex items-center gap-1 text-[13px]">
          {([["", `All (${all.length})`], ["open", `Open (${all.filter((c) => c.status === "open").length})`], ["closed", `Closed (${all.filter((c) => c.status === "closed").length})`], ["feedback", `With feedback (${all.filter((c) => c.feedback).length})`]] as const).map(([k, l], i) => (
            <li key={k} className="flex items-center gap-1">{i > 0 && <span className="text-a-subtle">|</span>}<Link href={k ? `/admin/enquiries?s=${k}` : "/admin/enquiries"} className={s === k ? "font-semibold text-a-text" : "text-brand-text hover:text-brand-dark"}>{l}</Link></li>
          ))}
        </ul>
        <form role="search" className="flex gap-1.5"><input type="hidden" name="s" value={s} /><input name="q" defaultValue={q} aria-label="Search enquiries" className="px-2 py-1 text-[13px] border border-a-line2 rounded-[3px] w-56" placeholder="Name, phone, nationality…" /><button className={btnGhost}>Search</button></form>
      </div>
      <div className="bg-a-surface border border-a-line overflow-x-auto">
        {rows.length === 0 ? <Empty>No enquiries yet.</Empty> : (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left border-b border-a-line">{["Client", "Location", "Nationality", "Business / company", "Visa / stay / travel", "Enquiry", "Status", "Feedback"].map((h) => <th key={h} className="px-3 py-2.5 font-normal text-a-muted whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((c, n) => {
                const p = c.profile ?? {};
                const place = p.basedIn || [c.city, c.country].filter(Boolean).join(", ");
                return (
                  <tr key={c.id} className={`align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                    <td className="px-3 py-2.5 min-w-[11rem]"><Link href={`/admin/chat?c=${c.id}`} className="font-semibold text-brand-text hover:underline">{p.name || c.name || "Visitor"}</Link><div className="text-a-muted">{c.phone}</div><div className="text-a-muted break-all">{p.email || ""}</div><div className="text-[11px] text-a-subtle">{new Date(c.createdAt).toLocaleDateString("en-GB")}</div></td>
                    <td className="px-3 py-2.5">{dash(place)}</td>
                    <td className="px-3 py-2.5">{dash(p.nationality)}</td>
                    <td className="px-3 py-2.5 min-w-[9rem]">{dash(p.businessType)}<div className="text-a-muted">{p.companyName}</div></td>
                    <td className="px-3 py-2.5 min-w-[10rem]">{dash(p.visaStatus)}<div className="text-a-muted">{p.stayDuration}</div><div className="text-a-muted">{p.travelHistory}</div></td>
                    <td className="px-3 py-2.5 min-w-[16rem]">{dash(p.query)}{c.summary && <details className="mt-1"><summary className="cursor-pointer text-brand-text">Chat summary</summary><p className="mt-1 whitespace-pre-wrap text-a-muted">{c.summary}</p></details>}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{c.status === "open" ? <span className="text-green-500">Open</span> : <span className="text-a-muted">Closed</span>}{c.status === "closed" && <div className="text-[11px] text-a-subtle">by {c.closedBy === "visitor" ? "client" : c.closedByName || "staff"}</div>}</td>
                    <td className="px-3 py-2.5 min-w-[9rem]">{c.feedback ? <><span className="text-amber-400">{"★".repeat(c.feedback.rating)}{"☆".repeat(5 - c.feedback.rating)}</span>{c.feedback.comment && <div className="text-a-muted">&ldquo;{c.feedback.comment}&rdquo;</div>}{canReview && (c.feedback.reviewId ? <div className="text-[11px] text-a-subtle">In Reviews (draft)</div> : <form action={feedbackToReview.bind(null, c.id)}><button className="mt-1 text-[12px] text-brand-text hover:underline">Add to Reviews</button></form>)}</> : dash()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
