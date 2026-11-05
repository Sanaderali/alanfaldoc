import Image from "next/image";
import Link from "@/app/components/SiteLink";
import Icon from "./Icon";
import Flag from "./Flag";
import FaqList from "./FaqList";
import HeroForm from "./HeroForm";
import { site } from "@/data/site";
import { getCountries, getReviews, getServices, pickFeatured } from "@/lib/content";

const WHY = [
  { icon: "shield-halved", title: "Government-approved process", text: "Every application follows the official UAE procedures, so your licence, visa or attestation is handled correctly the first time." },
  { icon: "bolt", title: "Fast turnaround", text: "We prepare, check and submit your documents quickly and follow up with the authorities, so you spend less time waiting." },
  { icon: "hand-holding-dollar", title: "Clear, upfront pricing", text: "You get a clear quote before we start. Government fees and our service fee are listed separately, with no hidden costs." },
  { icon: "user-tie", title: "A dedicated case manager", text: "One person looks after your file from start to finish and updates you at every step, so you always know where you stand." },
  { icon: "language", title: "Clear help in your language", text: "Our team explains each requirement in plain English and Arabic, and helps with certified translation when it is needed." },
  { icon: "headset", title: "Support after approval", text: "We stay with you after the approval: renewals, amendments and reminders, so nothing expires unnoticed." },
];

export default async function HomeSections() {
  const [allServices, allCountries, allReviews] = await Promise.all([getServices(), getCountries(), getReviews()]);
  const services = pickFeatured(allServices, 6);
  const countries = pickFeatured(allCountries, 8);
  const reviews = allReviews.filter((r) => r.name && r.text).slice(0, 6);


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
                Government Approved
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
            <HeroForm services={allServices.map((x) => x.title)} />
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
              Company formation, PRO services, visas, trade licences and document clearing. Everything you need to set up and run a business in the UAE.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={service.slug} className={`bg-white rounded-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 animate-slide-up stagger-${index + 1} group`}>
                <div className="w-14 h-14 mb-4 rounded-full bg-brand-50 text-brand-text flex items-center justify-center text-2xl transform group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300"><Icon name={service.icon} /></div>
                <h3 className="text-xl font-bold text-ink mb-3 group-hover:text-brand-text transition-colors">{service.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">{service.summary}</p>
                <Link href={`/services/${service.slug}`} className="text-gray-500 hover:text-brand-text text-sm font-medium transition-all inline-flex items-center group-hover:gap-2">
                  READ MORE <span className="inline-block group-hover:translate-x-1 transition-transform">›</span>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="btn btn-secondary inline-block">MORE SERVICES</Link>
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
              We guide applicants and investors for the countries below. Choose a country to see visa routes, requirements and how we can help.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {countries.map((country) => (
              <Link href={`/countries/${country.slug}`} key={country.slug} className="relative block h-32 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-canvas to-gray-200 border border-gray-200 group cursor-pointer transform hover:scale-105 hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 pb-6 flex items-center justify-center text-5xl sm:text-6xl transform group-hover:scale-110 transition-transform duration-500"><Flag country={country} size={64} /></div>
                <div className="absolute bottom-4 left-0 right-0 text-center transform group-hover:translate-y-[-4px] transition-transform duration-300">
                  <h3 className="text-ink font-bold text-sm sm:text-base uppercase">{country.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/countries" className="btn btn-secondary inline-block">MORE COUNTRIES</Link>
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
              GET A FREE QUOTE
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
              Starting a company, renewing a licence or processing a visa in the UAE involves many offices and strict rules. We handle the paperwork and the government follow-up, so you can focus on your business and your family.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {WHY.map((w, i) => (
              <div key={w.title} className={`bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up stagger-${(i % 6) + 1} group`}>
                <div className="w-14 h-14 mb-4 rounded-full bg-brand-50 text-brand-text flex items-center justify-center text-2xl group-hover:bg-brand group-hover:text-white transition-all duration-300"><Icon name={w.icon} /></div>
                <h3 className="text-lg font-bold text-ink mb-2 group-hover:text-brand-text transition-colors">{w.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/contact" className="btn btn-cta inline-block">TALK TO AN ADVISOR</Link>
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
              Straight answers to the questions we hear most. If yours is not here, our team will be happy to help.
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

      {/* Testimonials (managed in Dashboard -> Reviews; hidden until at least one review is published) */}
      {reviews.length > 0 && (
        <section id="reviews" className="py-16 md:py-20 bg-canvas">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
                Our Success Stories
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                What our clients say about working with Al Anfal Doc.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((r, index) => (
                <figure key={r.id ?? index} className={`bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-slide-up stagger-${(index % 6) + 1} group`}>
                  <div className="flex items-center mb-4">
                    {r.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image} alt={r.name} width={56} height={56} loading="lazy" className="w-14 h-14 rounded-full object-cover mr-4 shadow-md" />
                    ) : (
                      <div aria-hidden="true" className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center text-xl font-bold mr-4 shadow-md text-white">{r.name.trim().charAt(0).toUpperCase()}</div>
                    )}
                    <figcaption>
                      <div className="font-bold text-ink group-hover:text-brand-text transition-colors">{r.name}</div>
                      {r.role && <div className="text-sm text-gray-500">{r.role}</div>}
                    </figcaption>
                  </div>
                  <p className="text-amber-400 mb-3 text-sm" role="img" aria-label={`${r.rating ?? 5} out of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Icon key={n} name={n <= (r.rating ?? 5) ? "fa-solid fa-star" : "fa-regular fa-star"} fixedWidth={false} className="mr-0.5" />)}</p>
                  <blockquote className="text-gray-600 text-sm italic leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

    </>
  );
}
