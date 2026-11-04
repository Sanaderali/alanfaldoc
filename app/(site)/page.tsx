import type { Metadata } from "next";
import HomeClient from "@/app/components/HomeClient";
import JsonLd from "@/app/components/JsonLd";
import { site } from "@/data/site";
import { getPageSeo } from "@/lib/content";
import { buildMetadata, customLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("home");
  return {
    ...buildMetadata({ title: site.name, description: site.description, path: "/", seo }),
    title: { absolute: seo?.title ?? `${site.name} - ${site.tagline}` },
  };
}

export default async function Home() {
  const { schemaCustom } = await getPageSeo("home");
  const extra = customLd(schemaCustom);
  return (
    <>
      {extra && <JsonLd data={extra} />}
      <HomeClient />
    </>
  );
}
