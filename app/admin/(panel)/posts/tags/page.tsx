import { requireAdmin } from "@/lib/auth";
import { adminTags } from "@/lib/taxonomy";
import { PageHeader } from "../../../ui";
import TermManager from "../../_ui/TermManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Tags" />
      <TermManager type="tag" rows={await adminTags()} />
    </>
  );
}
