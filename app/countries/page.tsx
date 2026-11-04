import type { Metadata } from "next";
import Breadcrumb from "../components/Breadcrumb";
import CountryCard from "../components/CountryCard";
import CTABanner from "../components/CTABanner";
import Reveal from "../components/Reveal";
import { getCountries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Countries We Cover",
  description: "Explore the countries we support with company setup, visas and document services.",
};

export default async function CountriesPage() {
  const countries = await getCountries();
  return (
    <>
      <Breadcrumb items={[{ label: "Country List" }]} />
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Countries We Cover</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose a destination to see requirements, key facts and how we can help.</p>
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
