import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { site } from "@/data/site";
import { PageHeader } from "../../../ui";
import PageSeoEditor from "../../_ui/PageSeoEditor";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  await requireAdmin();
  const { key } = await params;
  const [pages, faqs] = await Promise.all([readAll("pages"), readAll("faqs")]);
  const p = pages.find((x) => x.key === key);
  if (!p) notFound();
  const liveFaqs = faqs.filter((g) => g.status !== "draft").flatMap((g) => g.faqs);
  return (
    <>
      <PageHeader title={`SEO: ${p.name}`} subtitle={p.path} />
      <PageSeoEditor pageKey={p.key} name={p.name} path={p.path} initial={JSON.parse(JSON.stringify(p))} siteUrl={site.url} siteName={site.name} faqs={liveFaqs} />
    </>
  );
}
