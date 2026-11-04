import type { Metadata } from "next";
import ServiceView from "../../_views/ServiceView";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb";
import ContentSections from "@/app/components/ContentSections";
import CTABanner from "@/app/components/CTABanner";
import FaqList from "@/app/components/FaqList";
import Icon from "@/app/components/Icon";
import Flag from "@/app/components/Flag";
import JsonLd from "@/app/components/JsonLd";
import Reveal from "@/app/components/Reveal";
import RichContent from "@/app/components/RichContent";
import Image from "next/image";
import { buildMetadata, customLd, faqLd, serviceLd } from "@/lib/seo";
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
  const service = await getService(slug);
  if (!service) notFound();
  return <ServiceView service={service} />;
}
