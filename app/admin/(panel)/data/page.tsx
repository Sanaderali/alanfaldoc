import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { EXPORT_TYPES, listForPicker } from "@/lib/data-transfer";
import { can } from "@/lib/rbac";
import { translationStats } from "@/lib/translate";
import { redirect } from "next/navigation";
import { PageHeader } from "../../ui";
import ExportPanel from "../_ui/ExportPanel";
import ImportPanel from "../_ui/ImportPanel";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireUser();
  const canExport = can(me, "backup.export"), canImport = can(me, "content.edit");
  if (!canExport && !canImport) redirect("/admin/forbidden");
  const { tab: t } = await searchParams;
  const tab = t === "import" && canImport ? "import" : t === "export" && canExport ? "export" : canExport ? "export" : "import";
  const tabs = [...(canExport ? [["export", "Export / Backup"] as const] : []), ...(canImport ? [["import", "Import / Restore"] as const] : [])];
  return (
    <>
      <PageHeader title="Import / Export" subtitle="Back up your content, move it to another site or restore it. Everything is one JSON file; you choose exactly what goes in or comes out." />
      <nav aria-label="Import or export" className="flex gap-1 mb-4 border-b border-a-line">
        {tabs.map(([k, label]) => <Link key={k} href={`/admin/data?tab=${k}`} aria-current={tab === k ? "page" : undefined} className={`px-4 py-2 text-[13px] border-b-2 -mb-px ${tab === k ? "border-brand text-a-text font-semibold" : "border-transparent text-brand-text hover:text-brand-dark"}`}>{label}</Link>)}
      </nav>
      {tab === "export" ? <ExportPanel types={EXPORT_TYPES.map((x) => ({ key: x.key, label: x.label, hint: x.hint }))} lists={await listForPicker()} langs={await translationStats()} /> : <ImportPanel />}
    </>
  );
}
