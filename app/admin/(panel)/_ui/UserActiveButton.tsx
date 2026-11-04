"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserActive } from "../users-actions";

export default function UserActiveButton({ id, active, disabled }: { id: string; active: boolean; disabled?: boolean }) {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  return (
    <span>
      <button type="button" disabled={pending || disabled} onClick={() => start(async () => { const r = await setUserActive(id, !active); if (!r.ok) setErr(r.message ?? "Error"); else { setErr(""); router.refresh(); } })} className={`${active ? "text-a-red" : "text-brand-text"} hover:underline disabled:opacity-40 disabled:no-underline`}>
        {active ? "Deactivate" : "Activate"}
      </button>
      {err && <span role="alert" className="ml-2 text-xs text-a-red">{err}</span>}
    </span>
  );
}
