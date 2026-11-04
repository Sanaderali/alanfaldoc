import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListing from "../../../components/BlogListing";
import { getCategories, getPostsByCategory } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  return cat ? buildMetadata({ title: `${cat.name} Articles`, description: `Articles and guides about ${cat.name.toLowerCase()}.`, path: `/blog/category/${slug}` }) : {};
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();
  const posts = await getPostsByCategory(slug);
  return <BlogListing crumbs={[{ label: "Blog", href: "/blog" }, { label: cat.name }]} heading={cat.name} posts={posts} />;
}
