import Link from "@/app/components/SiteLink";
import Breadcrumb from "@/app/components/Breadcrumb";
import CtaBlock from "@/app/components/CtaBlock";
import FaqList from "@/app/components/FaqList";
import Flag from "@/app/components/Flag";
import JsonLd from "@/app/components/JsonLd";
import Reveal from "@/app/components/Reveal";
import RichContent from "@/app/components/RichContent";
import { Byline, GeoBlock, Sources } from "@/app/components/GeoBlock";
import { breadcrumbLd, faqLd, landingLd } from "@/lib/seo";
import { getCountries, getLandings, getPosts, getServices, landingHref } from "@/lib/content";
import type { Country, Landing, Service } from "@/types/content";

/** One service page written for one country. Internal links: the service, the country guide, the same service for other countries, other services for this country. */
export default async function LandingView({ landing, service, country }: { landing: Landing; service: Service; country: Country }) {
  const [landings, countries, services, posts] = await Promise.all([getLandings(), getCountries(), getServices(), getPosts()]);
  const sameCountry = landings.filter((l) => l.country === country.slug && l.service !== service.slug);
  const sameService = landings.filter((l) => l.service === service.slug && l.country !== country.slug);
  const trail = [{ label: "Services", href: "/services" }, { label: service.title, href: `/services/${service.slug}` }, { label: country.name }];
  const svcTitle = (slug: string) => services.find((s) => s.slug === slug)?.title ?? slug;
  const cty = (slug: string) => countries.find((c) => c.slug === slug);

  return (
    <>
      <Breadcrumb items={trail} />
      <JsonLd data={[...landingLd(landing, service, country), breadcrumbLd(trail.map((t) => (t.href ? t : { label: t.label }))), ...(landing.faqs?.length ? [faqLd(landing.faqs)] : [])]} />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <article className="lg:col-span-2 min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-text mb-2"><Flag country={country} size={22} />
              <Link href={`/countries/${country.slug}`} className="hover:underline">{country.name}</Link><span className="text-gray-400" aria-hidden="true">›</span>
              <Link href={`/services/${service.slug}`} className="hover:underline">{service.title}</Link></p>
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3">{landing.headline}</h1>
            <Byline author={landing.author} updated={landing.updatedAt} published={landing.createdAt} className="mb-6" />
            <GeoBlock item={landing} tableTitle={`${service.title} for ${country.name} at a glance`} />
            <CtaBlock variant="inline" topic={`${service.title} from ${country.name}`} />
            {landing.contentHtml && <Reveal><RichContent html={landing.contentHtml} /></Reveal>}
            <CtaBlock topic={`${service.title} from ${country.name}`} title={`Start ${service.title.toLowerCase()} from ${country.name}`} text="Tell us your activity, where you are based and what you need. We confirm the steps, documents and fees in writing before any work starts." />
            {landing.faqs && landing.faqs.length > 0 && (
              <section className="mt-10"><h2 className="text-2xl font-bold text-ink mb-4">{service.title} for {country.name}: frequently asked questions</h2><FaqList faqs={landing.faqs} /></section>
            )}
            <Sources sources={landing.sources} />
          </article>

          <aside className="lg:col-span-1 space-y-10">
            <Reveal variant="right">
              <h2 className="text-xl font-bold text-ink mb-4">The full service</h2>
              <Link href={`/services/${service.slug}`} className="group flex items-center py-3 text-gray-700 hover:text-brand-text border-b border-dotted border-gray-300"><span className="text-accent mr-2 font-bold group-hover:translate-x-1 transition-transform" aria-hidden="true">»</span>{service.title}</Link>
              <Link href={`/countries/${country.slug}`} className="group flex items-center py-3 text-gray-700 hover:text-brand-text border-b border-dotted border-gray-300"><span className="text-accent mr-2 font-bold group-hover:translate-x-1 transition-transform" aria-hidden="true">»</span>Setting up in Dubai from {country.name}</Link>
            </Reveal>
            {sameCountry.length > 0 && (
              <Reveal variant="right" delay={80}>
                <h2 className="text-xl font-bold text-ink mb-4">Other services for {country.name}</h2>
                <ul>{sameCountry.map((l) => <li key={l.id ?? l.slug} className="border-b border-dotted border-gray-300"><Link href={landingHref(l)} className="group flex items-center py-3 text-gray-700 hover:text-brand-text"><span className="text-accent mr-2 font-bold group-hover:translate-x-1 transition-transform" aria-hidden="true">»</span>{svcTitle(l.service)}</Link></li>)}</ul>
              </Reveal>
            )}
            {sameService.length > 0 && (
              <Reveal variant="right" delay={120}>
                <h2 className="text-xl font-bold text-ink mb-4">{service.title} for other countries</h2>
                <ul className="flex flex-wrap gap-2">{sameService.map((l) => { const c = cty(l.country); return c ? <li key={l.id ?? l.slug}><Link href={landingHref(l)} className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-50 px-3 py-1 text-sm text-brand-text hover:bg-brand hover:text-white transition-colors"><Flag country={c} size={16} />{c.name}</Link></li> : null; })}</ul>
              </Reveal>
            )}
            {posts.length > 0 && (
              <Reveal variant="right" delay={160}>
                <h2 className="text-xl font-bold text-ink mb-4">Related guides</h2>
                <ul className="space-y-3">{posts.slice(0, 3).map((p) => <li key={p.slug}><Link href={`/blog/${p.slug}`} className="text-gray-700 hover:text-brand-text font-medium">{p.title}</Link></li>)}</ul>
              </Reveal>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
