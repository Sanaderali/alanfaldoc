import type { Metadata } from "next";
import Link from "@/app/components/SiteLink";
import Breadcrumb from "@/app/components/Breadcrumb";
import Flag from "@/app/components/Flag";
import Reveal from "@/app/components/Reveal";
import { getCategories, getCountries, getPageSeo, getPosts, getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("sitemap");
  return buildMetadata({ title: "Sitemap", description: "Every page on our website in one place: services, countries, articles and company information.", path: "/sitemap", seo });
}

const pages = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/countries", label: "Countries" },
  { href: "/blog", label: "Blog" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <h2 className="text-xl font-bold text-ink mb-4 pb-2 border-b border-gray-200">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </Reveal>
  );
}
const link = "text-gray-700 hover:text-brand-text transition-colors";

export default async function SitemapPage() {
  const [services, countries, posts, cats] = await Promise.all([getServices(), getCountries(), getPosts(), getCategories()]);
  return (
    <>
      <Breadcrumb items={[{ label: "Sitemap" }]} />
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink mb-4">Sitemap</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything on our website, in one place.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <Group title="Main pages">{pages.map((p) => <li key={p.href}><Link href={p.href} className={link}>{p.label}</Link></li>)}</Group>
            <Group title="Services">{services.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`} className={link}>{s.title}</Link></li>)}</Group>
            <Group title="Countries">{countries.map((c) => <li key={c.slug}><Link href={`/countries/${c.slug}`} className={`${link} inline-flex items-center gap-2`}><Flag country={c} size={20} />{c.name}</Link></li>)}</Group>
            <Group title="Blog">
              {cats.map((c) => <li key={c.slug}><Link href={`/blog/category/${c.slug}`} className="font-medium text-ink hover:text-brand-text">{c.name}</Link></li>)}
              {posts.map((p) => <li key={p.slug} className="pl-3 border-l-2 border-gray-100"><Link href={`/blog/${p.slug}`} className={`${link} text-sm`}>{p.title}</Link></li>)}
            </Group>
          </div>
        </div>
      </section>
    </>
  );
}
