import Link from "@/app/components/SiteLink";
import Breadcrumb from "@/app/components/Breadcrumb";
import ContentSections from "@/app/components/ContentSections";
import CTABanner from "@/app/components/CTABanner";
import FaqList from "@/app/components/FaqList";
import Icon from "@/app/components/Icon";
import Flag from "@/app/components/Flag";
import JsonLd from "@/app/components/JsonLd";
import Reveal from "@/app/components/Reveal";
import RichContent from "@/app/components/RichContent";
import { Byline, GeoBlock, Sources } from "@/app/components/GeoBlock";
import Image from "next/image";
import { buildMetadata, customLd, faqLd, serviceLd, servicePageLd } from "@/lib/seo";
import { formatDate, getCountries, getPosts, getService, getServices } from "@/lib/content";
import type { Service } from "@/types/content";

/** Shared layout for the live page and the dashboard preview. */
export default async function ServiceView({ service }: { service: Service }) {
  const [services, countries, posts] = await Promise.all([getServices(), getCountries(), getPosts()]);

  const related = (service.relatedSlugs ?? []).map((r) => services.find((s) => s.slug === r)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <>
      <Breadcrumb items={[{ label: "Services", href: "/services" }, { label: service.title }]} />
      <JsonLd data={[serviceLd(service), servicePageLd(service), ...(service.faqs.length && service.faqSchema !== false ? [faqLd(service.faqs)] : []), ...(customLd(service.schemaCustom) ? [customLd(service.schemaCustom)!] : [])]} />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <article className="lg:col-span-2 min-w-0">
            {service.image && (
              <div className="relative w-full h-48 sm:h-72 rounded-lg overflow-hidden mb-6 bg-gray-100 animate-fadeIn">
                <Image src={service.image} alt={service.imageAlt ?? service.title} fill priority sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="w-16 h-16 mb-4 rounded-full bg-brand-50 text-brand-text flex items-center justify-center text-3xl animate-fadeIn"><Icon name={service.icon} /></div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3 animate-fadeIn">{service.title}</h1>
            <Byline author={service.author} updated={service.updatedAt} published={service.createdAt} className="mb-6" />
            <GeoBlock item={service} />
            {service.contentHtml ? (
              <Reveal><RichContent html={service.contentHtml} /></Reveal>
            ) : (
              <>
            <p className="text-gray-600 leading-relaxed mb-6">{service.intro}</p>
            <Reveal>
              <ul className="space-y-3 mb-10">
                {service.highlights.map((h) => (
                  <li key={h} className="flex items-start text-gray-700">
                    <span className="text-brand-text mr-2" aria-hidden="true">•</span>{h}
                  </li>
                ))}
              </ul>
            </Reveal>
            {service.sections.map((s, i) => (
              <Reveal key={i}><ContentSections sections={[s]} /></Reveal>
            ))}
              </>
            )}
            <Sources sources={service.sources} />
          </article>

          <aside className="space-y-8">
            <Reveal variant="right" className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-ink mb-4">Service Categories:</h2>
              <ul>
                {services.map((s) => (
                  <li key={s.slug} className="border-b border-dotted border-gray-300 last:border-0">
                    <Link href={`/services/${s.slug}`} className={`group flex items-center py-2.5 text-sm transition-colors hover:text-brand-text ${s.slug === service.slug ? "text-brand-text font-semibold" : "text-gray-700"}`}>
                      <span className="text-accent mr-2 group-hover:translate-x-1 transition-transform" aria-hidden="true">»</span>{s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="right" delay={80} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-ink mb-4">Popular Countries:</h2>
              <ul className="space-y-3">
                {countries.slice(0, 4).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/countries/${c.slug}`} className="flex items-center gap-3 text-gray-700 hover:text-brand-text transition-colors">
                      <Flag country={c} size={32} />{c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="right" delay={160} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-ink mb-4">Latest Posts</h2>
              <ul className="space-y-5">
                {posts.slice(0, 3).map((p) => (
                  <li key={p.slug}>
                    <p className="text-xs text-gray-500 mb-1">{formatDate(p.date)} · {p.category}</p>
                    <Link href={`/blog/${p.slug}`} className="font-bold text-ink hover:text-brand-text transition-colors">{p.title}</Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-14 bg-canvas">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10"><h2 className="text-3xl font-bold text-ink">Related Services</h2></Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((s, i) => (
                <Reveal key={s.slug} delay={i * 80}>
                  <Link href={`/services/${s.slug}`} className="group block h-full bg-white border border-gray-200/80 rounded-2xl shadow-[0_2px_14px_rgba(15,23,42,.05)] p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500">
                    <h3 className="text-lg font-bold text-ink mb-2 group-hover:text-brand-text transition-colors">{s.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{s.summary}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {service.faqs.length > 0 && (
        <section className="py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-8"><h2 className="text-3xl font-bold text-ink">Frequently asked questions about {service.title}</h2></Reveal>
            <Reveal><FaqList faqs={service.faqs} /></Reveal>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
