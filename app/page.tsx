"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 transition-transform group-hover:scale-105 duration-300">
                <Image
                  src="/logo-black.png"
                  alt="Al Anfal Doc"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#home" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200">
                Home
              </Link>
              <Link href="#services" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200">
                Services
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200">
                About Us
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200">
                Contact
              </Link>
              <Link
                href="#get-started"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                Get Started
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
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

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
              <nav className="flex flex-col space-y-4">
                <Link href="#home" className="text-gray-700 hover:text-emerald-600 font-medium py-2 transition-colors">
                  Home
                </Link>
                <Link href="#services" className="text-gray-700 hover:text-emerald-600 font-medium py-2 transition-colors">
                  Services
                </Link>
                <Link href="#about" className="text-gray-700 hover:text-emerald-600 font-medium py-2 transition-colors">
                  About Us
                </Link>
                <Link href="#contact" className="text-gray-700 hover:text-emerald-600 font-medium py-2 transition-colors">
                  Contact
                </Link>
                <Link
                  href="#get-started"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg text-center hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md"
                >
                  Get Started
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Coming Soon Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 md:w-80 md:h-80 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className={`max-w-4xl w-full text-center z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Title */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 tracking-tight animate-slide-up px-4">
              Dubai Business Setup & <span className="text-emerald-600">Document Services</span>
            </h1>
            <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-emerald-500 via-red-500 to-gray-700 mx-auto rounded-full animate-expand"></div>
          </div>

          {/* Coming Soon Message */}
          <div className="space-y-4 md:space-y-6 mb-10 md:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Something Amazing is Coming
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.4s" }}>
              Your trusted partner for company formation, PRO services, visa processing, and document clearing in Dubai, UAE.
            </p>
          </div>

          {/* Email Notification Form */}
          <div className="max-w-md mx-auto mb-10 px-4 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                alert(`Thank you! We'll notify you at ${email} when we launch.`);
                form.reset();
              }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap"
                >
                  Notify Me
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="/logo.png"
                    alt="Al Anfal Doc"
                    fill
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-xl font-bold">Al Anfal Doc</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Your trusted partner for Dubai business setup, corporate services, PRO services, visa processing, and document clearing in UAE.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-all duration-200 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-all duration-200 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-all duration-200 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">Our Services</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">Client Portal</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Services</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">Company Formation</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">PRO Services</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">Visa Processing</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">Document Clearing</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Al Anfal Doc. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-emerald-500 text-sm transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-500 text-sm transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-500 text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
