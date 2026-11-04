import { requireAdmin } from "@/lib/auth";
import ResourceList from "../_ui/ResourceList";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  return <ResourceList kind="countries" searchParams={await searchParams} />;
}
