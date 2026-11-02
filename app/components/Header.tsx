"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollThreshold = windowHeight * 0.2;
      setScrolled(scrollPosition > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-600 gap-2">
            <div className="flex items-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Business Bay, Dubai, UAE</span>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <span className="flex items-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +971 50 123 4567
              </span>
              <span className="hidden md:flex items-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@alanfaldoc.com
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-xl py-2' : 'shadow-sm py-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-all duration-500 ${scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'}`}>
            <Link href="/" className="flex items-center">
              <div className={`relative transition-all duration-500 ${scrolled ? 'w-24 h-8 sm:w-32 sm:h-10' : 'w-28 h-10 sm:w-36 sm:h-12'}`}>
                <Image src="/logo-black.png" alt="Al Anfal Doc" fill className="object-contain" priority />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-800 hover:text-[#ff5722] text-sm font-medium transition-colors">HOME</Link>
              <Link href="/services" className="text-gray-800 hover:text-[#ff5722] text-sm font-medium transition-colors">SERVICES</Link>
              <Link href="#about" className="text-gray-800 hover:text-[#ff5722] text-sm font-medium transition-colors">ABOUT</Link>
              <Link href="#contact" className="text-gray-800 hover:text-[#ff5722] text-sm font-medium transition-colors">CONTACT</Link>
              <Link href="#consultation" className="px-5 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded hover:bg-[#e64a19] hover:shadow-lg hover:scale-105 transition-all duration-300 uppercase">
                GET CONSULTATION
              </Link>
            </nav>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-3 pt-4">
                <Link href="/" className="text-gray-800 hover:text-[#ff5722] font-medium">HOME</Link>
                <Link href="/services" className="text-gray-800 hover:text-[#ff5722] font-medium">SERVICES</Link>
                <Link href="#about" className="text-gray-800 hover:text-[#ff5722] font-medium">ABOUT</Link>
                <Link href="#contact" className="text-gray-800 hover:text-[#ff5722] font-medium">CONTACT</Link>
                <Link href="#consultation" className="px-5 py-2.5 bg-[#ff5722] text-white font-semibold rounded text-center">GET CONSULTATION</Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
