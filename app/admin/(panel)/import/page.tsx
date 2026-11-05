import { requirePerm } from "@/lib/auth";
import { PageHeader } from "../../ui";
import ImportForm from "../_ui/ImportForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("content.edit");
  return (
    <>
      <PageHeader title="Import content" subtitle="Upload a content pack (.json) with services, countries, blog posts, FAQ groups or reviews. Everything is checked like a normal save, and new items arrive as drafts." />
      <ImportForm />
    </>
  );
}
