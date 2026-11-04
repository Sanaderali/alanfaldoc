import Breadcrumb from "@/app/components/Breadcrumb";
import CTABanner from "@/app/components/CTABanner";
import FaqList from "@/app/components/FaqList";
import JsonLd from "@/app/components/JsonLd";
import Reveal from "@/app/components/Reveal";
import { faqLd } from "@/lib/seo";
import type { FaqGroup } from "@/types/content";

/** Shared layout for the live /faqs page and the dashboard preview. */
export default function FaqsView({ groups, faqSchema = false, extra = null }: { groups: FaqGroup[]; faqSchema?: boolean; extra?: object | null }) {
  return (
    <>
      <Breadcrumb items={[{ label: "FAQs" }]} />
      {faqSchema && <JsonLd data={faqLd(groups.flatMap((g) => g.faqs))} />}
      {extra && <JsonLd data={extra} />}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Quick answers to the questions we hear most. Can&apos;t find yours? Ask us.</p>
          </div>
          <div className="md:columns-2 md:gap-12 [column-fill:balance]">
            {groups.map((g, i) => (
              <Reveal key={g.title} delay={(i % 2) * 80} className="break-inside-avoid mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-text mb-5">{g.title}</h2>
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
