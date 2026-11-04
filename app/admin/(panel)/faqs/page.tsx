import { requireAdmin } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { LinkButton, PageHeader } from "../../ui";
import FaqManager from "../_ui/FaqManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const groups = await readAll("faqs");
  return (
    <>
      <PageHeader title="FAQs" subtitle="General questions shown on the /faqs page. Service and country FAQs are edited on each service or country." actions={<LinkButton href="/admin/pages/faqs">FAQ page SEO & schema</LinkButton>} />
      <FaqManager initial={JSON.parse(JSON.stringify(groups))} />
    </>
  );
}
