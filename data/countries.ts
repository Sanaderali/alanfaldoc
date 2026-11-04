import type { Country } from "@/types/content";

/**
 * Sample content, replace with your own. Add a new object to add a new country page
 * (/countries/<slug>); nothing else needs to change.
 */
export const countries: Country[] = [
  {
    slug: "united-arab-emirates",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    tagline: "Great Destination to Start a Business and Live",
    headline: "Invest. Work. Live in the UAE",
    summary: "Mainland & free zone company setup, residence and golden visas.",
    intro:
      "The UAE offers 100% foreign ownership in most sectors, zero personal income tax and a strategic location between Europe, Asia and Africa. We handle the licensing, visas and paperwork end to end.",
    facts: [
      { label: "Full name", value: "United Arab Emirates" },
      { label: "Capital", value: "Abu Dhabi" },
      { label: "Largest city", value: "Dubai" },
      { label: "Currency", value: "UAE Dirham (AED)" },
      { label: "Major language", value: "Arabic, English widely used" },
      { label: "Emirates", value: "7" },
    ],
    sections: [
      {
        heading: "Why Set Up in the UAE?",
        paragraphs: [
          "A business-friendly regulatory environment, modern infrastructure and a large international talent pool make the UAE a leading base for entrepreneurs and investors.",
        ],
      },
      { heading: "Big Cities:", minor: true, paragraphs: ["Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain"] },
      {
        heading: "Benefits:",
        minor: true,
        list: [
          "Up to 100% foreign ownership in many activities",
          "Mainland and free zone options to suit your business model",
          "Residence visas for owners, employees and family",
          "No personal income tax",
        ],
      },
    ],
    gradient: "from-emerald-100 via-green-100 to-green-200",
    faqs: [
      { question: "Can foreigners start a business in the UAE?", answer: "Yes. Foreign investors can set up mainland and free zone companies, and many activities allow 100% foreign ownership." },
      { question: "Do I need a visa to set up a company?", answer: "You can usually start the licensing process before relocating. Residence visas for owners and staff are processed after the licence is issued." },
      { question: "How can Al Anfal Doc help?", answer: "We handle licensing, visas, PRO paperwork, document attestation and bank account support from start to finish." },
    ],
    serviceSlugs: ["company-formation", "trade-license", "visa-processing", "pro-services"],
    featured: true,
  },
  {
    slug: "canada",
    name: "Canada",
    flag: "🇨🇦",
    tagline: "Great Destination to Study and Live",
    headline: "Study. Work. Live in Canada",
    summary: "Skilled worker, study and business immigration pathways.",
    intro:
      "Canada is known for its welcoming immigration programs, high quality of life and strong job market. We help prepare and attest the documents every application needs.",
    facts: [
      { label: "Full name", value: "Canada" },
      { label: "Capital", value: "Ottawa" },
      { label: "Largest city", value: "Toronto" },
      { label: "Major languages", value: "English, French" },
      { label: "Currency", value: "Canadian Dollar (CAD)" },
    ],
    sections: [
      {
        heading: "Why Choose Canada?",
        paragraphs: [
          "Canada offers multiple economic immigration streams, internationally recognised education and a clear path to permanent residence for many applicants.",
        ],
      },
      { heading: "Big Cities:", minor: true, paragraphs: ["Toronto, Montréal, Vancouver, Calgary, Ottawa, Edmonton"] },
      {
        heading: "How We Help:",
        minor: true,
        list: ["Document attestation and legalisation", "Certified translation", "Application and checklist review", "Appointment and submission support"],
        twoColumns: true,
      },
    ],
    gradient: "from-red-100 via-rose-100 to-red-200",
    faqs: [
      { question: "Can you help with a Canadian visa application?", answer: "We prepare, attest and translate the supporting documents. Decisions are always made by the Canadian immigration authorities." },
      { question: "Do I need my documents attested for Canada?", answer: "Often yes, especially educational and civil documents. Requirements depend on the program, so we confirm them for your case." },
      { question: "Are translations required?", answer: "Documents not in English or French usually need a certified translation. We can arrange this." },
    ],
    serviceSlugs: ["visa-processing", "document-clearing", "legal-translation"],
    featured: true,
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    flag: "🇬🇧",
    tagline: "Great Destination for Study, Work and Business",
    headline: "Study. Work. Live in the United Kingdom",
    summary: "Student, skilled worker and visitor visa document support.",
    intro:
      "The UK combines world-ranked universities with a global business hub. We prepare, attest and translate the supporting documents your visa application requires.",
    facts: [
      { label: "Full name", value: "United Kingdom of Great Britain and Northern Ireland" },
      { label: "Capital", value: "London" },
      { label: "Major language", value: "English" },
      { label: "Currency", value: "Pound Sterling (GBP)" },
    ],
    sections: [
      {
        heading: "Why Choose the United Kingdom?",
        paragraphs: ["Strong education, finance and technology sectors and an established route for skilled workers and students."],
      },
      { heading: "Big Cities:", minor: true, paragraphs: ["London, Manchester, Birmingham, Edinburgh, Glasgow, Leeds"] },
    ],
    gradient: "from-indigo-100 via-blue-100 to-indigo-200",
    faqs: [
      { question: "What documents do UK visas usually need?", answer: "A valid passport, financial evidence and supporting documents that vary by visa type. We give you a checklist for your route." },
      { question: "Can you attest UAE documents for UK use?", answer: "We guide the legalisation steps and handle the UAE-side attestation where applicable." },
      { question: "Do you guarantee approval?", answer: "No. We make sure your documents are complete and correct, but the Home Office makes the final decision." },
    ],
    serviceSlugs: ["visa-processing", "document-clearing", "legal-translation"],
    featured: true,
  },
  {
    slug: "united-states",
    name: "United States of America",
    flag: "🇺🇸",
    tagline: "Great Destination for Business and Study",
    headline: "Study. Work. Invest in the USA",
    summary: "Visitor, student and business visa document preparation.",
    intro:
      "From business visits to long-term study, we help applicants assemble accurate, properly attested documentation for their US visa journey.",
    facts: [
      { label: "Full name", value: "United States of America" },
      { label: "Capital", value: "Washington, D.C." },
      { label: "Largest city", value: "New York City" },
      { label: "Major language", value: "English" },
      { label: "Currency", value: "US Dollar (USD)" },
    ],
    sections: [
      { heading: "Why Choose the USA?", paragraphs: ["The world's largest economy with leading universities and diverse opportunities across every industry."] },
      { heading: "Big Cities:", minor: true, paragraphs: ["New York, Los Angeles, Chicago, Houston, San Francisco, Miami"] },
    ],
    gradient: "from-sky-100 via-blue-100 to-sky-200",
    faqs: [
      { question: "Can you help with a US visitor or student visa?", answer: "We help prepare and attest supporting documents. Interviews and decisions are handled by the US authorities." },
      { question: "How early should I start preparing documents?", answer: "As early as possible, because attestation and translation can take time before your appointment." },
      { question: "Do you provide legal advice?", answer: "We provide documentation support. For legal opinions we can refer you to a licensed immigration attorney." },
    ],
    serviceSlugs: ["visa-processing", "document-clearing"],
  },
  {
    slug: "australia",
    name: "Australia",
    flag: "🇦🇺",
    tagline: "Great Destination to Study and Live",
    headline: "Study. Work. Live in Australia",
    summary: "Student, skilled and visitor visa support.",
    intro:
      "Australia pairs a relaxed lifestyle with strong skilled-migration and study pathways. We take care of the document side so your application is complete the first time.",
    facts: [
      { label: "Full name", value: "Commonwealth of Australia" },
      { label: "Population", value: "About 27 million" },
      { label: "Capital", value: "Canberra" },
      { label: "Largest city", value: "Sydney" },
      { label: "Area", value: "7.7 million sq km (2.9 million sq miles)" },
      { label: "Major language", value: "English" },
      { label: "Currency", value: "Australian Dollar (AUD)" },
    ],
    sections: [
      {
        heading: "Why Study In Australia?",
        paragraphs: [
          "Australia combines globally recognised qualifications with a high standard of living, a multicultural society and post-study work options for many graduates.",
          "We help students and families prepare, attest and translate every document the application needs, so the file is complete the first time.",
        ],
      },
      { heading: "Big Cities:", minor: true, paragraphs: ["Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra"] },
      {
        heading: "Climate:",
        minor: true,
        paragraphs: ["Climate varies widely: mostly temperate in the south-east, tropical in the north and arid in the interior. Seasons are the reverse of the northern hemisphere."],
      },
      {
        heading: "Additional Information:",
        paragraphs: ["Requirements and processing times differ by visa type and change over time. Always confirm the current rules with the official immigration authority; we will walk you through them and prepare your documents."],
      },
      {
        heading: "Institutes:",
        minor: true,
        list: [
          "University of Sydney",
          "University of Melbourne",
          "UNSW Sydney",
          "Australian National University",
          "Monash University",
          "University of Queensland",
          "University of Adelaide",
          "University of Western Australia",
          "University of Technology Sydney",
          "Macquarie University",
          "Curtin University",
          "RMIT University",
        ],
        twoColumns: true,
      },
      {
        heading: "Benefits:",
        minor: true,
        paragraphs: ["Studying and living in Australia offers advantages beyond the classroom."],
        list: ["Internationally recognised degrees", "Work rights while studying (conditions apply)", "Pathways to post-study work and residence for eligible graduates"],
      },
    ],
    categories: [
      { title: "Study Visa in Australia", href: "/services/visa-processing" },
      { title: "Skilled Worker Visa", href: "/services/visa-processing" },
      { title: "Work Permit Visa", href: "/services/visa-processing" },
      { title: "PR and Migrate Visa", href: "/services/business-immigration" },
      { title: "Business Visa", href: "/services/business-immigration" },
      { title: "Spouse/Family Visas", href: "/services/visa-processing" },
      { title: "Tourist & Visitor Visas", href: "/services/visa-processing" },
      { title: "Working Holiday Visas", href: "/services/visa-processing" },
    ],
    gradient: "from-cyan-100 via-sky-100 to-blue-200",
    faqs: [
      { question: "Can you help with an Australian student visa?", answer: "We prepare, attest and translate the supporting documents so your application is complete. Decisions are made by the Australian authorities." },
      { question: "Do I need certified translations?", answer: "Documents not in English generally need a certified translation. We arrange this alongside attestation." },
      { question: "Can I work while studying in Australia?", answer: "Many student visas allow limited work rights with conditions. Always confirm the current rules with the official immigration authority." },
    ],
    serviceSlugs: ["visa-processing", "document-clearing", "legal-translation"],
  },
  {
    slug: "saudi-arabia",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    tagline: "A Fast-Growing Market on Your Doorstep",
    headline: "Expand. Invest. Grow in Saudi Arabia",
    summary: "Business expansion paperwork, attestation and translation.",
    intro:
      "With Vision 2030 opening new sectors to foreign investors, many UAE companies expand into Saudi Arabia. We help with the attested documentation that expansion requires.",
    facts: [
      { label: "Capital", value: "Riyadh" },
      { label: "Major language", value: "Arabic" },
      { label: "Currency", value: "Saudi Riyal (SAR)" },
    ],
    sections: [
      { heading: "Why Saudi Arabia?", paragraphs: ["Large domestic market, major infrastructure investment and growing opportunities for international companies."] },
    ],
    gradient: "from-lime-100 via-emerald-100 to-green-200",
    faqs: [
      { question: "Can UAE companies expand into Saudi Arabia?", answer: "Yes, many do. The documentation for commercial registration and licensing usually needs attestation and translation, which we can arrange." },
      { question: "Do documents need Arabic translation?", answer: "Many Saudi authorities require Arabic documents. We provide certified legal translation." },
      { question: "Can you advise on market entry?", answer: "Our business consulting service covers jurisdiction options and the steps to expand." },
    ],
    serviceSlugs: ["document-clearing", "legal-translation", "business-consulting"],
  },
];
