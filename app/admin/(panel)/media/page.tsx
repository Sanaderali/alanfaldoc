import { requireAdmin } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { PageHeader } from "../../ui";
import MediaManager from "../_ui/MediaManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Media library" subtitle="Every image needs alt text. It is used for accessibility and image search." />
      <MediaManager items={JSON.parse(JSON.stringify(await readAll("media")))} />
    </>
  );
}
