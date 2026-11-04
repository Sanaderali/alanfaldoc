import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { PERMISSIONS, ROLES, ROLE_LABEL, ROLE_PERMISSIONS } from "@/lib/rbac";
import { readAll } from "@/lib/store";
import { Badge, Empty, PageHeader, wpDate } from "../../ui";
import UserActiveButton from "../_ui/UserActiveButton";

export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await requirePerm("users.manage");
  const users = (await readAll("users")).sort((a, b) => a.name.localeCompare(b.name));
  const roleCount = (r: string) => users.filter((u) => u.role === r).length;
  return (
    <>
      <PageHeader title="Team" addNew={{ href: "/admin/users/new", label: "Add New User" }} />
      <p className="text-[13px] text-a-muted mb-3 flex flex-wrap gap-x-3">{ROLES.map((r) => <span key={r}>{ROLE_LABEL[r]} <span className="text-a-subtle">({roleCount(r)})</span></span>)}</p>

      <div className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] overflow-x-auto mb-8">
        {users.length === 0 ? <Empty>No users yet.</Empty> : (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left border-b border-a-line"><th className="px-3 py-2.5 font-normal">Name</th><th className="px-3 py-2.5 font-normal">Username</th><th className="px-3 py-2.5 font-normal">Email</th><th className="px-3 py-2.5 font-normal">Role</th><th className="px-3 py-2.5 font-normal">Status</th><th className="px-3 py-2.5 font-normal">Last login</th></tr></thead>
            <tbody>
              {users.map((u, n) => (
                <tr key={u.id} className={`group align-top ${n % 2 ? "bg-a-surface" : "bg-a-raised"}`}>
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/users/${u.id}`} className="font-semibold text-[14px] text-brand-text">{u.name}</Link>{u.id === me.id && <span className="text-a-subtle"> (you)</span>}
                    <div className="mt-1 flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity">
                      <Link href={`/admin/users/${u.id}`} className="text-brand-text hover:underline">Edit</Link><span className="text-a-subtle">|</span>
                      <UserActiveButton id={u.id} active={u.active} disabled={u.id === me.id} />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-a-muted">{u.username}</td>
                  <td className="px-3 py-2.5 text-a-muted">{u.email || "-"}</td>
                  <td className="px-3 py-2.5">{ROLE_LABEL[u.role]}{u.extraPermissions?.length ? <span className="text-a-subtle"> +{u.extraPermissions.length}</span> : null}</td>
                  <td className="px-3 py-2.5">{u.active ? <Badge tone="ok">Active</Badge> : <Badge tone="error">Deactivated</Badge>}</td>
                  <td className="px-3 py-2.5 text-a-muted whitespace-nowrap">{u.lastLoginAt ? wpDate(u.lastLoginAt) : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="text-[16px] font-semibold mb-3">Roles & permissions</h2>
      <div className="bg-a-surface border border-a-line shadow-[0_1px_1px_rgba(0,0,0,.04)] overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left border-b border-a-line"><th className="px-3 py-2.5 font-normal">Permission</th>{ROLES.map((r) => <th key={r} className="px-3 py-2.5 font-normal text-center">{ROLE_LABEL[r]}</th>)}</tr></thead>
          <tbody>
            {PERMISSIONS.map((p, n) => (
              <tr key={p.key} className={n % 2 ? "bg-a-surface" : "bg-a-raised"}>
                <td className="px-3 py-2">{p.label}</td>
                {ROLES.map((r) => <td key={r} className="px-3 py-2 text-center">{ROLE_PERMISSIONS[r].includes(p.key) ? <span className="text-brand" aria-label="allowed">✓</span> : <span className="text-a-subtle" aria-label="not allowed">·</span>}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
