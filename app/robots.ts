import type { MetadataRoute } from "next";
import { crawlers, site } from "@/data/site";
import { abs } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // SITE_INDEXING=off blocks everything (use on staging / preview deployments)
  if (process.env.SITE_INDEXING === "off") return { rules: { userAgent: "*", disallow: "/" } };

  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", ...(crawlers.search ? { allow: "/" } : { disallow: "/" }) },
    ...Object.entries(crawlers.ai).map(([userAgent, allowed]) => ({ userAgent, ...(allowed ? { allow: "/" } : { disallow: "/" }) })),
  ];
  return { rules, sitemap: abs("/sitemap.xml"), host: site.url };
}
