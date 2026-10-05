"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Shell as PublicShell } from "@/components/Shell";

export function Shell({ children }: { children: React.ReactNode }) {
  return <PublicShell><AuthGuard>{children}</AuthGuard></PublicShell>;
}
