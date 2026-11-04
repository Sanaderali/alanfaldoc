import { requirePerm } from "@/lib/auth";
import { adminCategories } from "@/lib/taxonomy";
import { PageHeader } from "../../../ui";
import TermManager from "../../_ui/TermManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("taxonomy.manage");
  return (
    <>
      <PageHeader title="Categories" />
      <TermManager type="category" rows={await adminCategories()} />
    </>
  );
}
