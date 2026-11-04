# Alan Faldo - Business Website

A modern, beautiful coming soon page built with Next.js, React, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📦 Tech Stack

- **Framework**: Next.js 16.4
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Deployment**: Ready for Vercel, Netlify, or any Node.js hosting

## 🎨 Features

- Beautiful gradient background with animated elements
- Responsive design for all devices
- Email notification signup form
- Social media links
- Smooth animations and transitions
- Dark/Light mode support
- SEO optimized

## 📝 Customization

- Edit [app/page.tsx](app/page.tsx) to customize the coming soon page
- Update social media links in the same file
- Modify colors in [tailwind.config.ts](tailwind.config.ts)
- Change metadata in [app/layout.tsx](app/layout.tsx)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📄 License

ISC

## Managing content (countries, services, blog)

All content lives in `data/` (`countries.ts`, `services.ts`, `posts.ts`, `site.ts`) and is read **only** through `lib/content.ts`.

- **Add a country / service / post:** add one object to the matching file. Its page (`/countries/<slug>`, `/services/<slug>`, `/blog/<slug>`), the listing, the footer and the sitemap update automatically.
- **Country photo:** set `image: "/countries/xyz.jpg"` (file in `public/`); without it a gradient + flag banner is used.
- **Move to a CMS / database / API later:** change the function bodies in `lib/content.ts`. Pages and components stay untouched.
- Site name, contact details, navigation and social links: `data/site.ts`.

## SEO & AI-SEO (ready for the main domain)

| What | Where |
|---|---|
| Domain, name, phone, address, hours, social URLs, area served | `data/site.ts` (set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` on the server) |
| Per-page title / description / keywords / og:image / noindex | optional `seo: { ... }` on any country, service or post in `data/` |
| Metadata + canonical + Open Graph + Twitter | `lib/seo.ts` → `buildMetadata()` |
| Schema.org JSON-LD: Organization/LocalBusiness, WebSite, BreadcrumbList, Service, FAQPage, WebPage(Country), BlogPosting | `lib/seo.ts` + `app/components/JsonLd.tsx` |
| FAQs (each service/country page + `/faqs`) | `faqs` on the item, or `data/faqs.ts`. FAQ schema is generated from the same text that is shown |
| `robots.txt` incl. AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) | `app/robots.ts`, toggle bots in `crawlers` in `data/site.ts` |
| `sitemap.xml`, `llms.txt` (AI-readable site summary), default share image | `app/sitemap.ts`, `app/llms.txt/route.ts`, `app/opengraph-image.tsx` |

Environment variables (all optional): `NEXT_PUBLIC_SITE_URL`, `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `SITE_INDEXING=off` (blocks all crawlers on staging).

Before launch: replace sample content/contact details, add real social URLs, address/geo, and submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Icons (Font Awesome Free kit)

The kit is loaded once in `app/layout.tsx` (override with `NEXT_PUBLIC_FA_KIT=<your kit id>`). Use icons through `app/components/Icon.tsx`:

```tsx
<Icon name="building" />                      // solid icon
<Icon name="fa-brands fa-facebook-f" />       // brands / other styles
```

Service icons are the `icon` field in `data/services.ts`; blog category icons are `categoryIcons` and social icons are `social[].icon` in `data/site.ts`. Find names at https://fontawesome.com/search?o=r&m=free (free set only). In the Font Awesome kit settings, add your site's domain(s) to **Allowed Domains** (including `localhost` for development), otherwise the icons will not load.
