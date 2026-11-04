import type { Metadata } from "next";

/** Admin area: never indexed, never cached by search engines. */
export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="admin-theme min-h-screen bg-a-canvas text-a-text">{children}</div>;
}
