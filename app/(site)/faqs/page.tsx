import type { Metadata } from "next";
import FaqsView from "../_views/FaqsView";
import { getFaqGroups, getPageSeo, getServices } from "@/lib/content";
import { buildMetadata, customLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("faqs");
  return buildMetadata({ title: "Frequently Asked Questions", description: "Answers to common questions about company formation, visas, document attestation and our process in Dubai & the UAE.", path: "/faqs", seo });
}

export default async function FaqsPage() {
  const [general, services, { faqSchema, schemaCustom }] = await Promise.all([getFaqGroups(), getServices(), getPageSeo("faqs")]);
  // one group per published service, using that service's own FAQs (edit them in the service editor)
  const perService = services.filter((s) => s.faqs.length > 0).map((s) => ({ id: `svc-${s.slug}`, title: `${s.title}`, faqs: s.faqs.slice(0, 10), href: `/services/${s.slug}` }));
  const groups = [...general, ...perService] as Parameters<typeof FaqsView>[0]["groups"];
  return <FaqsView groups={groups} faqSchema={faqSchema} extra={customLd(schemaCustom)} />;
}
