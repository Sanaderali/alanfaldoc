import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { site } from "@/data/site";
import { requirePerm } from "@/lib/auth";
import { getCountries, getLandings, getPosts, getServices } from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";
import { readAll } from "@/lib/store";
import { Badge, PageHeader, btnPrimary } from "../../ui";
import { saveSearchSettings } from "../search-console-actions";

export const dynamic = "force-dynamic";

const input = "w-full px-3 py-2 border border-a-line2 rounded-[3px] bg-a-surface text-[13px] font-mono";

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string; e?: string }> }) {
  await requirePerm("seo.manage");
  const sp = await searchParams;
  const [settings, map, services, countries, posts, landings, pages] = await Promise.all([getSiteSettings(), sitemap(), getServices(), getCountries(), getPosts(), getLandings(), readAll("pages")]);
  const rob = robots();
  const urlOk = /^https:\/\//.test(site.url) && !/localhost|127\.0\.0\.1/.test(site.url);
  const blocked = process.env.SITE_INDEXING === "off";
  const noindexed = [...services.map((s) => ({ t: s.title, n: s.seo?.noindex })), ...countries.map((c) => ({ t: c.name, n: c.seo?.noindex })), ...posts.map((p) => ({ t: p.title, n: p.seo?.noindex })), ...landings.map((l) => ({ t: l.title, n: l.seo?.noindex })), ...pages.map((p) => ({ t: p.name, n: p.seo?.noindex }))].filter((x) => x.n);
  const google = settings.googleVerification || process.env.GOOGLE_SITE_VERIFICATION;
  const checks: [string, boolean, string][] = [
    ["Website address is HTTPS and public", urlOk, `Currently ${site.url}. Set NEXT_PUBLIC_SITE_URL to your real address (https://alanfaldoc.com) when you build.`],
    ["Search engines are allowed in", !blocked, blocked ? "SITE_INDEXING=off is set on the server: remove it, otherwise robots.txt blocks everything." : "robots.txt allows crawling; only /admin, /api and /preview are blocked."],
    ["Sitemap lists your pages", map.length > 20, `${map.length} URLs in ${site.url}/sitemap.xml`],
    ["No page is hidden from Google by mistake", noindexed.length === 0, noindexed.length ? `${noindexed.length} page(s) are set to noindex: ${noindexed.slice(0, 6).map((x) => x.t).join(", ")}` : "No published page has noindex."],
    ["Google verification code saved", !!google, google ? "A verification tag is added to every page." : "Paste your Search Console HTML tag below (or verify the whole domain by DNS, see step 1)."],
  ];
  return (
    <>
      <PageHeader title="Search Console" subtitle="Connect your website to Google Search Console and Bing, and check that nothing stops your pages from being found." />
      {sp.saved && <p role="status" className="mb-3 text-[13px] text-green-500">Saved. The tag appears on your pages within a minute.</p>}
      {sp.e && <p role="alert" className="mb-3 text-[13px] text-a-red">That does not look like a verification code. Paste the whole &lt;meta&gt; tag from Search Console, or only the code inside content=&quot;…&quot;.</p>}

      <section className="bg-a-surface border border-a-line p-4 mb-5 max-w-3xl">
        <h2 className="font-semibold text-sm mb-2">Health check</h2>
        <ul className="space-y-2 text-[13px]">
          {checks.map(([t, ok, d]) => <li key={t} className="flex gap-2"><Badge tone={ok ? "ok" : "error"}>{ok ? "OK" : "Fix"}</Badge><span><strong>{t}</strong><br /><span className="text-a-muted">{d}</span></span></li>)}
        </ul>
        <p className="mt-3 text-[12px] text-a-subtle">Robots rules: {JSON.stringify(rob.rules).slice(0, 160)}…</p>
      </section>

      <form action={saveSearchSettings} className="bg-a-surface border border-a-line p-4 mb-5 max-w-3xl space-y-3">
        <h2 className="font-semibold text-sm">Verification codes</h2>
        <div><label htmlFor="google" className="block text-[13px] font-medium mb-1">Google Search Console (HTML tag method)</label><input id="google" name="google" defaultValue={settings.googleVerification ?? ""} placeholder='<meta name="google-site-verification" content="…" />  or just the code' className={input} /></div>
        <div><label htmlFor="bing" className="block text-[13px] font-medium mb-1">Bing Webmaster Tools (optional)</label><input id="bing" name="bing" defaultValue={settings.bingVerification ?? ""} placeholder='<meta name="msvalidate.01" content="…" />  or just the code' className={input} /></div>
        <button className={btnPrimary}>Save</button>
      </form>

      <section className="bg-a-surface border border-a-line p-4 max-w-3xl text-[13px] space-y-3">
        <h2 className="font-semibold text-sm">Set up Search Console in 6 steps</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Add the property.</strong> At <em>search.google.com/search-console</em> choose <strong>Domain</strong> and enter <code>alanfaldoc.com</code>. It covers http, https, www and non-www together. Google shows a DNS TXT record: add it in your domain&apos;s DNS (Namecheap: Domain List, Manage, Advanced DNS, Add record, type TXT, host @). No code is needed for this method. If you prefer the <strong>URL prefix</strong> method, enter <code>https://alanfaldoc.com</code>, choose the <strong>HTML tag</strong> option and paste the tag in the box above.</li>
          <li><strong>Submit the sitemap.</strong> In Search Console open <em>Sitemaps</em> and add <code>sitemap.xml</code> (full address <code>{site.url}/sitemap.xml</code>). Status should become &quot;Success&quot;.</li>
          <li><strong>Use one address.</strong> Open the site with and without <code>www</code> and with <code>http://</code>: every version must end on <code>{site.url}</code>. This build redirects them automatically when both names point to the app; otherwise add the redirect in cPanel.</li>
          <li><strong>Ask Google to index your most important pages.</strong> Paste each address in the top search bar (URL inspection), then <em>Request indexing</em>: home, the main service pages and the country pages. Do about 10 a day.</li>
          <li><strong>Check what is indexed.</strong> <em>Pages</em> shows indexed and not indexed pages with the reason. &quot;Crawled, currently not indexed&quot; on many service × country pages means Google found them too similar: publish them in smaller waves and add real detail to the pages that matter most.</li>
          <li><strong>Read the Performance report.</strong> Filter by page and query. Pages at position 1–10 with a low click rate need a better title and description; pages at position 11–30 need stronger content and links. Look at <em>Core Web Vitals</em> after about 28 days of data.</li>
        </ol>
        <p className="text-a-muted">Google Business Profile helps local searches such as &quot;PRO services Dubai&quot;: create one for the company address and phone number, and add the website address.</p>
      </section>
    </>
  );
}
