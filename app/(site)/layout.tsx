import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CtaBlock from "@/app/components/CtaBlock";
import HideOn from "@/app/components/HideOn";
import Analytics from "@/app/components/Analytics";
import ChatLauncher from "@/app/components/ChatLauncher";
import IdlePrefetch from "@/app/components/IdlePrefetch";
import JsonLd from "@/app/components/JsonLd";
import FloatingWhatsApp from "@/app/components/FloatingWhatsApp";
import { getServices, getSocial, getWhatsApp } from "@/lib/content";
import { organizationLd, websiteLd } from "@/lib/seo";

/** Scheduled items go live within 15 minutes even if nobody saves anything in the dashboard. */
export const revalidate = 900;

/** Public website shell (header, footer, site-wide schema). The admin dashboard has its own layout. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [services, wa, social] = await Promise.all([getServices(), getWhatsApp(), getSocial()]);
  return (
    <>
      <JsonLd data={[organizationLd(services, social.map((x) => x.url)), websiteLd()]} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded">Skip to content</a>
      <Header social={social.map((x) => ({ platform: x.platform, url: x.url }))} />
      <main id="main">{children}</main>
      {/* one call-to-action banner on every page, except on dashboard previews and on pages that have their own topic banner */}
      <HideOn patterns={["^/preview", "^/countries/[^/]+(/[^/]+)?$", "^/blog/(?!category|tag|page|search)[^/]+$"]}>
        <CtaBlock variant="banner" title="Ready to get started?" text="Contact us now. Message us on WhatsApp, request a free quote or call our team, and we will get back to you quickly." />
      </HideOn>
      <Footer />
      <ChatLauncher />
      <FloatingWhatsApp numbers={wa.map((w) => ({ label: w.label, number: w.number, message: w.message }))} />
      <IdlePrefetch />
      <Analytics />
    </>
  );
}
