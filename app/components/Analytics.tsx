"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/** Google tag (GA4) for the PUBLIC website only: never loaded in the dashboard, in dashboard previews or in development. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-KVNZMJ27DM";

export default function Analytics() {
  const path = usePathname();
  if (process.env.NODE_ENV !== "production" || !GA_ID || path.startsWith("/preview")) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="ga-init" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
    </>
  );
}
