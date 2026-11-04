import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { landingPath } from "@/lib/rbac";
import { PageHeader } from "../../ui";

export const dynamic = "force-dynamic";

export default async function Page() {
  const u = await requireUser();
  return (
    <>
      <PageHeader title="Access denied" />
      <div className="bg-a-surface border border-a-line p-6 max-w-xl">
        <p className="text-[14px] mb-4">Your role does not have permission to open this page. If you think this is a mistake, ask your Super Admin.</p>
        <Link href={landingPath(u)} className="text-brand-text underline">Go to your start page</Link>
      </div>
    </>
  );
}
