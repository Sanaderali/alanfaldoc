import { requireAdmin } from "@/lib/auth";
import { site } from "@/data/site";
import Icon from "@/app/components/Icon";
import AdminShell from "../AdminShell";
import { logout } from "../actions-auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // protects every admin page below
  const item = "flex w-full items-center gap-2 px-4 py-1.5 text-left text-[13px] text-[#f0f0f1] hover:text-[#72aee6]";
  return (
    <AdminShell
      user={process.env.ADMIN_USER ?? "admin"}
      siteName={site.name}
      backup={<a href="/admin/api/export" download className={item}><Icon name="download" className="text-[#a7aaad]" />Download backup</a>}
      logout={<form action={logout}><button className={item}><Icon name="right-from-bracket" className="text-[#a7aaad]" />Log Out</button></form>}
    >
      {children}
    </AdminShell>
  );
}
