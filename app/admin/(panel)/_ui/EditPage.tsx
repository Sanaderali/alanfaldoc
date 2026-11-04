import { notFound } from "next/navigation";
import { readAll } from "@/lib/store";
import { site } from "@/data/site";
import { countryToHtml, postToHtml, serviceToHtml } from "@/lib/html";
import { adminCategories, adminTags } from "@/lib/taxonomy";
import { PageHeader } from "../../ui";
import ItemEditor, { type EditorContext } from "./ItemEditor";

type Kind = "services" | "countries" | "posts";
const labelCap = { services: "Service", countries: "Country", posts: "Post" } as const;

export async function editorContext(): Promise<EditorContext> {
  const [services, categories, tags] = await Promise.all([readAll("services"), adminCategories(), adminTags()]);
  return {
    siteUrl: site.url,
    siteName: site.name,
    services: services.filter((s) => s.status !== "trash").map((s) => ({ value: s.slug, label: s.title })),
    categories: categories.map((c) => ({ name: c.name, count: c.count })),
    tags: tags.map((t) => ({ name: t.name, count: t.count })),
  };
}

export default async function EditPage({ kind, id }: { kind: Kind; id?: string }) {
  const ctx = await editorContext();
  if (!id) {
    return (<><PageHeader title={`Add New ${labelCap[kind]}`} /><ItemEditor kind={kind} ctx={ctx} /></>);
  }
  const item = (await readAll(kind)).find((x) => x.id === id);
  if (!item) notFound();
  const name = (item as { title?: string; name?: string }).title ?? (item as { name?: string }).name;
  // items created before the visual editor existed: open their structured content as editable HTML
  const initial = JSON.parse(JSON.stringify(item));
  if (!initial.contentHtml) initial.contentHtml = kind === "services" ? serviceToHtml(item as never) : kind === "countries" ? countryToHtml(item as never) : postToHtml(item as never);
  return (<><PageHeader title={`Edit ${labelCap[kind]}`} addNew={{ href: `/admin/${kind}/new`, label: `Add New ${labelCap[kind]}` }} /><ItemEditor key={id} kind={kind} id={id} initial={initial} ctx={ctx} /></>);
}
