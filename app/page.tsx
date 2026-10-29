"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 md:w-80 md:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className={`max-w-5xl w-full text-center z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="mb-6 md:mb-10 flex justify-center animate-scale-in">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 transition-transform hover:scale-105 duration-500">
            <Image
              src="/logo.png"
              alt="Al Anfal Doc Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Title with gradient text */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 tracking-tight animate-slide-up px-4">
            Al Anfal Doc
          </h1>
          <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mx-auto rounded-full animate-expand"></div>
        </div>

        {/* Coming Soon Message */}
        <div className="space-y-4 md:space-y-6 mb-10 md:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white/90 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Something Amazing is Coming
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.4s" }}>
            We're crafting an exceptional documentation experience just for you.
            Stay tuned for the launch of something extraordinary.
          </p>
        </div>

        {/* Email Notification Form */}
        <div className="max-w-md mx-auto mb-10 md:mb-16 px-4 animate-slide-up" style={{ animationDelay: "0.6s" }}>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 shadow-2xl border border-white/20 hover:border-white/40 transition-all duration-300">
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
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/90 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-sm sm:text-base"
              />
              <button
                type="submit"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 md:gap-6 mb-8 animate-slide-up px-4" style={{ animationDelay: "0.8s" }}>
          <a
            href="#"
            className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/40 transition-all transform hover:scale-110 hover:-translate-y-1 duration-300"
            aria-label="Twitter"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="#"
            className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/40 transition-all transform hover:scale-110 hover:-translate-y-1 duration-300"
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a
            href="#"
            className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/40 transition-all transform hover:scale-110 hover:-translate-y-1 duration-300"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 text-white/50 text-xs sm:text-sm px-4 animate-slide-up" style={{ animationDelay: "1s" }}>
          <p>&copy; {new Date().getFullYear()} Al Anfal Doc. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
