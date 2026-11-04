import type { Metadata } from "next";
import Breadcrumb from "@/app/components/Breadcrumb";
import CTABanner from "@/app/components/CTABanner";
import FaqList from "@/app/components/FaqList";
import JsonLd from "@/app/components/JsonLd";
import Reveal from "@/app/components/Reveal";
import { getFaqGroups, getPageSeo } from "@/lib/content";
import { buildMetadata, customLd, faqLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("faqs");
  return buildMetadata({ title: "Frequently Asked Questions", description: "Answers to common questions about company formation, visas, document attestation and our process in Dubai & the UAE.", path: "/faqs", seo });
}

export default async function FaqsPage() {
  const [groups, { faqSchema, schemaCustom }] = await Promise.all([getFaqGroups(), getPageSeo("faqs")]);
  const extra = customLd(schemaCustom);
  return (
    <>
      <Breadcrumb items={[{ label: "FAQs" }]} />
      {faqSchema && <JsonLd data={faqLd(groups.flatMap((g) => g.faqs))} />}
      {extra && <JsonLd data={extra} />}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Quick answers to the questions we hear most. Can&apos;t find yours? Ask us.</p>
          </div>
          <div className="md:columns-2 md:gap-12 [column-fill:balance]">
            {groups.map((g, i) => (
              <Reveal key={g.title} delay={(i % 2) * 80} className="break-inside-avoid mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-5">{g.title}</h2>
                <FaqList faqs={g.faqs} defaultOpen={i === 0 ? 0 : null} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}
