import Image from "next/image";
import Link from "@/app/components/SiteLink";
import { site } from "@/data/site";
import { getServices } from "@/lib/content";
import Icon from "./Icon";

export default async function Footer() {
  const services = await getServices();
  const h = "text-lg font-bold mb-5 text-ink";
  const a = "hover:text-brand-text transition-colors";
  return (
    <footer className="bg-canvas border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="relative w-32 h-12 mb-5">
            <Image src="/logo-black.png" alt={site.name} fill sizes="130px" className="object-contain object-left" />
          </div>
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
          <ul className="flex gap-4">
            {site.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label} className="text-gray-400 hover:text-brand-text transition-colors">
                  <Icon name={s.icon} className="text-lg" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
