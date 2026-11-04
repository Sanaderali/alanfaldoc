import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb";
import CTABanner from "../components/CTABanner";
import Reveal from "../components/Reveal";
import { formatDate, getPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Blog", description: "News and guides on Dubai business setup, visas and documents.", path: "/blog" });

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <Breadcrumb items={[{ label: "Blog" }]} />
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Latest News & Guides</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 80}>
                <Link href={`/blog/${p.slug}`} className="group block h-full bg-white border border-gray-200 rounded-lg p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500">
                  <p className="text-xs text-gray-500 mb-2">{formatDate(p.date)} · {p.category}</p>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#ff5722] transition-colors">{p.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{p.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}
