import Image from "next/image";
import Link from "@/app/components/SiteLink";
import Icon from "./Icon";
import Flag from "./Flag";
import FaqList from "./FaqList";

export default function HomeSections() {

  const services = [
    { icon: "building", title: "Company Formation", desc: "Complete mainland and free zone company setup solutions in Dubai and UAE" },
    { icon: "earth-americas", title: "Business Immigration", desc: "Golden visa, residence permits, and work visa processing for business owners" },
    { icon: "clipboard-list", title: "PRO Services", desc: "Professional government documentation and liaison services for all departments" },
    { icon: "file-circle-check", title: "Document Clearing", desc: "Fast-track approval and attestation services for business documents" },
    { icon: "file-signature", title: "Trade License", desc: "New trade license issuance and annual renewal services across UAE" },
    { icon: "language", title: "Legal Translation", desc: "Certified translation and attestation for all business documents" },
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
    { name: "Dan Hodges", role: "(USA Students Visa)", text: "An augue in cubilia laoreet undo magna suscipit egestas magna ipsum egestas vitae purus ipsum primis cubilia laoreet augue donec ultrice ligula egestas magna a vitae purus suscipit lectus gestas magna a viverra dolor neque est gravida", img: "fa-solid fa-user" },
    { name: "Amelie Peterson", role: "(France Working Visa)", text: "An orci nullam tempor sapien, gravida donec enim ipsum a porta. An augue in cubilia laoreet magna suscipit egestas magna isum vitae purus ipsum primis in cubilia laoreet augue ultrice at ligula egestas magna", img: "fa-solid fa-user" },
    { name: "Scott Boxer", role: "(Germany Travel Visa)", text: "An augue cubilia laoreet magna suscipit egestas magna ipsum vitae purus undo ipsum primis in cubilia laoreet augue ultrice ligula egestas magna at suscipit lectus gestas magna viverra dolor", img: "fa-solid fa-user-tie" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-b from-brand-50 via-white to-canvas text-ink py-16 sm:py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/hero-team.jpg')] bg-cover bg-center opacity-[0.08]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm sm:text-base mb-4">We have 20+ years experience in</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              IMMIGRATION AND<br />VISA CONSULTATION
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto mb-8 px-4">
              Feugiat primis ligula risus auctor egestas augue mauri viverra tortor in iaculis and placerat purus feugiat primis ultrice in ligula impedit magna purus pretium neque ligula an ipsum volute turpis quaerat auctor and rhoncus laoreet augue in cubilia augue
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm mb-10">
              <span className="flex items-center">
                <Icon name="circle-check" className="text-brand-text mr-2" />
                Goverment Approved
              </span>
              <span className="flex items-center">
                <Icon name="circle-check" className="text-brand-text mr-2" />
                No Hidden Costs
              </span>
              <span className="flex items-center">
                <Icon name="circle-check" className="text-brand-text mr-2" />
                Secure Online Form
              </span>
            </div>
          </div>

          {/* Consultation Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6 sm:p-8">
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" placeholder="Enter Your Name*" className="px-4 py-3 border border-gray-300 rounded text-ink focus:ring-2 focus:ring-brand focus:border-transparent" />
              <input type="email" placeholder="Enter Your Email*" className="px-4 py-3 border border-gray-300 rounded text-ink focus:ring-2 focus:ring-brand focus:border-transparent" />
              <select className="px-4 py-3 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-brand focus:border-transparent">
                <option>Visa Type</option>
                <option>Company Formation</option>
                <option>Business Immigration</option>
                <option>PRO Services</option>
                <option>Trade License</option>
                <option>Document Clearing</option>
              </select>
              <button type="submit" className="btn btn-primary">
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
            <div className="relative h-[300px] sm:h-[400px] rounded-lg overflow-hidden group">
              <Image src="/hero-team.jpg" alt="About Us" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transform group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 flex items-center justify-center group-hover:backdrop-blur-sm transition-all duration-500">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-125 hover:shadow-2xl transition-all duration-500 animate-pulse-slow group">
                  <Icon name="play" className="text-2xl sm:text-3xl text-brand-text ml-1 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wide">ABOUT AGENCY</span>
              <h2 className="text-3xl md:text-4xl font-bold text-ink mt-3 mb-6">
                Get guarantee success with our advisors
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Semper lacus cursus porta, feugiat primis ligula risus auctor and rhoncus in ultrice ligula purus ipsum primis in cubilia augue vitae laoreet augue in cubilia augue egestas an ipsum turpis
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Cursus risus laoreet auctor, varius augue. Nulla dolor and sapien risus nec, luctus mauris donec diam sapien neque in cubilia an ligula quaerat ipsum volute turpis sodales sapien vitae donec an ipsum porta justo integer at velna vitae auctor a magna risus
              </p>
              <Link href="/about" className="btn btn-secondary inline-block">
                DISCOVER MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className={`bg-white rounded-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 animate-slide-up stagger-${index + 1} group`}>
                <div className="w-14 h-14 mb-4 rounded-full bg-brand-50 text-brand-text flex items-center justify-center text-2xl transform group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300"><Icon name={service.icon} /></div>
                <h3 className="text-xl font-bold text-ink mb-3 group-hover:text-brand-text transition-colors">{service.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">{service.desc}</p>
                <Link href="/services" className="text-gray-500 hover:text-brand-text text-sm font-medium transition-all inline-flex items-center group-hover:gap-2">
                  READ MORE <span className="inline-block group-hover:translate-x-1 transition-transform">›</span>
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
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              Countries We Cover
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {countries.slice(0, 7).map((country, index) => (
              <Link href="/countries" key={index} className="relative block h-32 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-canvas to-gray-200 border border-gray-200 group cursor-pointer transform hover:scale-105 hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 pb-6 flex items-center justify-center text-5xl sm:text-6xl transform group-hover:scale-110 transition-transform duration-500"><Flag country={{ flag: country.img }} size={64} /></div>
                <div className="absolute bottom-4 left-0 right-0 text-center transform group-hover:translate-y-[-4px] transition-transform duration-300">
                  <h3 className="text-ink font-bold text-sm sm:text-base">{country.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-brand-50 to-brand-100 text-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-sm uppercase tracking-wide mb-2 text-accent font-semibold">CONSULTATIONS FOR PROSPECTIVE IMMIGRANTS</h3>
              <p className="text-gray-600 text-sm">Aliquam a augue suscipit, luctus neque purus ipsum neque dolor primis libero tempus, and blandit ligula varius</p>
            </div>
            <Link href="/contact" className="btn btn-cta">
              GET CONSULTATION
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 md:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              Why Choose Al Anfal Doc?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center bg-white p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-xl transform hover:scale-110 transition-all duration-500 animate-bounce-in stagger-1 group">
              <div className="text-4xl sm:text-5xl mb-3 transform group-hover:rotate-12 transition-transform duration-300 text-brand-text"><Icon name="graduation-cap" /></div>
              <div className="text-3xl sm:text-4xl font-bold text-brand-text mb-2">820+</div>
              <div className="text-gray-600 text-sm">Students</div>
            </div>
            <div className="text-center bg-white p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-xl transform hover:scale-110 transition-all duration-500 animate-bounce-in stagger-2 group">
              <div className="text-4xl sm:text-5xl mb-3 transform group-hover:rotate-12 transition-transform duration-300 text-brand-text"><Icon name="building-columns" /></div>
              <div className="text-3xl sm:text-4xl font-bold text-brand-text mb-2">127</div>
              <div className="text-gray-600 text-sm">Universities</div>
            </div>
            <div className="text-center bg-white p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-xl transform hover:scale-110 transition-all duration-500 animate-bounce-in stagger-3 group">
              <div className="text-4xl sm:text-5xl mb-3 transform group-hover:rotate-12 transition-transform duration-300 text-brand-text"><Icon name="earth-americas" /></div>
              <div className="text-3xl sm:text-4xl font-bold text-brand-text mb-2">81</div>
              <div className="text-gray-600 text-sm">Countries</div>
            </div>
            <div className="text-center bg-white p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-xl transform hover:scale-110 transition-all duration-500 animate-bounce-in stagger-4 group">
              <div className="text-4xl sm:text-5xl mb-3 transform group-hover:rotate-12 transition-transform duration-300 text-brand-text"><Icon name="people-arrows" /></div>
              <div className="text-3xl sm:text-4xl font-bold text-brand-text mb-2">969</div>
              <div className="text-gray-600 text-sm">Immigrations</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              Have Questions? Look Here
            </h2>
            <p className="text-gray-600">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <FaqList faqs={faqs} />
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Still have a question? <Link href="/contact" className="text-brand-text hover:underline font-medium">Ask your question here</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              Our Success Stories...
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cursus porta, feugiat primis in ultrice ligula risus auctor tempus dolor feugiat, felis lacinia risus interdum auctor id viverra dolor iaculis luctus placerat and massa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-slide-up stagger-${index + 1} group`}>
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center text-2xl mr-4 transform group-hover:scale-110 transition-transform duration-300 shadow-md text-white"><Icon name={testimonial.img} /></div>
                  <div>
                    <div className="font-bold text-ink group-hover:text-brand-text transition-colors">{testimonial.name}</div>
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
      <section className="py-12 md:py-16 bg-gradient-to-r from-canvas to-canvas text-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Free Immigration & Visa Consultation
          </h2>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto text-sm sm:text-base">
            Aliquam a augue suscipit, luctus neque purus ipsum neque dolor primis libero tempus, and blandit posuere ligula varius magna congue cursus porta ultrice
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-sm sm:text-base">Call : <span className="font-bold text-lg">+971 50 123 4567</span></span>
            <Link href="/contact" className="btn btn-cta">
              GET CONSULTATION
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
