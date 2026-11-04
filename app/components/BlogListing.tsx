import Link from "@/app/components/SiteLink";
import BlogCard from "./BlogCard";
import BlogSidebar from "./BlogSidebar";
import Breadcrumb, { type Crumb } from "./Breadcrumb";
import CTABanner from "./CTABanner";
import Pagination from "./Pagination";
import Reveal from "./Reveal";
import type { Post } from "@/types/content";

/** Shared layout for /blog, /blog/page/N, /blog/category/x and /blog/tag/x */
export default function BlogListing({ crumbs, heading, posts, page, pages, intro }: {
  crumbs: Crumb[]; heading?: string; intro?: string; posts: Post[]; page?: number; pages?: number;
}) {
  return (
    <>
      <Breadcrumb items={crumbs} />
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2 min-w-0">
            {heading && (
              <div className="mb-8 animate-fadeIn">
                <h1 className="text-3xl md:text-4xl font-bold text-ink">{heading}</h1>
                {intro && <p className="mt-2 text-gray-600">{intro}</p>}
              </div>
            )}
            {posts.length === 0 && (
              <p className="text-gray-600">No articles yet. <Link href="/blog" className="text-brand-text hover:underline">Back to all articles</Link></p>
            )}
            <div className="space-y-12">
              {posts.map((p, i) => (
                <Reveal key={p.slug}><BlogCard post={p} priority={i === 0} /></Reveal>
              ))}
            </div>
            {page && pages ? <Pagination page={page} pages={pages} /> : null}
          </div>
          <BlogSidebar />
        </div>
      </section>
      <CTABanner />
    </>
  );
}
