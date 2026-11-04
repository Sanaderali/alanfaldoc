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

## Theme colours

The whole site is themed from 6 CSS variables at the top of `app/globals.css` (`--brand`, `--brand-dark`, `--brand-text`, `--brand-50/100/200`, as RGB triplets). Tailwind exposes them as `bg-brand`, `text-brand-text`, `hover:bg-brand-dark`, `bg-brand-50` etc., so changing the variables re-themes every page.

Ready-made options taken from the logo:

| Option | --brand | --brand-dark | --brand-text | --brand-50 | --brand-100 | --brand-200 |
|---|---|---|---|---|---|---|
| Refined red (default) | `220 38 38` | `185 28 28` | `185 28 28` | `254 242 242` | `254 226 226` | `254 202 202` |
| Deep green | `5 150 105` | `4 120 87` | `4 120 87` | `236 253 245` | `209 250 229` | `167 243 208` |
| Charcoal | `31 41 55` | `17 24 39` | `31 41 55` | `249 250 251` | `243 244 246` | `229 231 235` |

## Dashboard (`/admin`)

A private dashboard to manage **services, countries, blog posts, FAQs, page meta tags, schema, images and alt text**, with draft / published / scheduled status and dates. No database needed.

**Set up (cPanel → Setup Node.js App → Environment variables), then restart:**

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | **Required**, min 8 characters. The dashboard is disabled until it is set |
| `ADMIN_USER` | Login name (default `admin`) |
| `ADMIN_SECRET` | Long random string that signs login sessions (recommended) |
| `CONTENT_DIR` | Optional. Folder for content + uploaded images (default `./content`). Best kept **outside** the app folder |

Log in at `https://yourdomain.com/admin`. See `.env.example`.

**How it works**
- Content is stored as JSON in `content/` (git-ignored, never overwritten by deployments) and images in `content/uploads`. On first start it is seeded from the sample content in `data/*.ts`; after that the dashboard is the source of truth.
- Public pages stay **static**: saving in the dashboard refreshes them, and scheduled items go live within 15 minutes automatically. Visitors never wait on the dashboard or a database.
- Images are validated, resized to 1600px and converted to WebP on upload. Alt text is mandatory. SVG is refused.
- **Visual editor (WordPress-style):** write services, countries and posts in a "what you see is what you get" editor: headings, bold/italic/underline, bullet and numbered lists, quotes, links and images from the media library. Existing content opens in the editor automatically. The HTML is cleaned with an allow-list before saving and again before rendering (no scripts, inline styles, iframes or unsafe images).
- **Preview:** every editor (services, countries, posts, FAQs) has a **Preview** button that opens the real page in a new tab with your *current, even unsaved* edits, without changing the live site. Preview pages are admin-only and `noindex`.
- **Flags:** countries show real flag images (43 built-in flags in `public/flags`, picked automatically from the flag emoji, or choose/upload one in the country editor). This also fixes Windows showing letters like "US" instead of flag emoji.
- **Sitemap page:** `/sitemap` (linked in the footer) lists every page, service, country and post; it updates automatically.
- Each item has: meta title, meta description (live Google preview + character counters), keywords, canonical, noindex, share image, FAQ schema switch, custom JSON-LD, status, publish date/time, slug. The "Needs attention" panel flags missing alt text, bad meta lengths, missing FAQs and invalid schema.
- **Backups:** Dashboard → *Download backup* (all content as JSON). Also copy the `uploads` folder.
- Security: signed HttpOnly session cookie, login throttling (5 tries / 15 min), every admin page and API re-checks the session, `/admin` is `noindex` and blocked in `robots.txt`. Use HTTPS in production.

**Limits to know about:** single admin login; the home page body, header/footer and contact details are still edited in code (`app/components/HomeClient.tsx`, `data/site.ts`). If the host runs several Node processes, a save refreshes the process that handled it immediately and the others within 15 minutes.
