import { requirePerm } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { PageHeader } from "../../ui";
import WhatsAppManager from "../_ui/WhatsAppManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("settings.manage");
  const items = (await readAll("whatsapp")).map((w) => ({ ...w, number: `+${w.number}` }));
  return (
    <>
      <PageHeader title="WhatsApp" subtitle="The numbers behind the WhatsApp buttons on the website. Add several, each with the team role that looks after it." />
      <WhatsAppManager initial={JSON.parse(JSON.stringify(items))} />
    </>
  );
}
