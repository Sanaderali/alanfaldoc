import { requirePerm } from "@/lib/auth";
import { PageHeader } from "../../ui";
import TranslationsRunner from "../_ui/TranslationsRunner";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("settings.manage");
  return (
    <>
      <PageHeader title="Translations" subtitle="Translate the website ahead of time so visitors see their language instantly. The tool reads your published pages and translates every sentence once; anything new is translated automatically the first time a visitor needs it." />
      <TranslationsRunner />
    </>
  );
}
