"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/app/components/SiteLink";
import Icon from "@/app/components/Icon";
import { site } from "@/data/site";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    question: "",
    message: "",
  });

  const [state, setState] = useState<{ sending: boolean; ok?: number; error?: string }>({ sending: false });
  const [trap, setTrap] = useState("");
  const opened = useRef(0);
  useEffect(() => { opened.current = Date.now(); }, []);

  /** Sends the message to /api/contact, where it becomes a support ticket for the team. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ sending: true });
    const topics: Record<string, string> = { "company-formation": "Company Formation", "visa-services": "Visa Services", "pro-services": "PRO Services", "document-clearing": "Document Clearing", "trade-license": "Trade License", other: "Other Services" };
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, question: topics[formData.question] ?? "General enquiry", website: trap, t: opened.current }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Something went wrong. Please try again.");
      setState({ sending: false, ok: d.number });
      setFormData({ name: "", email: "", question: "", message: "" });
    } catch (x) {
      setState({ sending: false, error: (x as Error).message });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Breadcrumb */}
      <section className="bg-brand text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-white/90 hover:text-white hover:underline transition-colors">
              [ Home ]
            </Link>
            <span className="mx-2 text-white/60">»</span>
            <span>Contact Us</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-ink mb-6">
              Have Questions? Get in Touch
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Tell us what you need help with and our team will reply by email or phone as soon as possible. You can also message us on WhatsApp or call during office hours.</p>
          </div>

          {/* Contact Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {/* Location Card */}
              <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mr-6">
                    <Icon name="location-dot" className="text-2xl text-brand-text" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink mb-2">
                      {site.address}
                    </h2>
                    <p className="text-gray-500 text-sm">Our Location</p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mr-6">
                    <Icon name="phone" className="text-2xl text-brand-text" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink mb-2">
                      <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-brand-text transition-colors">{site.phone}</a>
                    </h2>
                    <p className="text-gray-500 text-sm">Let's Talk</p>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mr-6">
                    <Icon name="envelope" className="text-2xl text-brand-text" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink mb-2">
                      <a href={`mailto:${site.email}`} className="hover:text-brand-text transition-colors">{site.email}</a>
                    </h2>
                    <p className="text-gray-500 text-sm">Drop a Line</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg p-8 shadow-md border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />
                {state.ok !== undefined && <p role="status" className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-text text-sm font-medium">Thank you! Your message was sent{state.ok ? ` (ticket #${state.ok})` : ""}. Our team will get back to you as soon as possible.</p>}
                {state.error && <p role="alert" className="p-4 rounded-xl bg-accent-50 border border-accent-100 text-accent text-sm font-medium">{state.error}</p>}
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter Your Name*"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-canvas border border-gray-200 rounded focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-ink"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Your Email*"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-canvas border border-gray-200 rounded focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-ink"
                  />
                </div>

                <div>
                  <select
                    aria-label="Your question is about"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-canvas border border-gray-200 rounded focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-gray-700"
                  >
                    <option value="">Your Question About..</option>
                    <option value="company-formation">Company Formation</option>
                    <option value="visa-services">Visa Services</option>
                    <option value="pro-services">PRO Services</option>
                    <option value="document-clearing">Document Clearing</option>
                    <option value="trade-license">Trade License</option>
                    <option value="other">Other Services</option>
                  </select>
                </div>

                <div>
                  <textarea
                    name="message"
                    placeholder="Your Message ..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-canvas border border-gray-200 rounded focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-ink resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                >
                  SEND YOUR MESSAGE
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 md:h-[500px] relative">
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 text-brand-text"><Icon name="map-location-dot" /></div>
            <p className="text-gray-600 font-semibold text-lg">Interactive Map</p>
            <p className="text-gray-500 text-sm mt-2">
              {site.address}
            </p>
          </div>
        </div>
        {/* You can integrate Google Maps or other map service here */}
        <iframe
          src="https://www.google.com/maps?q=Dubai%2C%20United%20Arab%20Emirates&output=embed" title="Map of Dubai, UAE"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        ></iframe>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-canvas border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-ink mb-2">
                  Stay Always In Touch
                </h2>
                <p className="text-gray-600">
                  Subscribe to our newsletter for latest updates
                </p>
              </div>
              <div className="flex-1 max-w-md w-full">
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-4 py-3 bg-canvas border border-gray-200 rounded focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-ink"
                  />
                  <button className="btn btn-primary">
                    SUBSCRIBE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
