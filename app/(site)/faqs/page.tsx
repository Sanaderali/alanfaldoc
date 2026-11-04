import type { Metadata } from "next";
import FaqsView from "../_views/FaqsView";
import { getFaqGroups, getPageSeo } from "@/lib/content";
import { buildMetadata, customLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("faqs");
  return buildMetadata({ title: "Frequently Asked Questions", description: "Answers to common questions about company formation, visas, document attestation and our process in Dubai & the UAE.", path: "/faqs", seo });
}

export default async function FaqsPage() {
  const [groups, { faqSchema, schemaCustom }] = await Promise.all([getFaqGroups(), getPageSeo("faqs")]);
  return <FaqsView groups={groups} faqSchema={faqSchema} extra={customLd(schemaCustom)} />;
}
