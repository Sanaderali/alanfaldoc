import { requireAdmin } from "@/lib/auth";
import EditPage from "../../_ui/EditPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  return <EditPage kind="posts" />;
}
