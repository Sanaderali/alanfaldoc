import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-text mb-4">404</p>
      <h1 className="text-2xl font-bold text-ink mb-3">Page not found</h1>
      <p className="text-gray-600 mb-8">The page you are looking for doesn&apos;t exist or has moved. Try the home page, or <Link href="/contact" className="text-brand-text font-semibold hover:underline">contact our team</Link> and we will point you to the right place.</p>
      <Link href="/" className="btn btn-primary">Back to Home</Link>
    </section>
  );
}
