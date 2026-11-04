import { requirePerm } from "@/lib/auth";
import EditPage from "../../_ui/EditPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("content.edit");
  return <EditPage kind="countries" />;
}
