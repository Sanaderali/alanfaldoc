import Image from "next/image";
import ForgotFlow from "./ForgotFlow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recover your login", robots: { index: false, follow: false } };

export default function ForgotPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-a-surface border border-a-line rounded-xl shadow-sm p-8">
        <div className="relative w-36 h-12 mx-auto mb-6"><Image src="/logo-black.png" alt="Al Anfal Doc" fill sizes="150px" className="object-contain" priority /></div>
        <h1 className="text-lg font-semibold text-center mb-1">Forgot username or password?</h1>
        <p className="text-sm text-a-muted text-center mb-6">Recover your dashboard login with a code sent to your email.</p>
        <ForgotFlow />
      </div>
    </main>
  );
}
