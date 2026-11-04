import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PageHeader } from "../../ui";
import ChatInbox from "../_ui/ChatInbox";

export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await requirePerm("chat.view");
  return (
    <>
      <PageHeader title="Live Chat" subtitle="Visitors chat with only a phone number, no account. New chats play a sound and appear here instantly." />
      <ChatInbox canReply={can(me, "chat.reply")} />
    </>
  );
}
