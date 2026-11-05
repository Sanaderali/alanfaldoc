import { requirePerm } from "@/lib/auth";
import { PageHeader } from "../../ui";
import ImportForm from "../_ui/ImportForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("content.edit");
  return (
    <>
      <PageHeader title="Import content" subtitle="Upload a content pack (services, countries or blog posts as a .json file). Everything is checked like a normal save, and new pages arrive as drafts." />
      <ImportForm />
    </>
  );
}
