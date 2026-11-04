import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListing from "@/app/components/BlogListing";
import { getPostsByTag, getTags } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return (await getTags()).map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const t = (await getTags()).find((x) => x.slug === tag);
  return t ? buildMetadata({ title: `Articles tagged "${t.name}"`, description: `Articles and guides tagged ${t.name}.`, path: `/blog/tag/${tag}` }) : {};
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const t = (await getTags()).find((x) => x.slug === tag);
  if (!t) notFound();
  const posts = await getPostsByTag(tag);
  return <BlogListing crumbs={[{ label: "Blog", href: "/blog" }, { label: `Tag: ${t.name}` }]} heading={`Tagged: ${t.name}`} posts={posts} />;
}
