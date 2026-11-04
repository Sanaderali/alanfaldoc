import Link from "next/link";
import Image from "next/image";
import type { Country } from "@/types/content";

export default function CountryCard({ country }: { country: Country }) {
  return (
    <Link
      href={`/countries/${country.slug}`}
      className="group block h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500"
    >
      <div className={`relative h-36 sm:h-40 bg-gradient-to-br ${country.gradient} overflow-hidden`}>
        {country.image && (
          <Image src={country.image} alt={country.imageAlt ?? country.name} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
        )}
        <span className="absolute right-3 bottom-3 text-4xl drop-shadow-lg" aria-hidden="true">{country.flag}</span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-text transition-colors">{country.name}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{country.summary}</p>
        <span className="text-xs font-semibold uppercase text-gray-400 group-hover:text-brand-text transition-colors">
          Read more <span className="inline-block group-hover:translate-x-1 transition-transform">›</span>
        </span>
      </div>
    </Link>
  );
}
