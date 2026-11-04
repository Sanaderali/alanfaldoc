import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { readAll, readPreview } from "@/lib/store";
import { cleanRichHtml } from "@/lib/html";
import CountryView from "../../../_views/CountryView";
import FaqsView from "../../../_views/FaqsView";
import PostView from "../../../_views/PostView";
import ServiceView from "../../../_views/ServiceView";
import type { Country, FaqGroup, Post, Service } from "@/types/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false, nocache: true } };

const kinds = { services: "service", countries: "country", posts: "post" } as const;

/** Admin-only preview of the page exactly as the website renders it, including drafts and unsaved edits. */
export default async function PreviewPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  await requirePerm("content.view");
  const { kind, id } = await params;

  let view: React.ReactNode;
  let back = "/admin";
  if (kind === "faqs") {
    const groups = (await readPreview<FaqGroup[]>("faqs")) ?? (await readAll("faqs"));
    view = <FaqsView groups={groups} />;
    back = "/admin/faqs";
  } else if (kind in kinds) {
    const k = kind as keyof typeof kinds;
    const item = (await readPreview<Record<string, unknown>>(id)) ?? (await readAll(k)).find((x) => x.id === id);
    if (!item) notFound();
    const safe = { ...item, contentHtml: item.contentHtml ? cleanRichHtml(item.contentHtml) : item.contentHtml };
    back = `/admin/${k}/${id.startsWith("new-") ? "new" : id}`;
    view = k === "services" ? <ServiceView service={safe as unknown as Service} /> : k === "countries" ? <CountryView country={safe as unknown as Country} /> : <PostView post={safe as unknown as Post} />;
  } else notFound();

  return (
    <>
      {view}
      <div className="fixed bottom-0 inset-x-0 z-[60] bg-gray-900/95 text-white text-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <span><strong>Preview</strong> <span className="text-gray-300">: this is how the page will look. It is not public until you publish.</span></span>
          <Link href={back} className="underline whitespace-nowrap">Back to editor</Link>
        </div>
      </div>
    </>
  );
}
