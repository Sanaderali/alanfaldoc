import type { Metadata } from "next";
import HomeClient from "./components/HomeClient";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({ title: site.name, description: site.description, path: "/" }),
  title: { absolute: `${site.name} - ${site.tagline}` },
};

export default function Home() {
  return <HomeClient />;
}
