import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegionView from "../../../_views/RegionView";
import { buildMetadata } from "@/lib/seo";
import { getCountries, getRegion, regionHasPage, regionHref, regionSlug } from "@/lib/content";

type Props = { params: Promise<{ slug: string; state: string }> };

export async function generateStaticParams() {
  return (await getCountries()).flatMap((c) => (c.regions ?? []).filter(regionHasPage).map((r) => ({ slug: c.slug, state: regionSlug(r) })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, state } = await params;
  const hit = await getRegion(slug, state);
  if (!hit) return {};
  const { country, region } = hit;
  return buildMetadata({ title: region.seo?.title || region.headline || `${region.name}, ${country.name}`, description: region.seo?.description || region.answer || region.summary, path: regionHref(country.slug, region), seo: region.seo, image: country.image, modifiedTime: region.updatedAt });
}

export default async function StatePage({ params }: Props) {
  const { slug, state } = await params;
  const hit = await getRegion(slug, state);
  if (!hit) notFound();
  return <RegionView country={hit.country} region={hit.region} />;
}
