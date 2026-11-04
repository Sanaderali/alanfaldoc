import { requirePerm } from "@/lib/auth";
import { PageHeader } from "../../../ui";
import UserForm from "../../_ui/UserForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePerm("users.manage");
  return (
    <>
      <PageHeader title="Add New User" />
      <UserForm />
    </>
  );
}
