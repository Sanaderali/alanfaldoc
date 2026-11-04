import type { Metadata } from "next";
import { getPageSeo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("contact");
  return buildMetadata({ title: "Contact Us", description: "Get in touch for a free consultation on company formation, visas and document services in Dubai & the UAE.", path: "/contact", seo });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
