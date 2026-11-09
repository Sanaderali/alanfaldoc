/** Plain JavaScript on purpose: the server loads it without needing the native compiler (faster, safer start-up on shared hosting). */

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy. Next.js needs inline scripts for hydration, so 'unsafe-inline' stays for scripts and styles;
 * everything else is limited to this site plus the three third-party services the pages actually use
 * (Font Awesome kit, Google Analytics / Tag Manager, ui-avatars for placeholder photos).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://ui-avatars.com https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const security = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const siteHost = (() => { try { return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").host; } catch { return ""; } })();

/** @type {import("next").NextConfig} */
const nextConfig = {
  // dashboard actions (save, logout...) are accepted when the hosting proxy rewrites the Host header
  experimental: { serverActions: { bodySizeLimit: "25mb", allowedOrigins: siteHost ? [siteHost, `www.${siteHost.replace(/^www\./, "")}`] : [] } },
  reactStrictMode: false,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
    ],
  },
  // www -> main address only (http -> https is left to the hosting panel, a proxy header check here could break asset requests)
  async redirects() {
    if (!isProd || !siteHost || /localhost|127\.0\.0\.1/.test(siteHost)) return [];
    const alt = siteHost.startsWith("www.") ? siteHost.slice(4) : `www.${siteHost}`;
    return [{ source: "/:path((?!_next/).*)", has: [{ type: "host", value: alt }], destination: `https://${siteHost}/:path`, permanent: true }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      // the icon sprite has a content hash in its name, so it can be cached for a year
      { source: "/:file(icons\\.[0-9a-f]{8}\\.svg)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/:file(hero-team.webp)", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      // static brand images and flags change rarely
      { source: "/flags/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/:file(logo.*|logo-.*|hero-team.jpg|email-logo.png)", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      // private areas: never indexed, never cached
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/preview/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
    ];
  },
};

export default nextConfig;
