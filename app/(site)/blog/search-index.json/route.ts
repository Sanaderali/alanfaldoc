import { getPosts } from "@/lib/content";

export const dynamic = "force-static";

/** Tiny pre-built index used by the blog search box (regenerated at build time). */
export async function GET() {
  const posts = await getPosts();
  return Response.json(posts.map((p) => ({ title: p.title, slug: p.slug, category: p.category, excerpt: p.excerpt })));
}
