import Link from "next/link";
import Reveal from "./Reveal";

export default function CTABanner({
  title = "Consultations for prospective clients",
  text = "Talk to our team about your company setup, visa or document needs. We reply fast.",
}: { title?: string; text?: string }) {
  return (
    <section className="bg-gradient-to-r from-brand-50 to-canvas text-ink border-y border-gray-200">
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{title}</h2>
          <p className="text-gray-600">{text}</p>
        </div>
        <Link
          href="/contact"
          className="btn btn-cta btn-lg"
        >
          Get Consultation
        </Link>
      </Reveal>
    </section>
  );
}
