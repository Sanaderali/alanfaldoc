import { site } from "@/data/site";
import { abs } from "@/lib/seo";
import { getCountries, getFaqGroups, getPosts, getServices } from "@/lib/content";

export const revalidate = 900;

type Rich = { title: string; url: string; answer?: string; takeaways?: string[]; table?: { label: string; value: string }[]; faqs?: { question: string; answer: string }[]; sources?: { title: string; url: string }[]; regions?: { name: string; summary: string; cities?: string }[]; regionsLabel?: string; updated?: string; author?: string };

function block(r: Rich) {
  const out = [`## ${r.title}`, `URL: ${r.url}`];
  if (r.author || r.updated) out.push(`${r.author ? `Author: ${r.author}. ` : ""}${r.updated ? `Last updated: ${r.updated.slice(0, 10)}.` : ""}`);
  if (r.answer) out.push("", `**Quick answer:** ${r.answer}`);
  if (r.takeaways?.length) out.push("", "Key takeaways:", ...r.takeaways.map((t) => `- ${t}`));
  if (r.table?.length) out.push("", "At a glance:", ...r.table.map((t) => `- ${t.label}: ${t.value}`));
  if (r.regions?.length) out.push("", `${r.regionsLabel || "States"}:`, ...r.regions.map((g) => `- ${g.name}${g.summary ? `: ${g.summary}` : ""}${g.cities ? ` Main cities: ${g.cities}.` : ""}`));
  if (r.faqs?.length) out.push("", "FAQs:", ...r.faqs.flatMap((f) => [`Q: ${f.question}`, `A: ${f.answer}`]));
  if (r.sources?.length) out.push("", "Sources:", ...r.sources.map((s) => `- ${s.title}: ${s.url}`));
  return out.join("\n");
}

/** /llms-full.txt: the key facts of every page in one plain-text file, for AI assistants and RAG crawlers. */
export async function GET() {
  const [services, countries, posts, faqGroups] = await Promise.all([getServices(), getCountries(), getPosts(), getFaqGroups()]);
  const parts: string[] = [
    `# ${site.name}`,
    `> ${site.description}`,
    `${site.name}, ${site.address}. Phone ${site.phone}. Email ${site.email}. Hours: ${site.hours.join("; ")}.`,
    "",
    "# Services",
    ...services.map((s) => block({ title: s.title, url: abs(`/services/${s.slug}`), answer: s.answer ?? s.summary, takeaways: s.takeaways, table: s.summaryTable, faqs: s.faqs, sources: s.sources, updated: s.updatedAt, author: s.author ?? site.defaultAuthor })),
    "",
    "# Countries",
    ...countries.map((c) => block({ title: c.name, url: abs(`/countries/${c.slug}`), answer: c.answer ?? c.summary, takeaways: c.takeaways, table: [...(c.stats ?? []).map((x) => ({ label: x.label, value: x.value + (x.note ? ` (${x.note})` : "") })), ...c.facts.map((f) => ({ label: f.label, value: f.value })), ...(c.summaryTable ?? [])], faqs: c.faqs, sources: c.sources, regions: c.regions, regionsLabel: c.regionsLabel, updated: c.updatedAt, author: c.author ?? site.defaultAuthor })),
    "",
    "# Articles",
    ...posts.map((p) => block({ title: p.title, url: abs(`/blog/${p.slug}`), answer: p.answer ?? p.excerpt, takeaways: p.takeaways, table: p.summaryTable, sources: p.sources, updated: p.updatedAt ?? p.date, author: p.author ?? site.defaultAuthor })),
    "",
    "# General FAQs",
    ...faqGroups.flatMap((g) => [`## ${g.title}`, ...g.faqs.flatMap((f) => [`Q: ${f.question}`, `A: ${f.answer}`])]),
  ];
  return new Response(parts.join("\n\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
