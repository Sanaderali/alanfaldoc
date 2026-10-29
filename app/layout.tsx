import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Anfal Doc - Coming Soon",
  description: "Al Anfal Doc - Professional Documentation Services - Launching Soon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
