import Image from "next/image";
import type { Post } from "@/types/content";

const palette = [
  "from-sky-100 to-blue-200",
  "from-orange-50 to-orange-200",
  "from-emerald-100 to-green-200",
  "from-rose-100 to-red-200",
  "from-indigo-100 to-violet-200",
  "from-amber-100 to-yellow-200",
];
const icons: Record<string, string> = { Visa: "✈️", Documents: "📄", "Company Formation": "🏢", Banking: "🏦" };
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Post cover. Uses post.image when set, otherwise a light gradient + category icon. */
export default function PostImage({ post, className = "h-52 sm:h-64", priority = false }: { post: Post; className?: string; priority?: boolean }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-lg bg-gradient-to-br ${palette[hash(post.slug) % palette.length]} ${className}`}>
      {post.image ? (
        <Image src={post.image} alt={post.title} fill priority={priority} sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl opacity-80" aria-hidden="true">{icons[post.category] ?? "📰"}</span>
      )}
    </div>
  );
}
