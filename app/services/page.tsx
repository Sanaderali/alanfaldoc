"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ServicesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const services = [
    {
      title: "Company Formation",
      desc: "Complete mainland and free zone company setup solutions in Dubai and UAE with full legal support",
    },
    {
      title: "Business Immigration",
      desc: "Golden visa, residence permits, and work visa processing for business owners and investors",
    },
    {
      title: "PRO Services",
      desc: "Professional government documentation and liaison services for all UAE departments",
    },
    {
      title: "Document Clearing",
      desc: "Fast-track approval and attestation services for all types of business documents",
    },
    {
      title: "Trade License",
      desc: "New trade license issuance and annual renewal services across all UAE emirates",
    },
    {
      title: "Visa Processing",
      desc: "Employment visas, family visas, tourist visas, and golden visa application services",
    },
    {
      title: "Legal Translation",
      desc: "Certified translation and attestation services for legal and business documents",
    },
    {
      title: "Bank Account Opening",
      desc: "Corporate and personal bank account opening assistance with major UAE banks",
    },
    {
      title: "Business Consulting",
      desc: "Expert consultation on UAE business regulations, compliance, and growth strategies",
    },
  ];

  const countries = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "RAK",
    "Fujairah",
  ];

  const practiceAreas = [
    "Company Formation",
    "PRO Services",
    "Visa Processing",
    "Document Clearing",
    "Trade License",
    "Legal Services",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <section className="bg-[#3d4d6a] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-[#ff5722] transition-colors">
              [ Home ]
            </Link>
            <span className="mx-2">»</span>
            <span>Service Categories</span>
          </div>
        </div>
      </section>

      {/* Page Title */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Al Anfal Doc Service Categories
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service, index) => (
              <div
                key={index}
                className={`bg-white border border-gray-200 rounded-lg p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-slide-up stagger-${(index % 6) + 1} group`}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#ff5722] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  {service.desc}
                </p>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-[#ff5722] text-sm font-medium transition-all inline-flex items-center group-hover:gap-2 uppercase"
                >
                  READ MORE
                  <span className="inline-block group-hover:translate-x-1 transition-transform ml-1">
                    ›
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center transform hover:scale-110 transition-all duration-500">
              <div className="text-5xl mb-4">🎓</div>
              <div className="text-5xl font-bold text-[#ff5722] mb-2">820+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-all duration-500">
              <div className="text-5xl mb-4">🏛️</div>
              <div className="text-5xl font-bold text-[#ff5722] mb-2">127</div>
              <div className="text-gray-600">Universities</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-all duration-500">
              <div className="text-5xl mb-4">🌍</div>
              <div className="text-5xl font-bold text-[#ff5722] mb-2">81</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-all duration-500">
              <div className="text-5xl mb-4">👥</div>
              <div className="text-5xl font-bold text-[#ff5722] mb-2">969</div>
              <div className="text-gray-600">Immigrations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Consultant Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find a consultant by:
            </h2>
            <p className="text-gray-600 max-w-3xl">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Country */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Emirate:</h3>
                <ul className="space-y-2">
                  {countries.map((country, index) => (
                    <li key={index}>
                      <Link
                        href="#"
                        className="text-gray-600 hover:text-[#ff5722] transition-colors text-sm"
                      >
                        {country}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:text-[#ff5722] font-semibold transition-colors text-sm inline-flex items-center"
                    >
                      View All <span className="ml-1">›</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Practice Area */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Practice Area:</h3>
                <ul className="space-y-2">
                  {practiceAreas.map((area, index) => (
                    <li key={index}>
                      <Link
                        href="#"
                        className="text-gray-600 hover:text-[#ff5722] transition-colors text-sm"
                      >
                        {area}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="#"
                      className="text-blue-600 hover:text-[#ff5722] font-semibold transition-colors text-sm inline-flex items-center"
                    >
                      View All <span className="ml-1">›</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center h-80 border border-gray-200">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-600 font-semibold">UAE Coverage Map</p>
                <p className="text-gray-500 text-sm mt-2">
                  We serve clients across all seven emirates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Consultations for prospective immigrants
              </h3>
              <p className="text-blue-100">
                Aliquam a augue suscipit, luctus neque purus ipsum neque dolor primis libero tempus, and blandit ligula varius
              </p>
            </div>
            <Link
              href="#consultation"
              className="px-8 py-4 bg-[#ff5722] text-white font-semibold rounded hover:bg-[#e64a19] hover:shadow-lg hover:scale-105 transition-all duration-300 uppercase text-sm whitespace-nowrap"
            >
              GET CONSULTATION
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
