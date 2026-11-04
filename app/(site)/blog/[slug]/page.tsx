import type { Metadata } from "next";
import PostView from "../../_views/PostView";
import Link from "@/app/components/SiteLink";
import { notFound } from "next/navigation";
import BlogCard from "@/app/components/BlogCard";
import BlogSidebar from "@/app/components/BlogSidebar";
import Breadcrumb from "@/app/components/Breadcrumb";
import CTABanner from "@/app/components/CTABanner";
import Icon from "@/app/components/Icon";
import JsonLd from "@/app/components/JsonLd";
import PostBody from "@/app/components/PostBody";
import RichContent from "@/app/components/RichContent";
import PostImage from "@/app/components/PostImage";
import Reveal from "@/app/components/Reveal";
import { formatDate, getPost, getPosts, readingMinutes, slugify } from "@/lib/content";
import { abs, articleLd, buildMetadata, customLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  return p ? buildMetadata({ title: p.title, description: p.excerpt, path: `/blog/${p.slug}`, seo: p.seo, image: p.image, type: "article", publishedTime: p.date, modifiedTime: p.updated ?? p.date }) : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <PostView post={post} />;
}
