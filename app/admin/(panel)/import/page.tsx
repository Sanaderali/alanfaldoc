import { redirect } from "next/navigation";

/** The import tool now lives under Import / Export. */
export default function Page() {
  redirect("/admin/data?tab=import");
}
