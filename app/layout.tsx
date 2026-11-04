import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { default: `${site.name} - ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  metadataBase: new URL(site.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
