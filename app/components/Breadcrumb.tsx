import Link from "@/app/components/SiteLink";
import JsonLd from "./JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="bg-brand text-white">
      <JsonLd data={breadcrumbLd(items)} />
      <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-x-2 text-sm">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="text-white/60">»</span>}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="text-white/90 hover:text-white hover:underline transition-colors">
                {i === 0 ? "[ Home ]" : c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
