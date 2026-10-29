"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { icon: "🏢", title: "Company Formation", desc: "Mainland & Free Zone company setup in Dubai" },
    { icon: "📋", title: "PRO Services", desc: "Complete government documentation assistance" },
    { icon: "✈️", title: "Visa Processing", desc: "UAE residence & Golden Visa services" },
    { icon: "📄", title: "Document Clearing", desc: "Fast-track government approvals" },
    { icon: "🏛️", title: "Trade License", desc: "New license & renewal services" },
    { icon: "⚖️", title: "Legal Services", desc: "Translation & attestation services" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Animated Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-md py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo - Larger Size */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className={`relative transition-all duration-500 ${scrolled ? 'w-24 h-24' : 'w-32 h-32'} sm:${scrolled ? 'w-28 h-28' : 'w-36 h-36'}`}>
                <Image
                  src="/logo-black.png"
                  alt="Al Anfal Doc"
                  fill
                  className="object-contain transform group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="#home" className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-200 relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#services" className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-200 relative group">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-200 relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-200 relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="#get-started"
                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Get Started →
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 animate-slide-down">
              <nav className="flex flex-col space-y-4">
                <Link href="#home" className="text-gray-700 hover:text-gray-900 font-medium py-2">Home</Link>
                <Link href="#services" className="text-gray-700 hover:text-gray-900 font-medium py-2">Services</Link>
                <Link href="#about" className="text-gray-700 hover:text-gray-900 font-medium py-2">About</Link>
                <Link href="#contact" className="text-gray-700 hover:text-gray-900 font-medium py-2">Contact</Link>
                <Link href="#get-started" className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-full text-center hover:bg-gray-800">
                  Get Started →
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-48 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Trusted Partner for<br />
              <span className="text-gray-600">Dubai Business Setup</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Complete solutions for company formation, PRO services, visa processing, and document clearing in UAE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="#services" className="px-10 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg">
                Explore Services
              </Link>
              <Link href="#contact" className="px-10 py-4 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-900 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 text-lg">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive business setup and corporate services tailored for Dubai & UAE
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-900 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Ready to Start Your Business in Dubai?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Get expert guidance and fast-track your business setup process with our professional team
          </p>
          <Link
            href="#contact"
            className="inline-block px-12 py-5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>

      {/* Professional White Footer */}
      <footer className="bg-white border-t-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info with Larger Logo */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-32 h-32">
                  <Image
                    src="/logo-black.png"
                    alt="Al Anfal Doc"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed text-lg">
                Your trusted partner for Dubai business setup, corporate services, PRO services, visa processing, and document clearing in UAE.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110 text-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110 text-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110 text-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Our Services</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Client Portal</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Our Services</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Company Formation</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">PRO Services</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Visa Processing</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Document Clearing</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t-2 border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Al Anfal Doc. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
