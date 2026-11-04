import type { MetadataRoute } from "next";
import { crawlers, site } from "@/data/site";
import { abs } from "@/lib/seo";

/** paths no crawler needs: dashboard, APIs and admin-only previews */
const PRIVATE = ["/admin", "/api/", "/preview/"];

export default function robots(): MetadataRoute.Robots {
  // SITE_INDEXING=off blocks everything (use on staging / preview deployments)
  if (process.env.SITE_INDEXING === "off") return { rules: { userAgent: "*", disallow: "/" } };

  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", ...(crawlers.search ? { allow: "/", disallow: PRIVATE } : { disallow: "/" }) },
    ...Object.entries(crawlers.ai).map(([userAgent, allowed]) => ({ userAgent, ...(allowed ? { allow: "/", disallow: PRIVATE } : { disallow: "/" }) })),
  ];
  return { rules, sitemap: abs("/sitemap.xml"), host: site.url };
}
