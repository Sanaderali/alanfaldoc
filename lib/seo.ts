import type { Metadata } from "next";
import { site } from "@/data/site";
import type { Country, Faq, Landing, Post, Seo, Service, Region } from "@/types/content";

/**
 * Everything SEO / AI-SEO lives here: metadata + schema.org (JSON-LD) builders.
 * Pages call these helpers, so improving SEO later means editing this file or the
 * optional `seo` field on any country / service / post in /data.
 */

export const abs = (path = "/") => new URL(path, site.url).toString();
const orgId = () => `${abs("/")}#organization`;
const cleanSocial = () => site.social.map((s) => s.href).filter((h) => h.startsWith("http"));

const speakable = { "@type": "SpeakableSpecification", cssSelector: [".geo-answer", "h1"] };
const citations = (sources?: { title: string; url: string }[]) =>
  sources?.length ? { citation: sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })) } : {};
const authorEntity = (name?: string) =>
  name && name !== site.defaultAuthor && !name.toLowerCase().includes("team") ? { "@type": "Person", name, url: abs("/about"), worksFor: { "@id": orgId() } } : { "@id": orgId() };

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
  let d = seo?.description ?? description;
  // very short descriptions are padded with the brand line so search snippets are never thin (explicit dashboard SEO text is left alone)
  if (!seo?.description && d.length < 110) d = `${d.replace(/\.?$/, ".")} ${site.name}: document clearing and business setup support in Dubai, UAE.`.slice(0, 160);
  const img = seo?.image ?? image ?? "/opengraph-image"; // default: app/opengraph-image.tsx
  return {
    title: t,
    description: d,
    keywords: seo?.keywords,
    alternates: { canonical: seo?.canonical ?? abs(path) },
    // explicit on every page (a page-level `undefined` would wipe the site-wide setting): full snippets + large images for search and AI answers
    robots: seo?.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } },
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

export function organizationLd(services: Service[] = [], social: string[] = []) {
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
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", telephone: site.phone, email: site.email, areaServed: "AE", availableLanguage: ["English", "Arabic"] }],
    sameAs: [...new Set([...cleanSocial(), ...social])],
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

/** The service page itself: freshness, authorship, citations and speakable answer for AI assistants */
export function servicePageLd(s: Service) {
  const url = abs(`/services/${s.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: s.seo?.title ?? s.title,
    description: s.answer ?? s.summary,
    inLanguage: "en",
    isPartOf: { "@id": `${abs("/")}#website` },
    about: { "@id": `${url}#service` },
    mainEntity: { "@id": `${url}#service` },
    ...(s.createdAt ? { datePublished: s.createdAt } : {}),
    ...(s.updatedAt ? { dateModified: s.updatedAt, lastReviewed: s.updatedAt } : {}),
    author: authorEntity(s.author),
    publisher: { "@id": orgId() },
    speakable,
    ...citations(s.sources),
  };
}

export function countryPageLd(c: Country) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${abs(`/countries/${c.slug}`)}#webpage`,
    url: abs(`/countries/${c.slug}`),
    name: c.headline,
    description: c.intro || c.summary,
    isPartOf: { "@id": `${abs("/")}#website` },
    about: { "@type": "Country", name: c.name, ...(c.regions?.length ? { containsPlace: c.regions.map((r) => ({ "@type": "AdministrativeArea", name: r.name, ...(r.summary ? { description: r.summary } : {}) })) } : {}) },
    inLanguage: "en",
    ...(c.createdAt ? { datePublished: c.createdAt } : {}),
    ...(c.updatedAt ? { dateModified: c.updatedAt, lastReviewed: c.updatedAt } : {}),
    author: authorEntity(c.author),
    publisher: { "@id": orgId() },
    speakable,
    ...citations(c.sources),
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
    dateModified: p.updatedAt ?? p.updated ?? p.date,
    articleSection: p.category,
    inLanguage: "en",
    isAccessibleForFree: true,
    author: authorEntity(p.author),
    publisher: { "@id": orgId() },
    speakable,
    ...citations(p.sources),
    ...(p.tags?.length ? { keywords: p.tags.join(", ") } : {}),
    ...(p.image ? { image: p.image.startsWith("http") ? p.image : abs(p.image) } : {}),
  };
}

/** Parse the optional hand-written JSON-LD saved in the dashboard (invalid JSON is ignored, never breaks the page). */
export function customLd(raw?: string): object | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return typeof v === "object" && v !== null ? v : null;
  } catch {
    return null;
  }
}

export function regionPageLd(country: Country, r: Region, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${abs(path)}#webpage`,
    url: abs(path),
    name: r.headline || `${r.name}, ${country.name}`,
    description: r.answer || r.summary,
    isPartOf: { "@id": `${abs("/")}#website` },
    about: { "@type": "AdministrativeArea", name: r.name, containedInPlace: { "@type": "Country", name: country.name } },
    inLanguage: "en",
    ...(r.updatedAt ? { dateModified: r.updatedAt, lastReviewed: r.updatedAt } : {}),
    author: authorEntity(country.author),
    publisher: { "@id": orgId() },
    speakable,
    ...citations(r.sources),
  };
}

/** Service x country page: the service, offered to people from that country, plus the page itself. */
export function landingLd(l: Landing, service: Service, country: Country) {
  const path = `/services/${l.service}/${l.country}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${abs(path)}#service`,
      name: l.title,
      serviceType: service.serviceType ?? service.title,
      description: l.summary,
      url: abs(path),
      provider: { "@id": orgId() },
      areaServed: site.areaServed.map((n) => ({ "@type": "Place", name: n })),
      audience: { "@type": "Audience", audienceType: `Investors and business owners from ${country.name}` },
      isRelatedTo: { "@id": `${abs(`/services/${service.slug}`)}#service` },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${abs(path)}#webpage`,
      url: abs(path),
      name: l.headline,
      description: l.answer || l.summary,
      isPartOf: { "@id": `${abs("/")}#website` },
      about: { "@id": `${abs(path)}#service` },
      inLanguage: "en",
      ...(l.updatedAt ? { dateModified: l.updatedAt, lastReviewed: l.updatedAt } : {}),
      author: authorEntity(l.author),
      publisher: { "@id": orgId() },
      speakable,
      ...citations(l.sources),
    },
  ];
}
