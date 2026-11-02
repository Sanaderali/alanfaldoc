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
    { icon: "🎓", title: "Company Formation", desc: "Complete mainland and free zone company setup solutions in Dubai and UAE" },
    { icon: "💼", title: "Business Immigration", desc: "Golden visa, residence permits, and work visa processing for business owners" },
    { icon: "✈️", title: "PRO Services", desc: "Professional government documentation and liaison services for all departments" },
    { icon: "👨‍👩‍👧", title: "Document Clearing", desc: "Fast-track approval and attestation services for business documents" },
    { icon: "🏖️", title: "Trade License", desc: "New trade license issuance and annual renewal services across UAE" },
    { icon: "📚", title: "Legal Translation", desc: "Certified translation and attestation for all business documents" },
  ];

  const countries = [
    { name: "CANADA", img: "🇨🇦" },
    { name: "AUSTRALIA", img: "🇦🇺" },
    { name: "SINGAPORE", img: "🇸🇬" },
    { name: "UNITED KINGDOM", img: "🇬🇧" },
    { name: "USA", img: "🇺🇸" },
    { name: "NEW ZEALAND", img: "🇳🇿" },
    { name: "CHINA", img: "🇨🇳" },
  ];

  const faqs = [
    {
      question: "Which payment methods do you accept?",
      answer: "We accept various payment methods including bank transfers, credit cards, and online payment gateways to make the process convenient for our clients."
    },
    {
      question: "What is the registration process?",
      answer: "The registration process begins with an initial consultation, followed by document preparation, submission to relevant authorities, and finally receiving your licenses and permits."
    },
    {
      question: "How can I update or cancel my personal information?",
      answer: "You can update your information by contacting our customer service team directly or through your client portal. Cancellation policies vary based on the stage of your application."
    },
    {
      question: "Does your firm offer a money-back guarantee?",
      answer: "Yes, we offer a money-back guarantee if we're unable to secure approvals due to our service issues. Terms and conditions apply based on the specific service package."
    },
    {
      question: "How long does it take to get approval for business setup?",
      answer: "Approval timeframes vary: free zone setups typically take 5-7 working days, while mainland company registrations can take 2-3 weeks depending on the business activity."
    },
  ];

  const testimonials = [
    { name: "Dan Hodges", role: "(USA Students Visa)", text: "An augue in cubilia laoreet undo magna suscipit egestas magna ipsum egestas vitae purus ipsum primis cubilia laoreet augue donec ultrice ligula egestas magna a vitae purus suscipit lectus gestas magna a viverra dolor neque est gravida", img: "👨" },
    { name: "Amelie Peterson", role: "(France Working Visa)", text: "An orci nullam tempor sapien, gravida donec enim ipsum a porta. An augue in cubilia laoreet magna suscipit egestas magna isum vitae purus ipsum primis in cubilia laoreet augue ultrice at ligula egestas magna", img: "👩" },
    { name: "Scott Boxer", role: "(Germany Travel Visa)", text: "An augue cubilia laoreet magna suscipit egestas magna ipsum vitae purus undo ipsum primis in cubilia laoreet augue ultrice ligula egestas magna at suscipit lectus gestas magna viverra dolor", img: "👨‍💼" },
  ];

  return (
    <div className="min-h-screen bg-white">
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center">
              <div className="relative w-28 h-10 sm:w-36 sm:h-12">
                <Image src="/logo-black.png" alt="Al Anfal Doc" fill className="object-contain" priority />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="#home" className="text-gray-800 hover:text-[#ff5722] text-sm font-medium transition-colors">HOME</Link>
              <Link href="#pages" className="text-gray-800 hover:text-[#ff5722] text-sm font-medium transition-colors">PAGES</Link>
              <Link href="#services" className="text-gray-800 hover:text-[#ff5722] text-sm font-medium transition-colors">MEGA MENU</Link>
              <Link href="#link" className="text-gray-800 hover:text-[#ff5722] text-sm font-medium transition-colors">SIMPLE LINK</Link>
              <Link href="#consultation" className="px-5 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded hover:bg-[#e64a19] transition-all uppercase">
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
                <Link href="#home" className="text-gray-800 hover:text-[#ff5722] font-medium">HOME</Link>
                <Link href="#pages" className="text-gray-800 hover:text-[#ff5722] font-medium">PAGES</Link>
                <Link href="#services" className="text-gray-800 hover:text-[#ff5722] font-medium">MEGA MENU</Link>
                <Link href="#link" className="text-gray-800 hover:text-[#ff5722] font-medium">SIMPLE LINK</Link>
                <Link href="#consultation" className="px-5 py-2.5 bg-[#ff5722] text-white font-semibold rounded text-center">GET CONSULTATION</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 sm:py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/hero-team.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm sm:text-base mb-4">We have 20+ years experience in</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              IMMIGRATION AND<br />VISA CONSULTATION
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto mb-8 px-4">
              Feugiat primis ligula risus auctor egestas augue mauri viverra tortor in iaculis and placerat purus feugiat primis ultrice in ligula impedit magna purus pretium neque ligula an ipsum volute turpis quaerat auctor and rhoncus laoreet augue in cubilia augue
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm mb-10">
              <span className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Goverment Approved
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No Hidden Costs
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Secure Online Form
              </span>
            </div>
          </div>

          {/* Consultation Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6 sm:p-8">
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" placeholder="Enter Your Name*" className="px-4 py-3 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-[#ff5722] focus:border-transparent" />
              <input type="email" placeholder="Enter Your Email*" className="px-4 py-3 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-[#ff5722] focus:border-transparent" />
              <select className="px-4 py-3 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-[#ff5722] focus:border-transparent">
                <option>Visa Type</option>
                <option>Company Formation</option>
                <option>Business Immigration</option>
                <option>PRO Services</option>
                <option>Trade License</option>
                <option>Document Clearing</option>
              </select>
              <button type="submit" className="px-6 py-3 bg-[#ff5722] text-white font-semibold rounded hover:bg-[#e64a19] transition-all uppercase text-sm">
                SEND REQUEST
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[300px] sm:h-[400px] rounded-lg overflow-hidden">
              <Image src="/hero-team.jpg" alt="About Us" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff5722] ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <span className="text-[#ff5722] font-semibold text-sm uppercase tracking-wide">ABOUT AGENCY</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6">
                Get guarantee success with our advisors
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Semper lacus cursus porta, feugiat primis ligula risus auctor and rhoncus in ultrice ligula purus ipsum primis in cubilia augue vitae laoreet augue in cubilia augue egestas an ipsum turpis
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Cursus risus laoreet auctor, varius augue. Nulla dolor and sapien risus nec, luctus mauris donec diam sapien neque in cubilia an ligula quaerat ipsum volute turpis sodales sapien vitae donec an ipsum porta justo integer at velna vitae auctor a magna risus
              </p>
              <Link href="#" className="inline-block px-8 py-3 border-2 border-gray-800 text-gray-900 font-semibold rounded hover:bg-gray-800 hover:text-white transition-all uppercase text-sm">
                DISCOVER MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ImmiEx Immigration Services
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-8 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">{service.desc}</p>
                <Link href="#" className="text-gray-500 hover:text-[#ff5722] text-sm font-medium transition-colors">
                  READ MORE ›
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Immigration Opportunities */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Immigration Opportunities
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {countries.slice(0, 7).map((country, index) => (
              <div key={index} className="relative h-32 sm:h-40 rounded-lg overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl">{country.img}</div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <h3 className="text-white font-bold text-sm sm:text-base">{country.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-sm uppercase tracking-wide mb-2 text-blue-200">CONSULTATIONS FOR PROSPECTIVE IMMIGRANTS</h3>
              <p className="text-gray-200 text-sm">Aliquam a augue suscipit, luctus neque purus ipsum neque dolor primis libero tempus, and blandit ligula varius</p>
            </div>
            <Link href="#" className="px-8 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-900 transition-all uppercase text-sm whitespace-nowrap">
              GET CONSULTATION
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ImmiEx?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center bg-white p-6 sm:p-8 rounded-lg">
              <div className="text-4xl sm:text-5xl mb-3">🎓</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#ff5722] mb-2">820+</div>
              <div className="text-gray-600 text-sm">Students</div>
            </div>
            <div className="text-center bg-white p-6 sm:p-8 rounded-lg">
              <div className="text-4xl sm:text-5xl mb-3">🏛️</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#ff5722] mb-2">127</div>
              <div className="text-gray-600 text-sm">Universities</div>
            </div>
            <div className="text-center bg-white p-6 sm:p-8 rounded-lg">
              <div className="text-4xl sm:text-5xl mb-3">🌍</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#ff5722] mb-2">81</div>
              <div className="text-gray-600 text-sm">Countries</div>
            </div>
            <div className="text-center bg-white p-6 sm:p-8 rounded-lg">
              <div className="text-4xl sm:text-5xl mb-3">💼</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#ff5722] mb-2">969</div>
              <div className="text-gray-600 text-sm">Immigrations</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Have Questions? Look Here
            </h2>
            <p className="text-gray-600">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded overflow-hidden border border-gray-200">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">{index + 1}. {faq.question}</span>
                  <span className="text-2xl text-gray-400 flex-shrink-0">{activeAccordion === index ? '−' : '+'}</span>
                </button>
                {activeAccordion === index && (
                  <div className="px-6 pb-4">
                    <ul className="space-y-2 text-gray-600 text-sm leading-relaxed">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                        <span>{faq.answer}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Still have a question? <Link href="#" className="text-blue-600 hover:underline font-medium">Ask your question here</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Success Stories...
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-2xl mr-4">{testimonial.img}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic leading-relaxed">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Free Immigration & Visa Consultation
          </h2>
          <p className="text-gray-300 mb-6 max-w-3xl mx-auto text-sm sm:text-base">
            Aliquam a augue suscipit, luctus neque purus ipsum neque dolor primis libero tempus, and blandit posuere ligula varius magna congue cursus porta ultrice
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-sm sm:text-base">Call : <span className="font-bold text-lg">+12 9 8765 4321</span></span>
            <Link href="#" className="px-8 py-3 bg-[#ff5722] text-white font-semibold rounded hover:bg-[#e64a19] transition-all uppercase text-sm">
              GET CONSULTATION
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {/* Company Info */}
            <div>
              <div className="relative w-32 h-12 mb-6">
                <Image src="/logo-black.png" alt="Al Anfal Doc" fill className="object-contain" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Aliquam orci a nullam tempor undo sapien donec gravida an enim ipsum porta justo velna auctor and congue magna laoreet an augue sapien
              </p>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-gray-900">Contact Details</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li>121 King Street, Melbourne,<br />Victoria 3000 Australia</li>
                <li>Phone: +12 9 8765 4321</li>
                <li>Email: <a href="mailto:hello@demo.com" className="hover:text-[#ff5722]">hello@demo.com</a></li>
                <li className="pt-2">
                  Mon-Fri: 9:00AM - 6:30PM<br />
                  Saturday: 8:30AM - 3:30PM<br />
                  Sunday: Closed
                </li>
              </ul>
            </div>

            {/* Useful Links */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-gray-900">Useful Links</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">About ImmiEx</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Visa Information</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Immigration FAQ</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Immigration Assistance</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">ImmiEx Testimonials</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Terms and Conditions</Link></li>
              </ul>
            </div>

            {/* Visas */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-gray-900">Visas</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Visitor Visas</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Permanent Residence Visas</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Business Visas</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Working Holiday Visas</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Studying & Training Visas</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Skilled Work Visas</Link></li>
                <li><Link href="#" className="hover:text-[#ff5722] transition-colors">Family & Partner Visas</Link></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © Copyright <span className="font-semibold text-gray-900">ImmiEx 2019</span>. All Rights Reserved
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#ff5722] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
