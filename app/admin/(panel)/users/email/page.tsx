import { requirePerm } from "@/lib/auth";
import { leadRecipients, mailConfigured, mailFrom, mailMode, readMailLog } from "@/lib/mail";
import { Badge, PageHeader, wpDate } from "../../../ui";
import EmailTest from "../../_ui/EmailTest";

export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await requirePerm("users.manage");
  const on = mailConfigured();
  const log = await readMailLog();
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
      <div className="bg-a-surface border border-a-line p-4 max-w-2xl mb-6"><EmailTest defaultTo={me.email || ""} /></div>
      <h2 className="text-[16px] font-semibold mb-2">Recent emails</h2>
      <div className="bg-a-surface border border-a-line overflow-x-auto max-w-4xl">
        {log.length === 0 ? <p className="p-4 text-[13px] text-a-muted">Nothing sent yet. Every email the website tries to send (success or failure) is listed here.</p> : (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left border-b border-a-line"><th className="px-3 py-2 font-normal">When</th><th className="px-3 py-2 font-normal">To</th><th className="px-3 py-2 font-normal">Subject</th><th className="px-3 py-2 font-normal">Result</th></tr></thead>
            <tbody>{log.map((l, n) => (
              <tr key={n} className={`align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                <td className="px-3 py-2 whitespace-nowrap text-a-muted">{wpDate(l.at)}</td><td className="px-3 py-2 break-all">{l.to}</td><td className="px-3 py-2">{l.subject}</td>
                <td className="px-3 py-2">{l.ok ? <Badge tone="ok">Sent</Badge> : <><Badge tone="error">Failed</Badge><div className="text-xs text-a-red mt-1 break-all">{l.error}</div></>}</td>
              </tr>))}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
