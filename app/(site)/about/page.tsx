import type { Metadata } from "next";
import Link from "@/app/components/SiteLink";
import Breadcrumb from "@/app/components/Breadcrumb";
import CTABanner from "@/app/components/CTABanner";
import Icon from "@/app/components/Icon";
import CtaBlock from "@/app/components/CtaBlock";
import Reveal from "@/app/components/Reveal";
import { site, stats } from "@/data/site";
import { getServices, getPageSeo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("about");
  return buildMetadata({ title: "About Us", description: `Learn about ${site.name}: a Dubai team for company formation, licence renewals, government approvals, attestation and visa application support.`, path: "/about", seo });
}

const values = [
  { icon: "bullseye", title: "Accuracy", text: "Every document is checked before submission so applications are right the first time." },
  { icon: "bolt", title: "Speed", text: "We know each authority's forms, portals and order of steps, so files are prepared and submitted correctly the first time." },
  { icon: "handshake", title: "Transparency", text: "Government fees are shown separately from our fee, and you get a clear status at every step." },
  { icon: "lock", title: "Confidentiality", text: "Your personal and business documents are handled with strict care." },
];

const steps = [
  { n: "01", title: "Consultation", text: "Tell us your goal and we recommend the best route." },
  { n: "02", title: "Documents", text: "We prepare, check and attest everything required." },
  { n: "03", title: "Submission", text: "We submit and follow up with the relevant authorities." },
  { n: "04", title: "Approval", text: "The authority issues its decision and we hand over your licence, permit or cleared documents." },
];

export default async function AboutPage() {
  const services = await getServices();
  return (
    <>
      <Breadcrumb items={[{ label: "About Us" }]} />

      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="animate-fadeIn">
            <p className="text-sm font-semibold tracking-widest text-accent uppercase mb-3">About {site.name}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink mb-6 leading-tight">Dubai Paperwork, Handled End to End</h1>
            <p className="text-gray-600 leading-relaxed mb-4">
              {site.name} (Al Anfal Documents Clearing Services LLC) helps business owners, investors and expatriates with company formation, licence renewals, government approvals, notary and attestation, Ejari, insurance, Emirates ID and residence file support in Dubai.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              We prepare each file, submit it in the right order and follow it until the authority has decided. Our visa services are document preparation, processing and application support: the UAE authorities make every decision.
            </p>
            <CtaBlock variant="inline" className="!mt-0 !mb-0" />
          </div>
          <Reveal variant="right">
            <div className="rounded-lg bg-gradient-to-br from-brand-50 to-canvas border border-gray-200 text-ink p-8 sm:p-10 grid grid-cols-2 gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl sm:text-4xl font-bold text-brand-text">{s.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">Why Clients Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The principles behind every file we handle.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="h-full bg-white border border-gray-200/80 rounded-2xl shadow-[0_2px_14px_rgba(15,23,42,.05)] p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500">
                  <div className="w-14 h-14 mb-4 rounded-full bg-brand-50 text-brand-text flex items-center justify-center text-2xl"><Icon name={v.icon} /></div>
                  <h3 className="text-lg font-bold text-ink mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">How It Works</h2>
          </Reveal>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 80} className="relative pl-0">
                <div className="text-5xl font-extrabold text-gray-200 mb-2">{s.n}</div>
                <h3 className="text-lg font-bold text-ink mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><CtaBlock title="Not sure where to start?" text="Tell us your goal and our advisors will recommend the route, the documents and the cost." /></div>

      <section className="py-14 md:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-3">What We Do</h2>
          </Reveal>
          <Reveal className="flex flex-wrap justify-center gap-3">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-text transition-colors">
                <Icon name={s.icon} className="text-brand-text mr-2" />{s.title}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
