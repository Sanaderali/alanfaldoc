"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hides its children on the given paths (regex sources), e.g. pages that already show their own call-to-action. */
export default function HideOn({ patterns, children }: { patterns: string[]; children: ReactNode }) {
  const path = usePathname();
  return patterns.some((p) => new RegExp(p).test(path)) ? null : <>{children}</>;
}
