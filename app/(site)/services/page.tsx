import type { Metadata } from "next";
import Link from "@/app/components/SiteLink";
import Breadcrumb from "@/app/components/Breadcrumb";
import CTABanner from "@/app/components/CTABanner";
import Icon from "@/app/components/Icon";
import Reveal from "@/app/components/Reveal";
import { getServices, getPageSeo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("services");
  return buildMetadata({ title: "Our Services", description: "Company formation, PRO services, visa processing, document clearing and more in Dubai & UAE.", path: "/services", seo });
}

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <Breadcrumb items={[{ label: "Service Categories" }]} />
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink mb-4">Our Services</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to set up, run and grow your business in the UAE.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 80}>
                <Link href={`/services/${s.slug}`} className="group block h-full bg-white border border-gray-200/80 rounded-2xl shadow-[0_2px_14px_rgba(15,23,42,.05)] p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500">
                  <div className="w-14 h-14 mb-4 rounded-full bg-brand-50 text-brand-text flex items-center justify-center text-2xl group-hover:bg-brand group-hover:text-white transition-colors duration-300"><Icon name={s.icon} /></div>
                  <h2 className="text-xl font-bold text-ink mb-3 group-hover:text-brand-text transition-colors">{s.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{s.summary}</p>
                  <span className="text-xs font-semibold uppercase text-gray-400 group-hover:text-brand-text transition-colors">
                    Read more <span className="inline-block group-hover:translate-x-1 transition-transform">›</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}
