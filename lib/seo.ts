import type { Metadata } from "next";
import { site } from "@/data/site";
import type { Country, Faq, Post, Seo, Service } from "@/types/content";

/**
 * Everything SEO / AI-SEO lives here: metadata + schema.org (JSON-LD) builders.
 * Pages call these helpers, so improving SEO later means editing this file or the
 * optional `seo` field on any country / service / post in /data.
 */

export const abs = (path = "/") => new URL(path, site.url).toString();
const orgId = () => `${abs("/")}#organization`;
const cleanSocial = () => site.social.map((s) => s.href).filter((h) => h.startsWith("http"));

type MetaInput = {
  title: string;
  description: string;
  path: string;
  seo?: Seo;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata({ title, description, path, seo, image, type = "website", publishedTime, modifiedTime }: MetaInput): Metadata {
  const t = seo?.title ?? title;
  const d = seo?.description ?? description;
  const img = seo?.image ?? image ?? "/opengraph-image"; // default: app/opengraph-image.tsx
  return {
    title: t,
    description: d,
    keywords: seo?.keywords,
    alternates: { canonical: abs(path) },
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      url: abs(path),
      siteName: site.name,
      locale: site.locale,
      title: `${t} | ${site.name}`,
      description: d,
      ...(img ? { images: [{ url: img.startsWith("http") ? img : abs(img) }] } : {}),
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: `${t} | ${site.name}`, description: d, ...(site.twitterHandle ? { site: site.twitterHandle } : {}) },
  };
}

/* ---------------- schema.org builders ---------------- */

export function organizationLd(services: Service[] = []) {
  const a = site.addressParts;
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": orgId(),
    name: site.name,
    legalName: site.legalName,
    url: abs("/"),
    description: site.description,
    logo: abs("/logo-black.png"),
    image: abs("/logo-black.png"),
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      ...(a.street ? { streetAddress: a.street } : { streetAddress: site.address }),
      addressLocality: a.locality,
      addressRegion: a.region,
      addressCountry: a.country,
    },
    ...(site.geo ? { geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng } } : {}),
    openingHoursSpecification: site.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: site.areaServed.map((n) => ({ "@type": "Place", name: n })),
    sameAs: cleanSocial(),
    ...(services.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${site.name} Services`,
            itemListElement: services.map((s) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: s.title, url: abs(`/services/${s.slug}`) },
            })),
          },
        }
      : {}),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${abs("/")}#website`,
    url: abs("/"),
    name: site.name,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": orgId() },
  };
}

export function breadcrumbLd(items: { label: string; href?: string }[]) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: abs(c.href) } : {}),
    })),
  };
}

export function faqLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function serviceLd(s: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${abs(`/services/${s.slug}`)}#service`,
    name: s.title,
    serviceType: s.serviceType ?? s.title,
    description: s.summary,
    url: abs(`/services/${s.slug}`),
    provider: { "@id": orgId() },
    areaServed: site.areaServed.map((n) => ({ "@type": "Place", name: n })),
    ...(s.image ? { image: s.image.startsWith("http") ? s.image : abs(s.image) } : {}),
  };
}

export function countryPageLd(c: Country) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${abs(`/countries/${c.slug}`)}#webpage`,
    url: abs(`/countries/${c.slug}`),
    name: c.headline,
    description: c.intro,
    isPartOf: { "@id": `${abs("/")}#website` },
    about: { "@type": "Country", name: c.name },
    publisher: { "@id": orgId() },
  };
}

export function articleLd(p: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    url: abs(`/blog/${p.slug}`),
    mainEntityOfPage: abs(`/blog/${p.slug}`),
    datePublished: p.date,
    dateModified: p.updated ?? p.date,
    articleSection: p.category,
    author: p.author && p.author !== site.name && !p.author.includes("Team") ? { "@type": "Person", name: p.author } : { "@id": orgId() },
    publisher: { "@id": orgId() },
    ...(p.tags?.length ? { keywords: p.tags.join(", ") } : {}),
    ...(p.image ? { image: p.image.startsWith("http") ? p.image : abs(p.image) } : {}),
  };
}
