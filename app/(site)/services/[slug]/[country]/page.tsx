import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingView from "../../../_views/LandingView";
import { buildMetadata } from "@/lib/seo";
import { getCountry, getLanding, getLandings, getService } from "@/lib/content";

type Props = { params: Promise<{ slug: string; country: string }> };

export async function generateStaticParams() {
  return (await getLandings()).map((l) => ({ slug: l.service, country: l.country }));
}

async function load({ params }: Props) {
  const { slug, country } = await params;
  const [landing, service, c] = await Promise.all([getLanding(slug, country), getService(slug), getCountry(country)]);
  return landing && service && c ? { landing, service, country: c } : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const hit = await load(props);
  if (!hit) return {};
  const { landing } = hit;
  return buildMetadata({ title: landing.seo?.title || landing.headline, description: landing.seo?.description || landing.summary, path: `/services/${landing.service}/${landing.country}`, seo: landing.seo, modifiedTime: landing.updatedAt });
}

export default async function LandingPage(props: Props) {
  const hit = await load(props);
  if (!hit) notFound();
  return <LandingView {...hit} />;
}
