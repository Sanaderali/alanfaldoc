import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ChatLauncher from "@/app/components/ChatLauncher";
import JsonLd from "@/app/components/JsonLd";
import { getServices } from "@/lib/content";
import { organizationLd, websiteLd } from "@/lib/seo";

/** Scheduled items go live within 15 minutes even if nobody saves anything in the dashboard. */
export const revalidate = 900;

/** Public website shell (header, footer, site-wide schema). The admin dashboard has its own layout. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const services = await getServices();
  return (
    <>
      <JsonLd data={[organizationLd(services), websiteLd()]} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <ChatLauncher />
    </>
  );
}
