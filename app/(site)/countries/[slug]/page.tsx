import type { Metadata } from "next";
import CountryView from "../../_views/CountryView";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCountries()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const country = await getCountry((await params).slug);
  if (!country) return {};
  return buildMetadata({ title: country.headline, description: country.intro || country.summary, path: `/countries/${country.slug}`, seo: country.seo, image: country.image });
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const country = await getCountry(slug);
  if (!country) notFound();
  return <CountryView country={country} />;
}
