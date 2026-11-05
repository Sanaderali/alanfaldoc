import type { Metadata } from "next";
import BlogListing from "@/app/components/BlogListing";
import { getPostsPage, getPageSeo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";


/** Lists read the (cached) content files on every request, so newly published items appear immediately. */
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("blog");
  return buildMetadata({ title: "Our Latest News & Articles", description: "Practical guides on Dubai company setup, trade licences, Ejari, document attestation and visa paperwork, written for investors and business owners.", path: "/blog", seo });
}

export default async function BlogPage() {
  const { posts, pages } = await getPostsPage(1);
  return <BlogListing crumbs={[{ label: "Our Latest News & Articles" }]} heading="Our Latest News & Articles" intro="Practical guides on company setup, licences, attestation and visa paperwork in Dubai and the UAE." posts={posts} page={1} pages={pages} />;
}
