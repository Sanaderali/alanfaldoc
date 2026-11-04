import Link from "next/link";
import Reveal from "./Reveal";
import BlogSearch from "./BlogSearch";
import { formatDate, getCategories, getCountries, getPosts, getTags } from "@/lib/content";

export default async function BlogSidebar() {
  const [cats, posts, tags, countries] = await Promise.all([getCategories(), getPosts(), getTags(), getCountries()]);
  const h = "text-lg font-semibold text-gray-900 mb-4";
  return (
    <aside className="space-y-10">
      <BlogSearch />

      <Reveal>
        <h2 className={h}>Categories</h2>
        <ul>
          {cats.map((c) => (
            <li key={c.slug} className="border-b border-dotted border-gray-300">
              <Link href={`/blog/category/${c.slug}`} className="group flex items-center justify-between py-2.5 text-sm text-gray-700 hover:text-brand-text transition-colors">
                <span><span className="text-brand-text mr-2 font-bold" aria-hidden="true">»</span>{c.name}</span>
                <span className="text-xs text-gray-400">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal>
        <h2 className={h}>Latest Posts</h2>
        <ul className="space-y-4">
          {posts.slice(0, 3).map((p) => (
            <li key={p.slug} className="pb-4 border-b border-dotted border-gray-300 last:border-0">
              <p className="text-xs text-gray-400 mb-1">{formatDate(p.date)} · {p.category}</p>
              <Link href={`/blog/${p.slug}`} className="font-medium text-gray-900 hover:text-brand-text transition-colors leading-snug">{p.title}</Link>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      {tags.length > 0 && (
        <Reveal>
          <h2 className={h}>Tags Cloud</h2>
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.slug}>
                <Link href={`/blog/tag/${t.slug}`} className="inline-block px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded hover:bg-brand hover:text-white transition-colors">{t.name}</Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <Reveal>
        <h2 className={h}>Countries:</h2>
        <ul className="space-y-3">
          {countries.slice(0, 4).map((c) => (
            <li key={c.slug}>
              <Link href={`/countries/${c.slug}`} className="group flex items-center gap-3">
                <span className={`w-16 h-12 rounded bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl`} aria-hidden="true">{c.flag}</span>
                <span className="font-medium text-gray-900 group-hover:text-brand-text transition-colors">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </aside>
  );
}
