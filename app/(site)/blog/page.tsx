import type { Metadata } from "next";
import BlogListing from "@/app/components/BlogListing";
import { getPostsPage, getPageSeo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";


/** Rendered once, served from the cache and refreshed every minute (and at once when you save in the dashboard), so every visit is fast. */
export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("blog");
  return buildMetadata({ title: "Dubai Business Setup, Visa & Attestation Guides", description: "Practical guides on Dubai company setup, trade licences, Ejari, document attestation and visa paperwork, written for investors and business owners.", path: "/blog", seo });
}

export default async function BlogPage() {
  const { posts, pages } = await getPostsPage(1);
  return <BlogListing crumbs={[{ label: "Our Latest News & Articles" }]} heading="Our Latest News & Articles" intro="Practical guides on company setup, licences, attestation and visa paperwork in Dubai and the UAE." posts={posts} page={1} pages={pages} />;
}
