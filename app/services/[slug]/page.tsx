"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ServiceDetailPage() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(2);

  const visaCategories = [
    { title: "Education Visa", link: "#" },
    { title: "Skilled Worker Visa", link: "#" },
    { title: "Work Permit Visa", link: "#" },
    { title: "PR and Migrate Visa", link: "#" },
    { title: "Business Visa", link: "#" },
    { title: "Spouse/Family Visas", link: "#" },
    { title: "Tourist & Visitor Visas", link: "#" },
    { title: "Working Holiday Visas", link: "#" },
  ];

  const countries = [
    { name: "Canada", image: "🇨🇦" },
    { name: "United Kingdom", image: "🇬🇧" },
    { name: "United States of America", image: "🇺🇸" },
  ];

  const latestPosts = [
    { date: "18 hours ago", category: "Immigration Visa", title: "Ways to move to Denmark", excerpt: "Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat felis..." },
    { date: "Dec 02, 2019", category: "Working Visa", title: "Schengen Countries to begin New Visa Sticker from 21st December", excerpt: "Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat felis..." },
    { date: "Nov 26, 2019", category: "Travel Visa", title: "4 Destinations for a Family Holiday in Portugal 2020", excerpt: "Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat felis..." },
  ];

  const relatedServices = [
    { title: "Business Immigration", desc: "Porta semper lacus cursus a feugiat primis an ultrice dolor undo congue placerat" },
    { title: "Skilled Immigration", desc: "Porta semper lacus cursus a feugiat primis an ultrice dolor undo congue placerat" },
    { title: "Spouse/Family Visas", desc: "Porta semper lacus cursus a feugiat primis an ultrice dolor undo congue placerat" },
    { title: "Tourist & Visitor Visas", desc: "Porta semper lacus cursus a feugiat primis an ultrice dolor undo congue placerat" },
    { title: "Resident Return Visas", desc: "Porta semper lacus cursus a feugiat primis an ultrice dolor undo congue placerat" },
    { title: "Working Holiday Visas", desc: "Porta semper lacus cursus a feugiat primis an ultrice dolor undo congue placerat" },
  ];

  const faqs = [
    { question: "Which payment methods do you accept?", answer: "We accept various payment methods including bank transfers, credit cards, and online payment gateways." },
    { question: "What is the registration process?", answer: "The registration process begins with an initial consultation, document preparation, and submission." },
    { question: "How can I update or cancel my personal information?", answer: "Nullam rutrum eget nunc varius etiam mollis risus congue aliquam etiam sapien egestas, congue gestas posuere cubilia congue ipsum mauris lectus laoreet gestas neque vitae auctor eros dolor luctus odio placerat magna cursus" },
    { question: "Does your immigration firm offer a money-back guarantee?", answer: "Yes, we offer a money-back guarantee if we're unable to secure approvals due to our service issues." },
    { question: "How long does it take to get a travel visa to Australia?", answer: "Processing times vary depending on visa type, typically ranging from 2-4 weeks." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <section className="bg-[#3d4d6a] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-[#ff5722] transition-colors">[ Home ]</Link>
            <span className="mx-2">»</span>
            <Link href="/services" className="hover:text-[#ff5722] transition-colors">Visa Categories</Link>
            <span className="mx-2">»</span>
            <span>Tourist Visa</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Australia Visitor Visa (Subclass600)
              </h1>

              <p className="text-gray-600 leading-relaxed mb-6">
                Aliqum mullam blandit tempor sapien gravida donec ipsum, at porta justo. Velna vitae and congue auctor magna nihil impedit ligula risus. Mauris donec ociis et magnis sapien etiam sapien sagittis congue tempor gravida donec enim ipsum porta justo integer at odio velna placerat purus, aliquet elementum massa mollis risus lectus porta rutrum magna dignissim, porttitor hendrerit
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Vitae auctor integer congue magna at pretium</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Integer congue magna at pretium purus pretium ligula rutrum luctus risus eros dolor auctor ipsum blandit purus vehicula magna luctus tempor. Quisque vel laoreet turpis urna augue</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Sagittis congue augue egestas volutpat egestas magna donec ociis et magnis</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Egestas magna ipsum vitae purus efficitur ipsum cubilia and laoreet pretium</span>
                </li>
              </ul>

              {/* Image */}
              <div className="bg-gray-100 rounded-lg p-8 mb-8 text-center">
                <div className="text-6xl mb-4">🇦🇺</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AUSTRALIA</h3>
                <p className="text-[#ff5722] font-semibold">Great Destination to Study and Live</p>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">
                Maecenas gravida porttitor nunc vehicula magna luctus tempor. Quisque laoreet turpis at augue, viverra a augue eget, dictum tempor diam. Pulvinar consectetur vehicula imperdiet varius viverra. Pellentesque ac massa lorem. Fusce eu cursus non nulla vitae massa dictum tempor diam. Fusce eu cursus est nulla vitae massa placerat vulputate
              </p>

              {/* Documents Section */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Documents for Australia visa application
              </h2>
              <ul className="space-y-2 mb-8">
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Tempor magna ipsum vitae purus primis pretium</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>An magnis nulla dolor sapien augue erat iaculis</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Pretium ligula rutrum luctus blandit porta justo</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Feugiat a primis ultrice ligula risus auctor rhoncus purus ipsum primis</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Sapien undo pretium purus ligula tempus ipsum</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="text-[#ff5722] mr-2 mt-1">•</span>
                  <span>Quaerat sodales sapien undo euismod purus and blandit (Luctus Blandit Porta)</span>
                </li>
              </ul>

              {/* Additional Documents */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Additional Documents
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Quisque laoreet turpis urna augue, viverra a augue eget, dictum tempor diam. Pulvinar vehicula vel imperdiet varius viverra. Pellentesque ac massa lorem. Nihil vel imperdiet dui varius viverra. Fusce eu cursus est nulla
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">If the applicant is employed:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Tempor magna ipsum vitae purus primis pretium</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>An magnis nulla dolor sapien augue erat iaculis</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Pretium ligula rutrum luctus blandit porta justo</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Feugiat a primis ultrice ligula risus auctor rhoncus purus ipsum primis</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Sapien undo pretium purus ligula tempus ipsum</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Quaerat sodales sapien undo euismod purus and blandit (Luctus Blandit Porta)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">If the applicant has a family in Australia:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Feugiat a primis ultrice ligula risus auctor rhoncus purus ipsum primis</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Sapien undo pretium purus ligula tempus ipsum</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Quaerat sodales sapien undo euismod purus and blandit (Luctus Blandit Porta)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">If the applicant is Student:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>An magnis nulla dolor sapien augue erat iaculis</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Pretium ligula rutrum luctus blandit porta justo</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Feugiat a primis ultrice ligula risus auctor rhoncus purus ipsum primis</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">If the applicant is intending to stay more than 3 months:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Tempor magna ipsum vitae purus primis pretium</span>
                    </li>
                    <li className="flex items-start text-gray-700">
                      <span className="text-[#ff5722] mr-2 mt-1">•</span>
                      <span>Quaerat sodales sapien undo euismod purus and blandit (Luctus Blandit Porta)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              {/* Visa Categories */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Visa Categories:</h3>
                <ul className="space-y-3">
                  {visaCategories.map((category, index) => (
                    <li key={index}>
                      <Link href={category.link} className="flex items-center text-gray-700 hover:text-[#ff5722] transition-colors group">
                        <span className="text-[#ff5722] mr-2 transform group-hover:translate-x-1 transition-transform">››</span>
                        {category.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular Countries */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Countries:</h3>
                <div className="space-y-4">
                  {countries.map((country, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                          <span className="text-6xl">{country.image}</span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-[#ff5722] transition-colors">{country.name}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Posts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Latest Posts</h3>
                <div className="space-y-6">
                  {latestPosts.map((post, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <p className="text-xs text-gray-500 mb-1">{post.date} · {post.category}</p>
                      <h4 className="font-bold text-gray-900 hover:text-[#ff5722] transition-colors mb-2 cursor-pointer">
                        {post.title}
                      </h4>
                      <p className="text-sm text-gray-600">{post.excerpt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Australian Visas Categories:
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedServices.map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#ff5722] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {service.desc}
                </p>
                <Link href="#" className="text-gray-400 hover:text-[#ff5722] text-sm font-medium transition-colors uppercase inline-flex items-center group-hover:gap-2">
                  READ MORE <span className="inline-block group-hover:translate-x-1 transition-transform ml-1">›</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
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
              <div key={index} className="bg-gray-50 rounded overflow-hidden border border-gray-200 hover:border-[#ff5722] hover:shadow-md transition-all duration-300">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-all duration-300 group"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4 group-hover:text-[#ff5722] transition-colors">
                    {index + 1}. {faq.question}
                  </span>
                  <span className={`text-2xl text-gray-400 flex-shrink-0 transform group-hover:scale-125 group-hover:text-[#ff5722] transition-all duration-500 ${activeAccordion === index ? 'rotate-180' : 'rotate-0'}`}>
                    {activeAccordion === index ? '−' : '+'}
                  </span>
                </button>
                <div className={`faq-content ${activeAccordion === index ? 'open' : ''} ${activeAccordion === index ? 'px-6 pb-4 pt-2' : 'px-6'}`}>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Still have a question? <Link href="/contact" className="text-blue-600 hover:underline font-medium">Ask your question here</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Consultations for prospective immigrants
              </h3>
              <p className="text-blue-100">
                Aliquam a augue suscipit, luctus neque purus ipsum neque dolor primis libero tempus, and blandit ligula varius
              </p>
            </div>
            <Link
              href="/contact"
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
