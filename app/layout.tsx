import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import JsonLd from "./components/JsonLd";
import { site } from "@/data/site";
import { getServices } from "@/lib/content";
import { organizationLd, websiteLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} - ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: site.locale, title: `${site.name} - ${site.tagline}`, description: site.description, url: site.url },
  twitter: { card: "summary_large_image", title: `${site.name} - ${site.tagline}`, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  // Set these env vars on the server after you add the site in Search Console / Bing Webmaster
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const services = await getServices();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <JsonLd data={[organizationLd(services), websiteLd()]} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
