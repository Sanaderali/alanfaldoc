import Link from "@/app/components/SiteLink";
import Icon from "./Icon";
import { site } from "@/data/site";
import { getWhatsApp, waLink } from "@/lib/content";

/**
 * Call-to-action block with 3 buttons: WhatsApp, Contact us and Call.
 * variant "inline" = just the buttons, "card" = tinted box with a heading, "banner" = full-width strip.
 * `topic` (e.g. "Punjab") is added to the pre-filled WhatsApp message.
 */
export default async function CtaBlock({ topic, title, text, variant = "card", className = "" }: { topic?: string; title?: string; text?: string; variant?: "inline" | "card" | "banner"; className?: string }) {
  const numbers = await getWhatsApp();
  const wa = numbers[0];
  const message = wa?.message || `Hello Al Anfal Doc, I would like help${topic ? ` with ${topic}` : ""}.`;
  const buttons = (
    <div className="flex flex-wrap gap-3">
      {(wa || site.phone) && (
        <a href={waLink(wa?.number ?? site.phone.replace(/\D/g, ""), message)} target="_blank" rel="noopener noreferrer" className="btn btn-sm !bg-[#25D366] !text-white hover:!bg-[#1ebe5b] !border-transparent">
          <Icon name="fa-brands fa-whatsapp" fixedWidth={false} className="mr-2 text-lg" />WhatsApp us
        </a>
      )}
      <Link href="/contact" className="btn btn-cta btn-sm">Contact us</Link>
      <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="btn btn-secondary btn-sm"><Icon name="phone" fixedWidth={false} className="mr-2" />Call {site.phone}</a>
    </div>
  );
  if (variant === "inline") return <div className={`my-6 ${className}`}>{buttons}</div>;
  const heading = title ?? (topic ? `Need help with ${topic}?` : "Talk to our team");
  const body = text ?? "Our advisors reply quickly. Message us on WhatsApp, send a request or call us directly.";
  if (variant === "banner") {
    return (
      <section className={`bg-gradient-to-r from-brand-50 to-canvas border-y border-gray-200 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left"><h2 className="text-2xl font-bold text-ink mb-1">{heading}</h2><p className="text-gray-600">{body}</p></div>
          {buttons}
        </div>
      </section>
    );
  }
  return (
    <aside className={`my-8 rounded-2xl border border-brand/20 bg-brand-50 p-6 ${className}`} aria-label={heading}>
      <h2 className="text-xl font-bold text-ink mb-1">{heading}</h2>
      <p className="text-gray-600 text-sm mb-4">{body}</p>
      {buttons}
    </aside>
  );
}
