import { requirePerm } from "@/lib/auth";
import ResourceList, { type ListParams } from "../_ui/ResourceList";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<ListParams> }) {
  await requirePerm("content.view");
  return <ResourceList kind="countries" params={await searchParams} />;
}
