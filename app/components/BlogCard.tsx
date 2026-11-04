import Link from "next/link";
import type { Post } from "@/types/content";
import { formatDate, readingMinutes, slugify } from "@/lib/content";
import PostImage from "./PostImage";

export default function BlogCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-lg" aria-label={post.title} tabIndex={-1}>
        <div className="group-hover:scale-[1.02] transition-transform duration-700">
          <PostImage post={post} priority={priority} />
        </div>
      </Link>
      <p className="mt-5 text-xs text-gray-500">
        <Link href={`/blog/category/${slugify(post.category)}`} className="font-semibold text-gray-600 hover:text-brand-text">{post.category}</Link>
        {" "}· {readingMinutes(post)} min read
      </p>
      <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-[#2b3a55] leading-snug">
        <Link href={`/blog/${post.slug}`} className="hover:text-brand-text transition-colors">{post.title}</Link>
      </h2>
      <p className="mt-2 text-gray-600 text-sm sm:text-base leading-relaxed">{post.excerpt}</p>
      <p className="mt-3 text-xs text-gray-500">
        By <strong className="text-gray-800">{post.author ?? "Al Anfal Doc Team"}</strong> · <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>
    </article>
  );
}
