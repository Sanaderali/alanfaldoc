import type { Post } from "@/types/content";

/** Sample posts, replace with your own. Add an object to publish a /blog/<slug> page. */
export const posts: Post[] = [
  {
    slug: "mainland-vs-free-zone",
    title: "Mainland vs Free Zone: Which Is Right for Your Business?",
    excerpt: "A quick comparison of ownership, trading rights and costs to help you choose a jurisdiction.",
    date: "2026-10-28",
    category: "Company Formation",
    body: [
      "Choosing between a mainland and a free zone licence is the first big decision when setting up in the UAE.",
      "Mainland companies can trade across the UAE and with government entities, while free zones offer streamlined setup and often full foreign ownership within the zone.",
      "The right choice depends on where your customers are, the activity you need and your budget. Contact us and we will recommend the best fit for your plan.",
    ],
  },
  {
    slug: "golden-visa-basics",
    title: "UAE Golden Visa: The Basics",
    excerpt: "Who can apply, what documents to prepare and how long the visa lasts.",
    date: "2026-10-15",
    category: "Visa",
    body: [
      "The golden visa offers long-term residence to investors, entrepreneurs and certain skilled professionals.",
      "Eligibility depends on category. Preparing complete, attested documents up front avoids delays.",
    ],
  },
  {
    slug: "document-attestation-guide",
    title: "Document Attestation: A Step-by-Step Guide",
    excerpt: "How documents move from issuing authority to legalised use in the UAE.",
    date: "2026-10-02",
    category: "Documents",
    body: [
      "Most foreign documents must be attested before UAE authorities accept them.",
      "The chain usually includes the issuing country's authorities, the UAE embassy and the UAE Ministry of Foreign Affairs.",
    ],
  },
];
