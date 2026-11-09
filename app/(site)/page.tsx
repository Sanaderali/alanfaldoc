import type { Metadata } from "next";
import HomeSections from "@/app/components/HomeSections";
import JsonLd from "@/app/components/JsonLd";
import { site } from "@/data/site";
import { getPageSeo } from "@/lib/content";
import { buildMetadata, customLd } from "@/lib/seo";


/** Rendered once, served from the cache and refreshed every minute (and at once when you save in the dashboard), so every visit is fast. */
export const revalidate = 60;
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
      <HomeSections />
    </>
  );
}
