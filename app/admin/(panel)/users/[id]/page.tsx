import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { PageHeader } from "../../../ui";
import UserForm from "../../_ui/UserForm";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePerm("users.manage");
  const { id } = await params;
  const u = (await readAll("users")).find((x) => x.id === id);
  if (!u) notFound();
  return (
    <>
      <PageHeader title="Edit User" addNew={{ href: "/admin/users/new", label: "Add New User" }} />
      <UserForm key={id} id={id} isSelf={me.id === id} initial={{ name: u.name, username: u.username, email: u.email, role: u.role, active: u.active, extraPermissions: u.extraPermissions ?? [] }} />
    </>
  );
}
