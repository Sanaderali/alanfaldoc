import Image from "next/image";
import Link from "@/app/components/SiteLink";
import { site } from "@/data/site";
import { getServices, getSocial } from "@/lib/content";
import { platformOf } from "@/lib/social";
import Icon from "./Icon";

export default async function Footer() {
  const [services, social] = await Promise.all([getServices(), getSocial()]);
  const h = "text-lg font-bold mb-5 text-ink";
  const a = "hover:text-brand-text transition-colors";
  return (
    <footer className="bg-canvas border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Image src="/logo-header.png" alt={site.name} width={1000} height={333} sizes="190px" className="h-[56px] w-auto mb-5" />
          <p className="text-gray-600 text-sm leading-relaxed">{site.description}</p>
        </div>

        <div>
          <h3 className={h}>Contact Details</h3>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Icon name="location-dot" className="text-brand-text mr-2" />{site.address}</li>
            <li><Icon name="phone" className="text-brand-text mr-2" /><a href={`tel:${site.phone.replace(/\s/g, "")}`} className={a}>{site.phone}</a></li>
            <li><Icon name="envelope" className="text-brand-text mr-2" /><a href={`mailto:${site.email}`} className={a}>{site.email}</a></li>
            <li className="pt-2">{site.hours.map((x) => <span key={x} className="block">{x}</span>)}</li>
          </ul>
        </div>

        <div>
          <h3 className={h}>Useful Links</h3>
          <ul className="space-y-2.5 text-gray-600 text-sm">
            <li><Link href="/about" className={a}>About Us</Link></li>
            <li><Link href="/services" className={a}>Our Services</Link></li>
            <li><Link href="/countries" className={a}>Countries</Link></li>
            <li><Link href="/blog" className={a}>Blog</Link></li>
            <li><Link href="/faqs" className={a}>FAQs</Link></li>
            <li><Link href="/contact" className={a}>Contact Us</Link></li>
            <li><Link href="/sitemap" className={a}>Sitemap</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={h}>Services</h3>
          <ul className="space-y-2.5 text-gray-600 text-sm">
            {services.slice(0, 7).map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className={a}>{s.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} <strong>{site.name}</strong>. All Rights Reserved<span className="mx-2 text-gray-300" aria-hidden="true">|</span><Link href="/sitemap" className={a}>Sitemap</Link></p>
          {social.length > 0 && (
            <ul className="flex gap-3">
              {social.map((x) => { const p = platformOf(x.platform); return p ? (
                <li key={x.url}>
                  <a href={x.url} target="_blank" rel="noopener noreferrer" aria-label={p.label} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-brand hover:border-brand hover:text-white transition-colors">
                    <Icon name={p.icon} fixedWidth={false} />
                  </a>
                </li>) : null; })}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
