import { requirePerm } from "@/lib/auth";
import { leadRecipients, mailConfigured, mailFrom, mailMode } from "@/lib/mail";
import { Badge, PageHeader } from "../../../ui";
import EmailTest from "../../_ui/EmailTest";

export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await requirePerm("users.manage");
  const on = mailConfigured();
  const rows: [string, string][] = [
    ["Connection", mailMode()],
    ["Sent from", mailFrom() || "(MAIL_FROM not set)"],
    ["Team alerts go to", leadRecipients().join(", ") || "(LEAD_ALERT_EMAIL not set)"],
  ];
  return (
    <>
      <PageHeader title="Email" subtitle="Thank-you emails, ticket replies, team alerts and chat transcripts are sent from this connection." />
      <div className="bg-a-surface border border-a-line p-4 mb-6 max-w-2xl space-y-3">
        <p>{on ? <Badge tone="ok">Connected</Badge> : <Badge tone="warn">Not connected</Badge>}</p>
        <dl className="text-[13px] grid grid-cols-[10rem_1fr] gap-y-1.5">{rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-a-muted">{k}</dt><dd className="break-all">{v}</dd></div>)}</dl>
        <p className="text-xs text-a-muted">Settings live in the server&apos;s environment variables (Setup Node.js App), never in the dashboard, so passwords cannot leak. Restart the app after changing them.</p>
      </div>
      <div className="bg-a-surface border border-a-line p-4 max-w-2xl"><EmailTest defaultTo={me.email || ""} /></div>
    </>
  );
}
