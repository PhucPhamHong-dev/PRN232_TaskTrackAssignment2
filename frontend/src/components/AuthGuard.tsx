"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function AuthGuard({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { account, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!account) router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    else if (adminOnly && account.role !== 1) router.replace("/admin");
  }, [account, adminOnly, loading, pathname, router]);

  if (loading || !account || (adminOnly && account.role !== 1)) {
    return <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" /><p className="mt-4 text-sm font-semibold text-slate-500">Checking your secure session...</p></div></div>;
  }
  return children;
}
