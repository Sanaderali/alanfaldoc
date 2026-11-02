"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const services = [
    { icon: "🏢", title: "Company Formation", desc: "Complete mainland and free zone company setup solutions in Dubai and UAE" },
    { icon: "📋", title: "Business Immigration", desc: "Golden visa, residence permits, and work visa processing for business owners" },
    { icon: "✈️", title: "PRO Services", desc: "Professional government documentation and liaison services for all departments" },
    { icon: "📄", title: "Document Clearing", desc: "Fast-track approval and attestation services for business documents" },
    { icon: "🏛️", title: "Trade License", desc: "New trade license issuance and annual renewal services across UAE" },
    { icon: "⚖️", title: "Legal Translation", desc: "Certified translation and attestation for all business documents" },
  ];

  const countries = [
    { name: "UAE", flag: "🇦🇪" },
    { name: "Dubai", flag: "🏙️" },
    { name: "Abu Dhabi", flag: "🏛️" },
    { name: "Sharjah", flag: "🌆" },
    { name: "Ajman", flag: "🏢" },
    { name: "RAK", flag: "⛰️" },
  ];

  const faqs = [
    {
      question: "How long does it take to set up a company in Dubai?",
      answer: "Company formation in Dubai typically takes 5-7 working days for free zones and 2-3 weeks for mainland companies, depending on the business activity and documentation."
    },
    {
      question: "What documents are required for company registration?",
      answer: "Required documents include passport copies, visa copies, business plan, NOC from sponsor (if applicable), and proof of address. Additional documents may be needed based on your business activity."
    },
    {
      question: "Do I need a local sponsor for my business?",
      answer: "For mainland companies with certain activities, a UAE national sponsor holding 51% shares was traditionally required. However, recent reforms allow 100% foreign ownership in many sectors. Free zones always allow 100% ownership."
    },
    {
      question: "What are the costs involved in company setup?",
      answer: "Costs vary based on business type, location (mainland vs free zone), office requirements, and visa needs. Free zone packages start from AED 15,000, while mainland setups vary significantly."
    },
    {
      question: "Can you help with visa processing?",
      answer: "Yes, we provide complete visa services including investor visas, employment visas, golden visas, and family sponsorship. Our PRO services handle all immigration procedures."
    },
  ];

  const testimonials = [
    { name: "Mohammed Al Rashid", role: "CEO, Dubai Trade Solutions", text: "Al Anfal Doc made our company formation seamless. Professional service from start to finish!", rating: 5 },
    { name: "Sarah Johnson", role: "Founder, Emirates Consulting", text: "Excellent PRO services. They handled all government procedures efficiently and kept us updated.", rating: 5 },
    { name: "Ahmed Ibrahim", role: "Director, Gulf Ventures", text: "Best document clearing service in Dubai. Fast, reliable, and affordable.", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-[#343f52] text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline">📧 info@alanfaldoc.com</span>
            <span>📞 +971 50 123 4567</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden md:inline">Open Hours: Mon - Sat: 9:00 AM - 6:00 PM</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative w-40 h-16 md:w-48 md:h-20">
                <Image src="/logo-black.png" alt="Al Anfal Doc" fill className="object-contain" priority />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="#home" className="text-gray-700 hover:text-[#343f52] font-medium transition-colors">Home</Link>
              <Link href="#about" className="text-gray-700 hover:text-[#343f52] font-medium transition-colors">About Us</Link>
              <Link href="#services" className="text-gray-700 hover:text-[#343f52] font-medium transition-colors">Services</Link>
              <Link href="#process" className="text-gray-700 hover:text-[#343f52] font-medium transition-colors">Process</Link>
              <Link href="#contact" className="text-gray-700 hover:text-[#343f52] font-medium transition-colors">Contact</Link>
              <Link href="#consultation" className="px-6 py-2.5 bg-[#343f52] text-white font-semibold rounded-md hover:bg-gray-900 transition-all">
                Get Consultation
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-3 pt-4">
                <Link href="#home" className="text-gray-700 hover:text-[#343f52] font-medium">Home</Link>
                <Link href="#about" className="text-gray-700 hover:text-[#343f52] font-medium">About Us</Link>
                <Link href="#services" className="text-gray-700 hover:text-[#343f52] font-medium">Services</Link>
                <Link href="#process" className="text-gray-700 hover:text-[#343f52] font-medium">Process</Link>
                <Link href="#contact" className="text-gray-700 hover:text-[#343f52] font-medium">Contact</Link>
                <Link href="#consultation" className="px-6 py-2.5 bg-[#343f52] text-white font-semibold rounded-md text-center">Get Consultation</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Form */}
      <section id="home" className="relative bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block px-4 py-2 bg-blue-50 text-[#343f52] rounded-full text-sm font-semibold mb-4">
                🏆 20+ Years Experience
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Dubai Business Setup & Document Services
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Expert consultation for company formation, PRO services, visa processing, and complete business solutions in UAE
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#services" className="px-8 py-4 bg-[#343f52] text-white font-semibold rounded-md hover:bg-gray-900 transition-all">
                  Explore Services
                </Link>
                <Link href="#about" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-900 font-semibold rounded-md hover:bg-gray-50 transition-all">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Free Consultation</h3>
              <form className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#343f52] focus:border-transparent" />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#343f52] focus:border-transparent" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#343f52] focus:border-transparent" />
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#343f52] focus:border-transparent">
                  <option>Select Service</option>
                  <option>Company Formation</option>
                  <option>PRO Services</option>
                  <option>Visa Processing</option>
                  <option>Trade License</option>
                  <option>Document Clearing</option>
                </select>
                <textarea placeholder="Your Message" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#343f52] focus:border-transparent"></textarea>
                <button type="submit" className="w-full px-8 py-4 bg-[#343f52] text-white font-semibold rounded-lg hover:bg-gray-900 transition-all">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image src="/hero-team.jpg" alt="About Us" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[#343f52] font-semibold text-sm uppercase tracking-wide">About Al Anfal Doc</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-6">
                Your Trusted Partner for Business Setup in Dubai
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                With over 20 years of experience, Al Anfal Doc has been helping businesses establish and grow in the UAE. We provide comprehensive business setup solutions, PRO services, and visa processing.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span className="text-gray-700">Licensed and certified by UAE authorities</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span className="text-gray-700">1000+ successful company formations</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span className="text-gray-700">Expert PRO services and government liaison</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span className="text-gray-700">Fast visa processing and golden visa assistance</span></li>
              </ul>
              <Link href="#services" className="inline-block px-8 py-3 bg-[#343f52] text-white font-semibold rounded-md hover:bg-gray-900 transition-all">
                Discover More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#343f52] font-semibold text-sm uppercase tracking-wide">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Complete Business Solutions in UAE
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From company formation to visa processing, we handle all your business needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{service.desc}</p>
                <Link href="#contact" className="text-[#343f52] font-semibold hover:underline">Learn More →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Serve Across UAE
            </h2>
            <p className="text-gray-600">Business setup services in all major emirates</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {countries.map((country, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">{country.flag}</div>
                <h4 className="font-semibold text-gray-900">{country.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-[#343f52] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
              <div className="text-gray-300">Companies Formed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-gray-300">Visas Processed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">7</div>
              <div className="text-gray-300">Emirates Covered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">20+</div>
              <div className="text-gray-300">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">Common questions about our services</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className="text-2xl text-gray-500">{activeAccordion === index ? '−' : '+'}</span>
                </button>
                {activeAccordion === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-600">Success stories from our satisfied clients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#343f52] to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Business in Dubai?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Get a free consultation with our business setup experts today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#consultation" className="px-10 py-4 bg-white text-[#343f52] font-semibold rounded-md hover:bg-gray-100 transition-all">
              Get Free Consultation
            </Link>
            <Link href="tel:+971501234567" className="px-10 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-[#343f52] transition-all">
              📞 Call Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <div className="relative w-40 h-16 mb-6">
                <Image src="/logo.png" alt="Al Anfal Doc" fill className="object-contain brightness-0 invert" />
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Your trusted partner for Dubai business setup, PRO services, visa processing, and document clearing in UAE.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#343f52] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.324v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#343f52] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#343f52] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#343f52] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-6">Contact Info</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start">
                  <span className="mr-3">📍</span>
                  <span>Business Bay, Dubai, UAE</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">📞</span>
                  <span>+971 50 123 4567</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">📧</span>
                  <span>info@alanfaldoc.com</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">⏰</span>
                  <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
                </li>
              </ul>
            </div>

            {/* Useful Links */}
            <div>
              <h3 className="text-xl font-bold mb-6">Useful Links</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Our Services</Link></li>
                <li><Link href="#process" className="hover:text-white transition-colors">Process</Link></li>
                <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <h3 className="text-xl font-bold mb-6">Our Services</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Company Formation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Business Immigration</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">PRO Services</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Visa Processing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Trade License</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Document Clearing</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Al Anfal Doc. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
