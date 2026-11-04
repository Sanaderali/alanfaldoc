import type { NavItem } from "@/types/content";

/** Global site settings. Edit here once, updates header, footer, SEO, contact page. */
export const site = {
  name: "Al Anfal Doc",
  tagline: "Dubai Business Setup & Document Services",
  description:
    "Expert consultation for company formation, PRO services, visa processing and document clearing in Dubai & UAE.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://alanfaldoc.com",
  address: "Business Bay, Dubai, UAE",
  phone: "+971 50 123 4567",
  email: "info@alanfaldoc.com",
  hours: ["Mon-Fri: 9:00AM - 6:30PM", "Saturday: 8:30AM - 3:30PM", "Sunday: Closed"],
  social: [
    { label: "Facebook", href: "#" },
    { label: "X (Twitter)", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Countries", href: "/countries" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Placeholder figures. Replace with your real numbers. */
export const stats = [
  { value: "20+", label: "Years of experience" },
  { value: "5,000+", label: "Documents processed" },
  { value: "200+", label: "Companies served" },
  { value: "6", label: "Countries covered" },
];
