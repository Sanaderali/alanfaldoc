import Image from "next/image";
import { redirect } from "next/navigation";
import { adminEnabled, isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { e } = await searchParams;
  let error: string | undefined;
  if (e === "throttle") error = "Too many attempts. Try again in 15 minutes.";
  else if (e === "bad") {
    error = "Incorrect username or password.";
    // Local development only: a password cut short by "#" or "$" in .env is the most common cause of a failed login
    if (process.env.NODE_ENV !== "production") error += ` (Dev hint: the server loaded a ${(process.env.ADMIN_PASSWORD ?? "").length}-character password. If that is shorter than yours, wrap the value in quotes in .env.local.)`;
  }
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="relative w-36 h-12 mx-auto mb-6"><Image src="/logo-black.png" alt="Al Anfal Doc" fill sizes="150px" className="object-contain" priority /></div>
        <h1 className="text-lg font-semibold text-center mb-1">Dashboard login</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Manage services, countries, blog and SEO.</p>
        {adminEnabled() ? <LoginForm error={error} /> : (
          <p className="text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-md p-3">
            The dashboard is disabled. Set the <code className="font-mono">ADMIN_PASSWORD</code> environment variable (at least 8 characters) on the server, then restart.
          </p>
        )}
      </div>
    </main>
  );
}
