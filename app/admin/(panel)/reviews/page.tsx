import { requirePerm } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { PageHeader } from "../../ui";
import ReviewManager from "../_ui/ReviewManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("content.view");
  const items = await readAll("reviews");
  return (
    <>
      <PageHeader title="Reviews" subtitle="Customer reviews shown in “Our Success Stories” on the home page." />
      <ReviewManager initial={JSON.parse(JSON.stringify(items))} />
    </>
  );
}
