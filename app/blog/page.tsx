import type { Metadata } from "next";
import BlogListing from "../components/BlogListing";
import { getPostsPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Our Latest News & Articles",
  description: "News and guides on Dubai business setup, visas and documents.",
  path: "/blog",
});

export default async function BlogPage() {
  const { posts, pages } = await getPostsPage(1);
  return <BlogListing crumbs={[{ label: "Our Latest News & Articles" }]} posts={posts} page={1} pages={pages} />;
}
