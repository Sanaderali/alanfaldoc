import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "../../components/Breadcrumb";
import ContentSections from "../../components/ContentSections";
import CTABanner from "../../components/CTABanner";
import FaqList from "../../components/FaqList";
import JsonLd from "../../components/JsonLd";
import Reveal from "../../components/Reveal";
import { buildMetadata, faqLd, serviceLd } from "@/lib/seo";
import { formatDate, getCountries, getPosts, getService, getServices } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getService((await params).slug);
  return s ? buildMetadata({ title: s.title, description: s.summary, path: `/services/${s.slug}`, seo: s.seo, image: s.image }) : {};
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, services, countries, posts] = await Promise.all([getService(slug), getServices(), getCountries(), getPosts()]);
  if (!service) notFound();

  const related = (service.relatedSlugs ?? []).map((r) => services.find((s) => s.slug === r)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <>
      <Breadcrumb items={[{ label: "Services", href: "/services" }, { label: service.title }]} />
      <JsonLd data={[serviceLd(service), ...(service.faqs.length ? [faqLd(service.faqs)] : [])]} />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <article className="lg:col-span-2 min-w-0">
            <div className="text-5xl mb-4 animate-fadeIn" aria-hidden="true">{service.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 animate-fadeIn">{service.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">{service.intro}</p>
            <Reveal>
              <ul className="space-y-3 mb-10">
                {service.highlights.map((h) => (
                  <li key={h} className="flex items-start text-gray-700">
                    <span className="text-[#ff5722] mr-2" aria-hidden="true">•</span>{h}
                  </li>
                ))}
              </ul>
            </Reveal>
            {service.sections.map((s, i) => (
              <Reveal key={i}><ContentSections sections={[s]} /></Reveal>
            ))}
          </article>

          <aside className="space-y-8">
            <Reveal variant="right" className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Categories:</h2>
              <ul>
                {services.map((s) => (
                  <li key={s.slug} className="border-b border-dotted border-gray-300 last:border-0">
                    <Link href={`/services/${s.slug}`} className={`group flex items-center py-2.5 text-sm transition-colors hover:text-[#ff5722] ${s.slug === service.slug ? "text-[#ff5722] font-semibold" : "text-gray-700"}`}>
                      <span className="text-[#ff5722] mr-2 group-hover:translate-x-1 transition-transform" aria-hidden="true">»</span>{s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="right" delay={80} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Countries:</h2>
              <ul className="space-y-3">
                {countries.slice(0, 4).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/countries/${c.slug}`} className="flex items-center gap-3 text-gray-700 hover:text-[#ff5722] transition-colors">
                      <span className="text-2xl" aria-hidden="true">{c.flag}</span>{c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="right" delay={160} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Posts</h2>
              <ul className="space-y-5">
                {posts.slice(0, 3).map((p) => (
                  <li key={p.slug}>
                    <p className="text-xs text-gray-500 mb-1">{formatDate(p.date)} · {p.category}</p>
                    <Link href={`/blog/${p.slug}`} className="font-bold text-gray-900 hover:text-[#ff5722] transition-colors">{p.title}</Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10"><h2 className="text-3xl font-bold text-gray-900">Related Services</h2></Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((s, i) => (
                <Reveal key={s.slug} delay={i * 80}>
                  <Link href={`/services/${s.slug}`} className="group block h-full bg-white border border-gray-200 rounded-lg p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#ff5722] transition-colors">{s.title}</h3>
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
            <Reveal className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900">Have Questions? Look Here</h2></Reveal>
            <Reveal><FaqList faqs={service.faqs} /></Reveal>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
