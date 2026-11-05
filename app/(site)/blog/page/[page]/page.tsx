import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BlogListing from "@/app/components/BlogListing";
import { getPostsPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ page: string }> };

export async function generateStaticParams() {
  const { pages } = await getPostsPage(1);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = Number((await params).page);
  return buildMetadata({ title: `Our Latest News & Articles - Page ${n}`, description: "News and guides on Dubai business setup, visas and documents.", path: `/blog/page/${n}` });
}

export default async function BlogPageN({ params }: Props) {
  const n = Number((await params).page);
  if (!Number.isInteger(n) || n < 1) notFound();
  if (n === 1) redirect("/blog");
  const { posts, pages } = await getPostsPage(n);
  if (n > pages) notFound();
  return <BlogListing heading={`Our Latest News & Articles - Page ${n}`} crumbs={[{ label: "Our Latest News & Articles", href: "/blog" }, { label: `Page ${n}` }]} posts={posts} page={n} pages={pages} />;
}
