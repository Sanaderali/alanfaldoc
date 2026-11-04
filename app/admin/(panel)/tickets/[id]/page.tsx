import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { readAll } from "@/lib/store";
import { PageHeader } from "../../../ui";
import TicketThread from "../../_ui/TicketThread";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePerm("tickets.view");
  const { id } = await params;
  const t = (await readAll("tickets")).find((x) => x.id === id);
  if (!t) notFound();
  return (
    <>
      <PageHeader title={`Ticket #${t.number}`} subtitle={t.subject} />
      <TicketThread ticket={JSON.parse(JSON.stringify(t))} canReply={can(me, "tickets.reply")} />
    </>
  );
}
