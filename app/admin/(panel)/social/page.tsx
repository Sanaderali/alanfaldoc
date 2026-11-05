import { requirePerm } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { PageHeader } from "../../ui";
import SocialManager from "../_ui/SocialManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("settings.manage");
  const items = await readAll("social");
  return (
    <>
      <PageHeader title="Social media" subtitle="Your social profiles, shown as icons in the website header and footer." />
      <SocialManager initial={JSON.parse(JSON.stringify(items))} />
    </>
  );
}
