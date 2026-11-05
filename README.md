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

The public site uses one palette, defined as 6+ CSS variables at the top of `app/globals.css` (RGB triplets) and exposed by Tailwind as tokens:

| Role | Hex | Tailwind |
|---|---|---|
| Page background | `#F8F9FA` | `bg-canvas` |
| Primary (headers, main buttons, links) | `#0A5C36` deep green | `bg-brand`, `text-brand-text`, `hover:bg-brand-dark` |
| Secondary (CTAs, highlights) | `#D32F2F` deep red | `bg-accent`, `text-accent`, `hover:bg-accent-dark` |
| Text | `#1A1A1A` | `text-ink` |
| Cards / surfaces | `#FFFFFF` | `bg-white` / `bg-surface` |

Change the variables once to re-theme the whole site. The dashboard keeps its own WordPress-blue palette (`.admin-theme`).

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
- **WordPress-style admin:** dark left menu with submenus (All Posts / Add New / Categories / Tags), top admin bar, list tables with filter links (All | Published | Draft | Scheduled | Trash), bulk actions, date/category filters, search, sortable columns, hover row actions and pagination for posts, services and countries. Items go to **Trash** first (restore or delete permanently). The dashboard uses its own WordPress-blue palette (`.admin-theme` in `app/globals.css`), separate from the public site theme.
- **Visual editor (WordPress-style):** write services, countries and posts in a "what you see is what you get" editor: headings, bold/italic/underline, bullet and numbered lists, quotes, links and images from the media library. Existing content opens in the editor automatically. The HTML is cleaned with an allow-list before saving and again before rendering (no scripts, inline styles, iframes or unsafe images).
- **Preview:** every editor (services, countries, posts, FAQs) has a **Preview** button that opens the real page in a new tab with your *current, even unsaved* edits, without changing the live site. Preview pages are admin-only and `noindex`.
- **Flags:** countries show real flag images (43 built-in flags in `public/flags`, picked automatically from the flag emoji, or choose/upload one in the country editor). This also fixes Windows showing letters like "US" instead of flag emoji.
- **Sitemap page:** `/sitemap` (linked in the footer) lists every page, service, country and post; it updates automatically.
- Each item has: meta title, meta description (live Google preview + character counters), keywords, canonical, noindex, share image, FAQ schema switch, custom JSON-LD, status, publish date/time, slug. The "Needs attention" panel flags missing alt text, bad meta lengths, missing FAQs and invalid schema.
- **Backups:** Dashboard → *Download backup* (all content as JSON). Also copy the `uploads` folder.
- Security: signed HttpOnly session cookie, login throttling (5 tries / 15 min), every admin page and API re-checks the session, `/admin` is `noindex` and blocked in `robots.txt`. Use HTTPS in production.

**Limits to know about:** single admin login; the home page body, header/footer and contact details are still edited in code (`app/components/HomeClient.tsx`, `data/site.ts`). If the host runs several Node processes, a save refreshes the process that handled it immediately and the others within 15 minutes.


## Team, roles & permissions (Super Admin)

Dashboard -> **Team** (Super Admin only) creates, edits and **deactivates** team members and assigns one of five roles. Deactivating someone signs them out immediately. You can also tick **extra permissions** for a person beyond their role.

| Role | Can do |
|---|---|
| **Super Admin** | Everything, including managing team members |
| **Administrator** | Everything except managing team members |
| **Manager** | Content, SEO, media, FAQs, live chat and tickets |
| **Content Editor** | Write/publish content, FAQs, SEO and media. No deleting, chat, tickets or backups |
| **Support Agent** | **Only** live chat and tickets. Cannot open any content or admin screen |

The full permission matrix is shown on the Team page. First run: logging in with `ADMIN_USER` / `ADMIN_PASSWORD` creates the first Super Admin; after that accounts are managed in the dashboard (passwords are stored as salted scrypt hashes). There must always be at least one active Super Admin, and you cannot deactivate yourself.

### Home page content (Services, Countries, Reviews)

- **Our Services** shows 6 services and **Countries We Cover** shows 8 countries. Click the **star** in *Services* / *Countries* (or switch on *Featured* inside the item) to pick which ones come first; if fewer are starred the rest are filled in automatically. Both sections end with a **More Services / More Countries** button.
- **Our Success Stories** comes from **Dashboard -> Reviews** (add, reorder, hide, rating and photo). The section stays hidden until at least one review is published. Add only genuine reviews.
- Phone, address and email for the whole site are in `data/site.ts` (header, footer, contact page, schema and `llms.txt` all read from there).

### Spam protection (contact + home request forms)

No CAPTCHA for real customers. Layers (see `lib/antispam.ts`): hidden trap field; "submitted too fast / without the page timer" check; link and spam-keyword filters; throw-away email domains refused; and limits per IP (3/hour, 8/day), per email (2/hour) and identical messages, counted from the saved tickets so they survive app restarts. Spam is silently dropped (no ticket, no email), so bots learn nothing; the server log shows `[spam] dropped (reason)`. Edit the word list / limits in `lib/antispam.ts`.

### State pages, call-to-action buttons and WhatsApp

- **State pages:** in a country's editor, each state can get its own page (`/countries/<country>/<state>`): headline, quick answer, sourced facts, visual-editor content, FAQs, sources and SEO fields. The country page links to every live state page, state pages link to sibling states, related services and latest articles, and live state pages are in `sitemap.xml`, the page schema and `llms-full.txt`. Write only what your sources support; give each fact a year and a source.
- **Call-to-action buttons:** every country, state and blog page shows WhatsApp / Contact us / Call buttons in three places (after the intro, after the content, and a banner at the end).
- **WhatsApp:** Dashboard -> WhatsApp (Super Admin and Administrator). Add several numbers, each with the team role that looks after it. One active number opens WhatsApp directly; several show a small picker. The round live-chat button sits bottom-left and the WhatsApp button bottom-right.

### Social links, recovery codes, permissions, country stats

- **Social media:** Dashboard -> Social media (Super Admin / Administrator). Add Facebook, Instagram, X, LinkedIn, YouTube, TikTok and more with https links; they show as round icons in the top header (and the mobile menu), the footer and the search-engine data (`sameAs`).
- **Forgot username or password:** `/admin/forgot` (link on the login page). A 6-digit code is emailed (valid 10 minutes, one use, 5 wrong tries, max 3 codes per hour). A correct code shows the username and lets the person set a new password. A Super Admin without an email on the account gets the code at `ADMIN_RECOVERY_EMAIL` (or the first `LEAD_ALERT_EMAIL`). Needs email to be connected.
- **Permissions:** choosing a role ticks its permissions; any box can be unticked (or extra ones ticked) per person. Super Admin is never restricted; team management stays Super Admin only.
- **Country key stats:** in a country's editor, "Key stats" (value, label, optional source note) show as number cards at the top of the country page.
- **Buttons / CTA:** all buttons are rounded pills. The header button says "Get a Free Quote". Every public page ends with a WhatsApp / Contact us now / Call banner (country, state and blog pages have their own topic versions).

### Importing content packs

**Dashboard -> Import content** uploads a `.json` pack of `services`, `countries` and/or `posts` (same fields as the editors). Each item is validated like a normal save; a page whose URL already exists is updated, otherwise created. New pages are always drafts. `content-packs/services-pack-1.json` holds the 17 core service pages and `content-packs/site-pack-2.json` the 20 country hubs ("set up in Dubai from X"), service featured/hidden changes, a UAE feature change and 5 general FAQ groups. `content-packs/landings-pack-1.json` holds 48 service-by-country pages (6 services x 8 countries, `/services/<service>/<country>`), `landings-pack-2a/2b/2c.json` the other 232 pages for 14 core services across all 20 countries, and `landings-pack-3.json` 60 optional pages for services where nationality changes little. They are managed under Dashboard -> Service x Country, where drafts can be published in waves with the service/country filters. `content-packs/regions-pack-1.json` holds 20 key-region pages (one per country; they import as drafts, publish the region page from the country editor), `pillar-pack-1.json` 20 pillar guides and `calendar-posts-pack-1.json` 100 scheduled posts (`editorial-calendar.csv` lists the 60-day calendar). Posts carry `scheduleDay`/`scheduleTime` (Dubai time; day 1 = tomorrow): import with the dashboard option "Schedule blog posts" or `node scripts/import-pack.js <pack> --schedule` and they go live on their day. `content-packs/faqs-services-pack.json` raises Legal Translation and Bank Account Opening to 10 FAQs each (servicePatches may carry `faqs`). The public FAQs page lists every published service with its own FAQs under the general groups. Packs can also carry `reviews` (real customers only). Terminal alternative: `CONTENT_DIR=<content folder> node scripts/import-pack.js <pack> [--dry-run]`. Fees, timings and home-country rules inside are indicative and must be checked before publishing.

### Support Activity (manage your support team)

**Team → Support Activity** (Super Admin / anyone with *Manage users*) shows, for each person who can reply to tickets or chat: which channels they can reply to, how many tickets they replied to, total replies, tickets currently open / pending that are assigned to them, tickets they closed, average first-response time and chats handled. Filter by 7 / 30 / 90 days or all time. A ticket is assigned to whoever replies first, or you can choose **Assigned to** on the ticket; the Tickets list has an *Assigned to* column.

## Live chat (no login for visitors) and tickets

- **Visitors:** a floating "Chat with us" button (bottom right). They enter only a **phone number** (name optional), no account or password. The chat panel loads only when clicked, so it costs nothing at page load.
- **Dashboard -> Live Chat:** real-time inbox (updates every 2 seconds) with chat history, visitor phone, IP, location, page, device and language. Every new chat or message plays a **sound**, shows a **toast**, flashes the browser tab and adds an unread **badge** on the menu on any dashboard page. Use the "Sound on/off" button; browsers may ask once to allow notifications.
- **Location:** uses Cloudflare/Vercel country headers automatically; optionally set `GEOIP_URL`.
- **Tickets:** the contact form creates a ticket (Dashboard -> Tickets) that agents can reply to and close.
- **Protection:** per-visitor secret token, rate limits, hidden spam-trap field, input cleaning. Real-time uses short polling, which works on any shared hosting (no WebSocket server needed).

## Email (placeholders, not connected)

All emails are wired in code (`lib/notify.ts`): welcome email for new team members, lead alert for new chats and tickets, chat transcript when a chat is closed, ticket acknowledgement and ticket replies. They all go through `lib/mail.ts`, which **sends nothing until you connect a provider** (HTTP mail API or SMTP, both documented in that file and in `.env.example`) and logs "[mail] not configured, skipped" instead.

## GEO (generative engine optimisation)

- **Content blocks for AI extraction:** every service, country and article can have an **answer-first summary**, **key takeaways**, an **at-a-glance table**, **sources & references**, an **author** and an automatic **"Last updated"** date. Edit them in the editor under "AI search & trust signals". FAQs render as an H2 with each question an H3.
- **Schema:** Organization/LocalBusiness (with contact point), WebSite, BreadcrumbList, Service, WebPage (dateModified, speakable, citations), FAQPage, BlogPosting (author, citations).
- **Crawlers:** `robots.txt` allows GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Google-Extended, ClaudeBot and others (toggle in `data/site.ts`); `/llms.txt` and `/llms-full.txt` give AI assistants a clean summary of every page. `/admin`, `/api` and previews are `noindex` and disallowed.
- **Technical:** dynamic `sitemap.xml` with last-modified dates and images, canonical tags, security headers, and Core Web Vitals work (no layout shift: measured CLS 0.000; the home page is server-rendered; the chat widget is lazy-loaded).

## AI chat assistant (Groq)

The live chat can answer visitors automatically from the website's own content (services, country guides, FAQs, articles). Set these environment variables on the server, then restart:

- `GROQ_API_KEY` - key from console.groq.com (required; without it the chat works as before, staff only)
- `GROQ_MODEL` - optional, default `openai/gpt-oss-120b`
- `AI_CHAT=off` - optional switch to disable the assistant without removing the key

The assistant introduces itself as a virtual assistant, never invents fees or approvals, answers at most 20 times per chat, and ends with a hand-off (staff are alerted, AI pauses) when someone asks for a person or a quote. When any staff member replies, the AI stops for that chat; use "Resume AI assistant" / "Take over" in Dashboard -> Live chat.

### Chat assistant, enquiries and translation (build 31)

- **Assistant "Sanader":** short, natural replies from the website content; never states prices (explains what affects cost and asks for the next useful detail), declines out-of-scope or payment/other-client questions politely, and steps back only when the visitor asks for a person or staff take over. If someone sincerely asks whether it is a bot, it answers truthfully.
- **Enquiries** (Dashboard -> Enquiries): what each visitor told the assistant (nationality, based in, business/company, visa status, stay, travel, email, what they want) is noted automatically from the conversation, with a chat summary, who closed the chat, and the star rating. Click a row to open the chat. "Add to Reviews" turns feedback into a draft review.
- **Visitor can end the chat** ("End chat" in the widget) and leave a star rating; staff closing a chat triggers the same feedback form.
- **AI knowledge** (Dashboard -> AI knowledge): in Live chat click "Learn from this reply" under a staff answer to teach the assistant. Replies mentioning money, bank or contact details are refused. The assistant does not learn by itself.
- **Translation:** the globe icon in the header switches the whole site to Arabic, Chinese, Hindi, German, French, Japanese, Korean, Italian, Spanish or Dutch (RTL for Arabic). Text is translated with Groq and cached in `content/translations/<lang>.json` (edit a file to correct a translation). English remains the source and what search engines index. On Groq's free tier a page in a new language may take a minute to finish the first time.
