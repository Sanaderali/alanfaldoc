import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";
import CTABanner from "../components/CTABanner";
import Reveal from "../components/Reveal";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Company formation, PRO services, visa processing, document clearing and more in Dubai & UAE.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <Breadcrumb items={[{ label: "Service Categories" }]} />
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to set up, run and grow your business in the UAE.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 80}>
                <Link href={`/services/${s.slug}`} className="group block h-full bg-white border border-gray-200 rounded-lg p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500">
                  <div className="text-4xl mb-4" aria-hidden="true">{s.icon}</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#ff5722] transition-colors">{s.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{s.summary}</p>
                  <span className="text-xs font-semibold uppercase text-gray-400 group-hover:text-[#ff5722] transition-colors">
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
