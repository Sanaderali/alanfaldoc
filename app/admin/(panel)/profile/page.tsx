import { requireUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/rbac";
import { PageHeader } from "../../ui";
import ProfileForm from "../_ui/ProfileForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  const u = await requireUser();
  return (
    <>
      <PageHeader title="My profile" />
      <ProfileForm initial={{ name: u.name, email: u.email, username: u.username, role: ROLE_LABEL[u.role] }} />
    </>
  );
}
