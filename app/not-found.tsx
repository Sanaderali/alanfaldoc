import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-[#ff5722] mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-600 mb-8">The page you are looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="inline-block px-8 py-3 bg-[#ff5722] text-white font-semibold rounded uppercase text-sm hover:bg-[#e64a19] transition-colors">Back to Home</Link>
    </section>
  );
}
