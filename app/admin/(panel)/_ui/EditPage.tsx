import { notFound } from "next/navigation";
import { readAll } from "@/lib/store";
import { site } from "@/data/site";
import { countryToHtml, postToHtml, serviceToHtml } from "@/lib/html";
import { PageHeader } from "../../ui";
import ItemEditor, { type EditorContext } from "./ItemEditor";

type Kind = "services" | "countries" | "posts";
const label = { services: "service", countries: "country", posts: "post" } as const;

export async function editorContext(): Promise<EditorContext> {
  const [services, posts] = await Promise.all([readAll("services"), readAll("posts")]);
  return {
    siteUrl: site.url,
    siteName: site.name,
    services: services.map((s) => ({ value: s.slug, label: s.title })),
    categories: [...new Set(posts.map((p) => p.category))],
  };
}

export default async function EditPage({ kind, id }: { kind: Kind; id?: string }) {
  const ctx = await editorContext();
  if (!id) {
    return (<><PageHeader title={`New ${label[kind]}`} subtitle="Write it, then press Publish when you are ready." /><ItemEditor kind={kind} ctx={ctx} /></>);
  }
  const item = (await readAll(kind)).find((x) => x.id === id);
  if (!item) notFound();
  const name = (item as { title?: string; name?: string }).title ?? (item as { name?: string }).name;
  // items created before the visual editor existed: open their structured content as editable HTML
  const initial = JSON.parse(JSON.stringify(item));
  if (!initial.contentHtml) initial.contentHtml = kind === "services" ? serviceToHtml(item as never) : kind === "countries" ? countryToHtml(item as never) : postToHtml(item as never);
  return (<><PageHeader title={`Edit ${label[kind]}`} subtitle={name} /><ItemEditor key={id} kind={kind} id={id} initial={initial} ctx={ctx} /></>);
}
