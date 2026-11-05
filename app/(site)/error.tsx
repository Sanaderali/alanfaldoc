"use client";

import Link from "next/link";
import { site } from "@/data/site";

/** Shown if a page fails to load. No technical details are shown to visitors. */
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-ink mb-3">Something went wrong on our side</h1>
      <p className="text-gray-600 mb-8">Please try again in a moment. If it keeps happening, call us on <a className="font-semibold text-brand-text" href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a> and we will help you directly.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={reset} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-secondary">Back to Home</Link>
      </div>
    </section>
  );
}
