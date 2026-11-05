import Link from "@/app/components/SiteLink";
import Breadcrumb from "@/app/components/Breadcrumb";
import CtaBlock from "@/app/components/CtaBlock";
import FaqList from "@/app/components/FaqList";
import Flag from "@/app/components/Flag";
import JsonLd from "@/app/components/JsonLd";
import Reveal from "@/app/components/Reveal";
import RichContent from "@/app/components/RichContent";
import { Byline, GeoBlock, Sources } from "@/app/components/GeoBlock";
import { faqLd, regionPageLd, breadcrumbLd } from "@/lib/seo";
import { getPosts, getServices, regionHasPage, regionHref, regionSlug } from "@/lib/content";
import type { Country, Region } from "@/types/content";

/** One state / province page. Internal links: back to the country, sibling states, related services and latest articles. */
export default async function RegionView({ country, region }: { country: Country; region: Region }) {
  const [services, posts] = await Promise.all([getServices(), getPosts()]);
  const path = regionHref(country.slug, region);
  const siblings = (country.regions ?? []).filter((r) => regionSlug(r) !== regionSlug(region));
  const related = (country.serviceSlugs ? services.filter((s) => country.serviceSlugs!.includes(s.slug)) : services).slice(0, 6);
  const latest = posts.slice(0, 3);
  const trail = [{ label: "Country List", href: "/countries" }, { label: country.name, href: `/countries/${country.slug}` }, { label: region.name }];

  return (
    <>
      <Breadcrumb items={trail} />
      <JsonLd data={[regionPageLd(country, region, path), breadcrumbLd(trail.map((t) => (t.href ? t : { label: t.label }))), ...(region.faqs?.length ? [faqLd(region.faqs)] : [])]} />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <article className="lg:col-span-2 min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-text mb-2"><Flag country={country} size={22} />
              <Link href={`/countries/${country.slug}`} className="hover:underline">{country.name}</Link><span className="text-gray-400" aria-hidden="true">›</span><span>{region.name}</span></p>
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3">{region.headline || region.name}</h1>
            <Byline author={country.author} updated={region.updatedAt} className="mb-6" />
            <GeoBlock item={{ answer: region.answer, summaryTable: region.facts }} tableTitle={`${region.name} at a glance`} />
            <CtaBlock variant="inline" topic={region.name} />

            {region.contentHtml ? <Reveal><RichContent html={region.contentHtml} /></Reveal> : region.summary ? <p className="text-gray-600 leading-relaxed">{region.summary}</p> : null}

            <CtaBlock topic={region.name} title={`Planning something with ${region.name} in mind?`} text="Tell us what you need: visas, attestation, company set-up or documents. We will tell you the next steps." />

            {region.faqs && region.faqs.length > 0 && (
              <section className="mt-10"><h2 className="text-2xl font-bold text-ink mb-4">{region.name}: Frequently asked questions</h2><FaqList faqs={region.faqs} /></section>
            )}
            <Sources sources={region.sources} />
          </article>

          <aside className="lg:col-span-1 space-y-10">
            <Reveal variant="right">
              <h2 className="text-xl font-bold text-ink mb-4">Our related services</h2>
              <ul>{related.map((s) => (
                <li key={s.slug} className="border-b border-dotted border-gray-300"><Link href={`/services/${s.slug}`} className="group flex items-center py-3 text-gray-700 hover:text-brand-text transition-colors"><span className="text-accent mr-2 font-bold group-hover:translate-x-1 transition-transform" aria-hidden="true">»</span>{s.title}</Link></li>
              ))}</ul>
            </Reveal>
            {siblings.length > 0 && (
              <Reveal variant="right" delay={100}>
                <h2 className="text-xl font-bold text-ink mb-4">More in {country.name}</h2>
                <ul className="flex flex-wrap gap-2">{siblings.slice(0, 18).map((r) => (
                  <li key={r.name}>{regionHasPage(r) ? <Link href={regionHref(country.slug, r)} className="inline-block rounded-full border border-brand/30 bg-brand-50 px-3 py-1 text-sm text-brand-text hover:bg-brand hover:text-white transition-colors">{r.name}</Link> : <span className="inline-block rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500">{r.name}</span>}</li>
                ))}</ul>
                <Link href={`/countries/${country.slug}`} className="mt-3 inline-block text-sm text-brand-text hover:underline">All of {country.name} ›</Link>
              </Reveal>
            )}
            {latest.length > 0 && (
              <Reveal variant="right" delay={150}>
                <h2 className="text-xl font-bold text-ink mb-4">Latest articles</h2>
                <ul className="space-y-3">{latest.map((p) => <li key={p.slug}><Link href={`/blog/${p.slug}`} className="text-gray-700 hover:text-brand-text font-medium">{p.title}</Link></li>)}</ul>
              </Reveal>
            )}
          </aside>
        </div>
      </section>
      <CtaBlock variant="banner" topic={region.name} />
    </>
  );
}
