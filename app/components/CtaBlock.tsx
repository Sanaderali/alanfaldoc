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
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 w-full ${variant === "banner" ? "lg:max-w-3xl lg:mx-auto" : ""}`}>
      {(wa || site.phone) && (
        <a href={waLink(wa?.number ?? site.phone.replace(/\D/g, ""), message)} target="_blank" rel="noopener noreferrer" className="btn btn-wa w-full !px-4">
          <Icon name="fa-brands fa-whatsapp" fixedWidth={false} className="mr-2 text-lg" />WhatsApp us
        </a>
      )}
      <Link href="/contact" className="btn btn-cta w-full !px-4">Contact us now</Link>
      <a href={`tel:${site.phone.replace(/\s/g, "")}`} aria-label={`Call ${site.phone}`} className="btn btn-secondary w-full !px-4"><Icon name="phone" fixedWidth={false} className="mr-2" />{variant === "banner" ? `Call ${site.phone}` : "Call us"}</a>
    </div>
  );
  if (variant === "inline") return <div className={`my-6 ${className}`}>{buttons}</div>;
  const heading = title ?? (topic ? `Need help with ${topic}?` : "Talk to our team");
  const body = text ?? "Our advisors reply quickly. Message us on WhatsApp, send a request or call us directly.";
  if (variant === "banner") {
    return (
      <section className={`py-10 md:py-14 ${className}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark text-white text-center px-6 py-10 md:px-12 md:py-12 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{heading}</h2>
            <p className="text-white/85 max-w-2xl mx-auto mb-7">{body}</p>
            {buttons}
          </div>
        </div>
      </section>
    );
  }
  return (
    <aside className={`my-8 rounded-2xl border border-brand/20 bg-brand-50 p-6 md:p-7 text-center sm:text-left ${className}`} aria-label={heading}>
      <h2 className="text-xl font-bold text-ink mb-1">{heading}</h2>
      <p className="text-gray-600 text-sm mb-5">{body}</p>
      {buttons}
    </aside>
  );
}
