import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/data/site";
import { getSiteSettings } from "@/lib/settings";

/** Root layout: only what every route (site + admin) needs. Header/footer live in app/(site)/layout.tsx. */
export async function generateMetadata(): Promise<Metadata> {
  // verification codes come from Dashboard -> Search Console (or the GOOGLE_SITE_VERIFICATION / BING_SITE_VERIFICATION server variables)
  const settings = await getSiteSettings();
  const google = settings.googleVerification || process.env.GOOGLE_SITE_VERIFICATION || undefined;
  const bing = settings.bingVerification || process.env.BING_SITE_VERIFICATION || undefined;
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} - ${site.tagline}`, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    openGraph: { type: "website", siteName: site.name, locale: site.locale, title: `${site.name} - ${site.tagline}`, description: site.description, url: site.url },
    twitter: { card: "summary_large_image", title: `${site.name} - ${site.tagline}`, description: site.description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    verification: { google, other: bing ? { "msvalidate.01": bing } : undefined },
  };
}

export const viewport: Viewport = { themeColor: "#0A5C36", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* visitors who chose another language: set direction at once and keep the English text hidden for a split second (max 1.2s) so it never flashes */}
        <script dangerouslySetInnerHTML={{ __html: "try{var l=localStorage.getItem('aa-lang');if(l&&l!=='en'&&!/^\\/(admin|preview)/.test(location.pathname)){var d=document.documentElement;d.lang=l;d.dir=l==='ar'?'rtl':'ltr';d.setAttribute('data-tr','1');setTimeout(function(){d.removeAttribute('data-tr')},1200)}}catch(e){}" }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
