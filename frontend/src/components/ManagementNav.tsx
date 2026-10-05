"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const items = [
  ["Overview", "/admin", "⌂"],
  ["Departments", "/admin/departments", "▦"],
  ["Projects", "/admin/projects", "◇"],
  ["Tasks", "/admin/tasks", "✓"],
  ["Tags", "/admin/tags", "#"],
];

export function ManagementNav() {
  const pathname = usePathname();
  const { account } = useAuth();
  const visible = account?.role === 1 ? [...items, ["Accounts", "/admin/accounts", "◎"]] : items;
  return <div className="admin-nav mb-8 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm backdrop-blur"><div className="flex min-w-max gap-1">{visible.map(([label, href, icon]) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:text-white" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"}`}><span className={`grid h-6 w-6 place-items-center rounded-lg text-xs ${active ? "bg-white/15" : "bg-slate-100 group-hover:bg-white"}`}>{icon}</span>{label}</Link>; })}</div></div>;
}
