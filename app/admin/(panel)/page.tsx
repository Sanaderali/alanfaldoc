import Link from "next/link";
import Icon from "@/app/components/Icon";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { can, landingPath } from "@/lib/rbac";
import { allRows, score } from "@/lib/admin-data";
import { visibility } from "@/lib/audit";
import { readAll } from "@/lib/store";
import { site } from "@/data/site";
import { PageHeader } from "../ui";

export const dynamic = "force-dynamic";

function Widget({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] ${className}`}>
      <h2 className="px-3 py-2.5 font-semibold text-[14px] border-b border-a-line">{title}</h2>
      <div className="p-3">{children}</div>
    </section>
  );
}

/** Dashboard home: statistics only, laid out like WordPress dashboard widgets. */
export default async function Dashboard() {
  const me = await requireUser();
  if (!can(me, "dashboard.view")) redirect(landingPath(me)); // e.g. Support Agents start in the chat inbox
  const [rows, media] = await Promise.all([allRows(), readAll("media")]);
  const by = (k: string) => rows.filter((r) => r.kind === k);
  const content = rows.filter((r) => r.kind !== "page" && r.kind !== "faq");
  const live = content.filter((r) => visibility(r) === "live").length;
  const draft = content.filter((r) => visibility(r) === "draft").length;
  const sched = content.filter((r) => visibility(r) === "scheduled").length;
  const total = content.length || 1;
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + score(r.issues), 0) / rows.length) : 100;
  const errors = rows.flatMap((r) => r.issues).filter((i) => i.level === "error").length;
  const warns = rows.flatMap((r) => r.issues).filter((i) => i.level === "warn").length;

  const glance = [
    { n: by("post").length, label: by("post").length === 1 ? "Post" : "Posts", href: "/admin/posts", icon: "thumbtack" },
    { n: by("service").length, label: by("service").length === 1 ? "Service" : "Services", href: "/admin/services", icon: "briefcase" },
    { n: by("country").length, label: by("country").length === 1 ? "Country" : "Countries", href: "/admin/countries", icon: "earth-americas" },
    { n: by("faq").length, label: by("faq").length === 1 ? "FAQ group" : "FAQ groups", href: "/admin/faqs", icon: "circle-question" },
    { n: media.length, label: media.length === 1 ? "Image" : "Images", href: "/admin/media", icon: "images" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          <Widget title="At a Glance">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
              {glance.map((g) => (
                <li key={g.label}><Link href={g.href} className="flex items-center gap-2 text-brand-text hover:text-brand-dark"><Icon name={g.icon} className="text-a-subtle" /><span><strong className="text-a-text">{g.n}</strong> {g.label}</span></Link></li>
              ))}
            </ul>
            <p className="mt-4 pt-3 border-t border-a-line text-[13px] text-a-muted">{site.name} · {site.tagline}</p>
          </Widget>

          <Widget title="Publishing status">
            <div className="flex h-3 rounded-sm overflow-hidden bg-a-line" role="img" aria-label={`${live} published, ${draft} draft, ${sched} scheduled`}>
              <div className="bg-brand" style={{ width: `${(live / total) * 100}%` }} />
              <div className="bg-a-subtle" style={{ width: `${(draft / total) * 100}%` }} />
              <div className="bg-amber-400" style={{ width: `${(sched / total) * 100}%` }} />
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
              <li><span className="inline-block w-2.5 h-2.5 rounded-full bg-brand mr-1.5" />Published <strong className="block text-2xl font-semibold mt-0.5">{live}</strong></li>
              <li><span className="inline-block w-2.5 h-2.5 rounded-full bg-a-subtle mr-1.5" />Draft <strong className="block text-2xl font-semibold mt-0.5">{draft}</strong></li>
              <li><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5" />Scheduled <strong className="block text-2xl font-semibold mt-0.5">{sched}</strong></li>
            </ul>
          </Widget>
        </div>

        <Widget title="SEO health">
          <div className="flex items-end gap-2"><span className={`text-5xl font-semibold ${avg >= 85 ? "text-brand" : avg >= 65 ? "text-amber-300" : "text-a-red"}`}>{avg}</span><span className="text-a-subtle mb-1.5">/ 100</span></div>
          <div className="h-2 bg-a-line rounded-sm mt-3 overflow-hidden"><div className="h-full bg-brand" style={{ width: `${avg}%` }} /></div>
          <p className="text-[13px] text-a-muted mt-3">{errors} errors · {warns} warnings across meta tags, alt text, FAQs and schema.</p>
        </Widget>
      </div>
    </>
  );
}
