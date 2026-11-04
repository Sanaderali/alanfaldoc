import { requirePerm } from "@/lib/auth";
import EditPage from "../../_ui/EditPage";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requirePerm("content.edit");
  return <EditPage kind="services" id={(await params).id} />;
}
