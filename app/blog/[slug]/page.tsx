import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "../../components/Breadcrumb";
import CTABanner from "../../components/CTABanner";
import JsonLd from "../../components/JsonLd";
import { formatDate, getPost, getPosts } from "@/lib/content";
import { articleLd, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  return p ? buildMetadata({ title: p.title, description: p.excerpt, path: `/blog/${p.slug}`, seo: p.seo, image: p.image, type: "article", publishedTime: p.date, modifiedTime: p.updated ?? p.date }) : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <>
      <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
      <JsonLd data={articleLd(post)} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 animate-fadeIn">
        <p className="text-sm text-gray-500 mb-3">{formatDate(post.date)} · {post.category}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
        {post.body.map((para, i) => (
          <p key={i} className="text-gray-600 leading-relaxed mb-5">{para}</p>
        ))}
      </article>
      <CTABanner />
    </>
  );
}
