import type { Metadata } from "next";
import Breadcrumb from "@/app/components/Breadcrumb";
import CountryCard from "@/app/components/CountryCard";
import CTABanner from "@/app/components/CTABanner";
import Reveal from "@/app/components/Reveal";
import { getCountries, getPageSeo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";


/** Rendered once, served from the cache and refreshed every minute (and at once when you save in the dashboard), so every visit is fast. */
export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("countries");
  return buildMetadata({ title: "Setting Up in Dubai: Guides by Country", description: "Explore the countries we support with company setup, visas and document services.", path: "/countries", seo });
}

export default async function CountriesPage() {
  const countries = await getCountries();
  return (
    <>
      <Breadcrumb items={[{ label: "Country List" }]} />
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink mb-4">Setting Up in Dubai: Guides by Country</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose your country to see how company setup, document attestation and residence support work for investors coming to Dubai: documents, currency, tax points and the services you are likely to need.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 80}>
                <CountryCard country={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}
