import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "../../components/Breadcrumb";
import Carousel from "../../components/Carousel";
import ContentSections from "../../components/ContentSections";
import CountryCard from "../../components/CountryCard";
import CTABanner from "../../components/CTABanner";
import Reveal from "../../components/Reveal";
import { getCountries, getCountry, getServices } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCountries()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const country = await getCountry((await params).slug);
  if (!country) return {};
  return { title: country.headline, description: country.intro };
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const [country, allCountries, allServices] = await Promise.all([getCountry(slug), getCountries(), getServices()]);
  if (!country) notFound();

  const others = allCountries.filter((c) => c.slug !== country.slug);
  const popular = others.filter((c) => c.featured).concat(others.filter((c) => !c.featured)).slice(0, 3);
  const related = country.serviceSlugs
    ? allServices.filter((s) => country.serviceSlugs!.includes(s.slug))
    : allServices.slice(0, 6);

  return (
    <>
      <Breadcrumb items={[{ label: "Country List", href: "/countries" }, { label: country.name }]} />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Main column */}
          <article className="lg:col-span-2 min-w-0">
            {/* Banner */}
            <div className={`relative h-48 sm:h-64 rounded-lg overflow-hidden bg-gradient-to-br ${country.gradient} flex items-center justify-center text-center text-gray-900 mb-8 animate-fadeIn`}>
              {country.image && <Image src={country.image} alt="" fill priority sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />}
              <div className="relative px-4">
                <div className="text-6xl sm:text-7xl mb-2 drop-shadow-lg" aria-hidden="true">{country.flag}</div>
                <p className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wide">{country.name}</p>
                <p className="text-sm sm:text-base text-gray-700 mt-1">{country.tagline}</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 animate-fadeIn">{country.headline}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">{country.intro}</p>

            <Reveal>
              <ul className="space-y-2 mb-10">
                {country.facts.map((f) => (
                  <li key={f.label} className="flex items-start text-gray-700">
                    <span className="text-[#ff5722] mr-2" aria-hidden="true">•</span>
                    <span><strong className="text-gray-900">{f.label}:</strong> {f.value}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {country.sections.map((s, i) => (
              <Reveal key={i}>
                <ContentSections sections={[s]} />
              </Reveal>
            ))}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-10">
            <Reveal variant="right">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Related Services:</h2>
              <ul>
                {related.map((s) => (
                  <li key={s.slug} className="border-b border-dotted border-gray-300">
                    <Link href={`/services/${s.slug}`} className="group flex items-center py-3 text-gray-700 hover:text-[#ff5722] transition-colors">
                      <span className="text-[#ff5722] mr-2 font-bold group-hover:translate-x-1 transition-transform" aria-hidden="true">»</span>
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="right" delay={100}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Countries:</h2>
              <div className="space-y-5">
                {popular.map((c) => (
                  <Link key={c.slug} href={`/countries/${c.slug}`} className="group block">
                    <div className={`relative h-28 rounded-lg overflow-hidden bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                      {c.image && <Image src={c.image} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />}
                      <span className="relative text-5xl group-hover:scale-110 transition-transform duration-500" aria-hidden="true">{c.flag}</span>
                    </div>
                    <p className="mt-2 font-semibold text-gray-900 group-hover:text-[#ff5722] transition-colors">{c.name}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* Opportunities carousel */}
      {others.length > 0 && (
        <section className="py-14 md:py-20 border-t border-dashed border-gray-200 bg-gray-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Immigration Opportunities</h2>
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
