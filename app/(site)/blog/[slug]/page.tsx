import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/app/components/BlogCard";
import BlogSidebar from "@/app/components/BlogSidebar";
import Breadcrumb from "@/app/components/Breadcrumb";
import CTABanner from "@/app/components/CTABanner";
import Icon from "@/app/components/Icon";
import JsonLd from "@/app/components/JsonLd";
import PostBody from "@/app/components/PostBody";
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
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  const i = all.findIndex((p) => p.slug === post.slug);
  const newer = all[i - 1];
  const older = all[i + 1];
  const related = all.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);
  const url = abs(`/blog/${post.slug}`);
  const share = [
    { label: "Facebook", icon: "fa-brands fa-facebook-f", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", icon: "fa-brands fa-x-twitter", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}` },
    { label: "LinkedIn", icon: "fa-brands fa-linkedin-in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "WhatsApp", icon: "fa-brands fa-whatsapp", href: `https://wa.me/?text=${encodeURIComponent(post.title + " " + url)}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Our Latest News & Articles", href: "/blog" }, { label: post.title }]} />
      <JsonLd data={[articleLd(post), ...(customLd(post.schemaCustom) ? [customLd(post.schemaCustom)!] : [])]} />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <article className="lg:col-span-2 min-w-0">
            <div className="animate-fadeIn">
              <PostImage post={post} priority className="h-56 sm:h-80" />
              <p className="mt-6 text-xs text-gray-500">
                <Link href={`/blog/category/${slugify(post.category)}`} className="font-semibold text-gray-600 hover:text-brand-text">{post.category}</Link>
                {" "}· {readingMinutes(post)} min read
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold text-[#2b3a55] leading-tight">{post.title}</h1>
              <p className="mt-3 mb-8 text-sm text-gray-500">
                By <strong className="text-gray-800">{post.author ?? "Al Anfal Doc Team"}</strong> · <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.updated && post.updated !== post.date && <> · Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></>}
              </p>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">{post.excerpt}</p>
            <PostBody body={post.body} />

            {post.tags && post.tags.length > 0 && (
              <Reveal className="mt-10 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 mr-1">Tags:</span>
                {post.tags.map((t) => (
                  <Link key={t} href={`/blog/tag/${slugify(t)}`} className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded hover:bg-brand hover:text-white transition-colors">{t}</Link>
                ))}
              </Reveal>
            )}

            <Reveal className="mt-6 flex flex-wrap items-center gap-3 py-5 border-y border-gray-200">
              <span className="text-sm font-semibold text-gray-900">Share:</span>
              {share.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:border-brand hover:text-brand-text transition-colors"><Icon name={s.icon} className="mr-1.5" />{s.label}</a>
              ))}
            </Reveal>

            <Reveal className="mt-8 flex gap-4 items-center bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="w-14 h-14 shrink-0 rounded-full bg-brand-100 text-brand-text flex items-center justify-center font-bold text-xl" aria-hidden="true">{(post.author ?? "A")[0]}</div>
              <div>
                <p className="font-semibold text-gray-900">{post.author ?? "Al Anfal Doc Team"}</p>
                <p className="text-sm text-gray-600">Practical guidance on company setup, visas and documents in Dubai and the UAE.</p>
              </div>
            </Reveal>

            {(newer || older) && (
              <nav aria-label="More articles" className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {older ? (
                  <Link href={`/blog/${older.slug}`} rel="prev" className="group border border-gray-200 rounded-lg p-4 hover:border-brand transition-colors">
                    <span className="text-xs text-gray-400"><Icon name="arrow-left" className="mr-1" />Previous article</span>
                    <span className="block font-medium text-gray-900 group-hover:text-brand-text transition-colors">{older.title}</span>
                  </Link>
                ) : <span />}
                {newer && (
                  <Link href={`/blog/${newer.slug}`} rel="next" className="group border border-gray-200 rounded-lg p-4 hover:border-brand transition-colors sm:text-right">
                    <span className="text-xs text-gray-400">Next article<Icon name="arrow-right" className="ml-1" /></span>
                    <span className="block font-medium text-gray-900 group-hover:text-brand-text transition-colors">{newer.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </article>

          <BlogSidebar />
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10"><h2 className="text-3xl font-bold text-gray-900">Related Articles</h2></Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {related.map((p) => <Reveal key={p.slug}><BlogCard post={p} /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
