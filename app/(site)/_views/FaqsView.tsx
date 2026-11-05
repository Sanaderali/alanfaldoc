import Breadcrumb from "@/app/components/Breadcrumb";
import CTABanner from "@/app/components/CTABanner";
import FaqList from "@/app/components/FaqList";
import JsonLd from "@/app/components/JsonLd";
import Link from "@/app/components/SiteLink";
import Reveal from "@/app/components/Reveal";
import { faqLd } from "@/lib/seo";
import type { FaqGroup } from "@/types/content";

/** Shared layout for the live /faqs page and the dashboard preview. */
export default function FaqsView({ groups, faqSchema = false, extra = null }: { groups: (FaqGroup & { href?: string })[]; faqSchema?: boolean; extra?: object | null }) {
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
          {groups.some((g) => g.href) && (
            <nav aria-label="Jump to a service" className="flex flex-wrap justify-center gap-2 mb-12">
              {groups.filter((g) => g.href).map((g) => <a key={g.title} href={`#${g.href!.split("/").pop()}`} className="px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-brand hover:text-brand-text transition-colors">{g.title}</a>)}
            </nav>
          )}
          <div className="md:columns-2 md:gap-12 [column-fill:balance]">
            {groups.map((g, i) => (
              <Reveal key={g.title} delay={(i % 2) * 80} className="break-inside-avoid mb-10">
                <h2 id={g.href ? g.href.split("/").pop() : undefined} className="text-xl sm:text-2xl font-bold text-brand-text mb-5 scroll-mt-24">{g.title}</h2>
                <FaqList faqs={g.faqs} defaultOpen={i === 0 ? 0 : null} />
                {g.href && <p className="mt-3 text-sm"><Link href={g.href} className="font-semibold text-brand-text hover:underline">Read the full {g.title} page →</Link></p>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}
