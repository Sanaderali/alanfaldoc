import type { FaqGroup } from "@/types/content";

/** Sample FAQs for the /faqs page. Add groups or questions freely. Each group becomes a column block. */
export const faqGroups: FaqGroup[] = [
  {
    title: "General Questions",
    faqs: [
      { question: "Which payment methods do you accept?", answer: "We accept bank transfer, major credit and debit cards and online payment links. We confirm fees in writing before we start." },
      { question: "What is the registration process?", answer: "It starts with a consultation, then we collect and check your documents, submit them to the authorities and keep you updated until approval." },
      { question: "How can I update my personal information?", answer: "Send us the updated details through the contact page or by email and we will update your file." },
    ],
  },
  {
    title: "Company Formation",
    faqs: [
      { question: "Can I own 100% of my company?", answer: "In most activities, yes. We confirm eligibility for your activity and jurisdiction first." },
      { question: "Mainland or free zone, which is better?", answer: "It depends on where your customers are and what you need to trade. We compare both against your plan." },
      { question: "How long does it take to get a trade licence?", answer: "It varies by jurisdiction and activity. We give you a realistic timeline after reviewing your file." },
    ],
  },
  {
    title: "Visa Processing",
    faqs: [
      { question: "Do you guarantee a visa approval?", answer: "No. Decisions are made by the authorities. We prepare a complete, correct application to avoid delays and avoidable rejections." },
      { question: "How long does the application process take?", answer: "It depends on the visa type and authority. We estimate after reviewing your documents." },
      { question: "Can you help my family with their visas?", answer: "Yes. We prepare the documents for sponsored family members too." },
    ],
  },
  {
    title: "Documents & Attestation",
    faqs: [
      { question: "What is document attestation?", answer: "Official verification of a document by the relevant authorities so it is accepted in another country." },
      { question: "Do you provide certified translation?", answer: "Yes. Arabic and English are most common and other languages are available on request." },
      { question: "Is express service available?", answer: "For many document types, yes. Timing depends on the authority involved." },
    ],
  },
];
