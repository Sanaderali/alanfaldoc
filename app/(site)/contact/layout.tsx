import type { Metadata } from "next";
import { getPageSeo } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageSeo("contact");
  return buildMetadata({ title: "Contact Us: Free Quote for Dubai Business Setup", description: "Message us on WhatsApp, call or send a request for a free consultation on company formation, visas, attestation and document services in Dubai.", path: "/contact", seo });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
