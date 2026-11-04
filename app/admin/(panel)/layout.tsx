import { requireUser } from "@/lib/auth";
import { site } from "@/data/site";
import Icon from "@/app/components/Icon";
import { permissionsOf, ROLE_LABEL } from "@/lib/rbac";
import AdminShell from "../AdminShell";
import { logout } from "../actions-auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(); // protects every admin page below; each page also checks its own permission
  const item = "flex w-full items-center gap-2 px-4 py-1.5 text-left text-[13px] text-a-text hover:text-brand";
  return (
    <AdminShell
      user={user.name || user.username}
      roleLabel={ROLE_LABEL[user.role]}
      perms={[...permissionsOf(user)]}
      siteName={site.name}
      backup={<a href="/admin/api/export" download className={item}><Icon name="download" className="text-a-subtle" />Download backup</a>}
      logout={<form action={logout}><button className={item}><Icon name="right-from-bracket" className="text-a-subtle" />Log Out</button></form>}
    >
      {children}
    </AdminShell>
  );
}
