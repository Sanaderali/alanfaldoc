import { site } from "@/data/site";
import { abs } from "@/lib/seo";
import { getCountries, getFaqGroups, getPosts, getServices } from "@/lib/content";

export const revalidate = 900;

/** /llms.txt: a clean, link-rich summary for AI assistants (see llmstxt.org). Built from the same data as the site. */
export async function GET() {
  const [services, countries, posts, faqs] = await Promise.all([getServices(), getCountries(), getPosts(), getFaqGroups()]);
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is based in ${site.address}. Phone: ${site.phone}. Email: ${site.email}. Hours: ${site.hours.join("; ")}.`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.title}](${abs(`/services/${s.slug}`)}): ${s.summary}`),
    "",
    "## Countries",
    ...countries.map((c) => `- [${c.name}](${abs(`/countries/${c.slug}`)}): ${c.summary}`),
    "",
    "## Guides & News",
    ...posts.map((p) => `- [${p.title}](${abs(`/blog/${p.slug}`)}): ${p.excerpt}`),
    "",
    "## Key Pages",
    `- [About us](${abs("/about")})`,
    `- [FAQs](${abs("/faqs")}): ${faqs.flatMap((g) => g.faqs).length} answered questions`,
    `- [Contact](${abs("/contact")})`,
    `- [Sitemap](${abs("/sitemap")})`,
    `- [Full content for AI assistants](${abs("/llms-full.txt")}): every page's key facts, FAQs and sources in one file`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
