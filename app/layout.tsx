import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { site } from "@/data/site";

/** Root layout: only what every route (site + admin) needs. Header/footer live in app/(site)/layout.tsx. */
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://kit.fontawesome.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ka-f.fontawesome.com" crossOrigin="anonymous" />
        {/* Font Awesome config, runs before the kit. "nest" keeps each <i> in place so React hydration is never disturbed */}
        <script dangerouslySetInnerHTML={{ __html: "window.FontAwesomeConfig={autoReplaceSvg:'nest'};" }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Font Awesome Free kit */}
        <Script src={`https://kit.fontawesome.com/${process.env.NEXT_PUBLIC_FA_KIT ?? "1b8091c28c"}.js`} crossOrigin="anonymous" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
