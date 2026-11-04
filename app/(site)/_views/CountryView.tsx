import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import Carousel from "@/app/components/Carousel";
import Flag from "@/app/components/Flag";
import ContentSections from "@/app/components/ContentSections";
import CountryCard from "@/app/components/CountryCard";
import CTABanner from "@/app/components/CTABanner";
import FaqList from "@/app/components/FaqList";
import JsonLd from "@/app/components/JsonLd";
import Reveal from "@/app/components/Reveal";
import RichContent from "@/app/components/RichContent";
import { buildMetadata, countryPageLd, customLd, faqLd } from "@/lib/seo";
import { getCountries, getCountry, getServices } from "@/lib/content";
import type { Country } from "@/types/content";

/** Shared layout for the live page and the dashboard preview. */
export default async function CountryView({ country }: { country: Country }) {
  const [allCountries, allServices] = await Promise.all([getCountries(), getServices()]);

  const others = allCountries.filter((c) => c.slug !== country.slug);
  const popular = others.filter((c) => c.featured).concat(others.filter((c) => !c.featured)).slice(0, 3);
  const related = country.serviceSlugs
    ? allServices.filter((s) => country.serviceSlugs!.includes(s.slug))
    : allServices.slice(0, 6);

  const sideLinks = country.categories ?? related.map((s) => ({ title: s.title, href: `/services/${s.slug}` }));

  return (
    <>
      <Breadcrumb items={[{ label: "Country List", href: "/countries" }, { label: country.name }]} />
      <JsonLd data={[countryPageLd(country), ...(country.faqs?.length && country.faqSchema !== false ? [faqLd(country.faqs)] : []), ...(customLd(country.schemaCustom) ? [customLd(country.schemaCustom)!] : [])]} />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Main column */}
          <article className="lg:col-span-2 min-w-0">
            {/* Banner */}
            <div className={`relative h-48 sm:h-64 rounded-lg overflow-hidden bg-gradient-to-br ${country.gradient} flex items-center justify-center text-center text-ink mb-8 animate-fadeIn`}>
              {country.image && <Image src={country.image} alt={country.imageAlt ?? country.name} fill priority sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />}
              <div className="relative px-4">
                <div className="mb-3"><Flag country={country} size={96} className="drop-shadow-lg" /></div>
                <p className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wide">{country.name}</p>
                <p className="text-sm sm:text-base text-gray-700 mt-1">{country.tagline}</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-5 animate-fadeIn">{country.headline}</h1>
            {country.intro && <p className="text-gray-600 leading-relaxed mb-6">{country.intro}</p>}

            <Reveal>
              <ul className="space-y-2 mb-10">
                {country.facts.map((f) => (
                  <li key={f.label} className="flex items-start text-gray-700">
                    <span className="text-brand-text mr-2" aria-hidden="true">•</span>
                    <span><strong className="text-ink">{f.label}:</strong> {f.value}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {country.contentHtml ? (
              <Reveal><RichContent html={country.contentHtml} /></Reveal>
            ) : (
              country.sections.map((s, i) => (
                <Reveal key={i}>
                  <ContentSections sections={[s]} />
                </Reveal>
              ))
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-10">
            <Reveal variant="right">
              <h2 className="text-xl font-bold text-ink mb-4">{country.categories ? "Visa Categories:" : "Related Services:"}</h2>
              <ul>
                {sideLinks.map((l) => (
                  <li key={l.title} className="border-b border-dotted border-gray-300">
                    <Link href={l.href} className="group flex items-center py-3 text-gray-700 hover:text-brand-text transition-colors">
                      <span className="text-accent mr-2 font-bold group-hover:translate-x-1 transition-transform" aria-hidden="true">»</span>
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="right" delay={100}>
              <h2 className="text-xl font-bold text-ink mb-4">Popular Countries:</h2>
              <div className="space-y-5">
                {popular.map((c) => (
                  <Link key={c.slug} href={`/countries/${c.slug}`} className="group block">
                    <div className={`relative h-28 rounded-lg overflow-hidden bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                      {c.image && <Image src={c.image} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />}
                      <Flag country={c} size={72} className="relative group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <p className="mt-2 font-semibold text-ink group-hover:text-brand-text transition-colors">{c.name}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {country.faqs && country.faqs.length > 0 && (
        <section className="py-14 md:py-16 border-t border-dashed border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-8"><h2 className="text-3xl font-bold text-ink">{country.name}: Frequently Asked Questions</h2></Reveal>
            <Reveal><FaqList faqs={country.faqs} /></Reveal>
          </div>
        </section>
      )}

      {/* Opportunities carousel */}
      {others.length > 0 && (
        <section className="py-14 md:py-20 border-t border-dashed border-gray-200 bg-gray-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">Immigration Opportunities</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Explore other destinations we support with documentation and visa services.</p>
            </Reveal>
            <Reveal>
              <Carousel>
                {others.map((c) => (
                  <div key={c.slug} className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[23.5%]">
                    <CountryCard country={c} />
                  </div>
                ))}
              </Carousel>
            </Reveal>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
