import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { getServices } from "@/lib/content";

const social: Record<string, string> = {
  Facebook: "M22.675 0h-21.35C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.324V1.325C24 .593 23.407 0 22.675 0z",
  "X (Twitter)": "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  Instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.012 3.584-.069 4.849c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.013-3.583.07-4.849C2.38 3.924 3.894 2.38 7.151 2.233 8.416 2.175 8.796 2.163 12 2.163zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  LinkedIn: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.125 2.062 2.062 0 010 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z",
};

export default async function Footer() {
  const services = await getServices();
  const h = "text-lg font-bold mb-5 text-gray-900";
  const a = "hover:text-[#ff5722] transition-colors";
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
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
            <li>{site.address}</li>
            <li>Phone: <a href={`tel:${site.phone.replace(/\s/g, "")}`} className={a}>{site.phone}</a></li>
            <li>Email: <a href={`mailto:${site.email}`} className={a}>{site.email}</a></li>
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
            <li><Link href="/contact" className={a}>Contact Us</Link></li>
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
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} <strong>{site.name}</strong>. All Rights Reserved</p>
          <ul className="flex gap-4">
            {site.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label} className="text-gray-400 hover:text-[#ff5722] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={social[s.label]} /></svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
