"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

const publicItems = [
  { label: "Departments", href: "/departments", icon: "departments" },
  { label: "Search Tasks", href: "/search", icon: "search" },
];

function NavIcon({ name }: { name: string }) {
  if (name === "search") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>;
  if (name === "manage") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h6v6H4zM14 5.5h6v6h-6zM4 15.5h6v3H4zM14 15.5h6v3h-6z" /></svg>;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { account, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = account ? [...publicItems, { label: "Workspace", href: "/admin", icon: "manage" }] : publicItems;
  const isActive = (href: string) => href === "/departments" ? pathname.startsWith("/departments") : pathname === href || (href === "/admin" && pathname.startsWith("/admin"));

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="site-header sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="nav-glow" aria-hidden="true" />
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" className="brand-link group" aria-label="TaskTrack home" onClick={() => setMenuOpen(false)}><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span className="brand-word">Task<span>Track</span></span></Link>
        <div className="hidden items-center gap-3 md:flex">
          <nav className="nav-desktop" aria-label="Primary navigation">{navItems.map((item) => { const active = isActive(item.href); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`nav-link ${active ? "nav-link-active" : ""}`}><span className="nav-icon"><NavIcon name={item.icon} /></span>{item.label}<span className="nav-active-dot" aria-hidden="true" /></Link>; })}</nav>
          {!loading && (account ? <div className="flex items-center gap-2"><Link href="/profile" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm"><span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-100 text-xs text-indigo-700">{account.fullName.charAt(0).toUpperCase()}</span><span className="max-w-28 truncate">{account.fullName}</span></Link><button onClick={() => logout()} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900">Logout</button></div> : <div className="flex items-center gap-1"><Link href="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600">Login</Link><Link href="/register" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:text-white">Register</Link></div>)}
        </div>
        <button type="button" className={`nav-toggle ${menuOpen ? "nav-toggle-open" : ""}`} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen((current) => !current)}><span /><span /><span /></button>
      </div>
      <div id="mobile-navigation" className={`nav-mobile ${menuOpen ? "nav-mobile-open" : ""}`} aria-hidden={!menuOpen} inert={!menuOpen}><nav className="mx-auto grid w-full max-w-7xl gap-1 px-4 pb-4" aria-label="Mobile navigation">{navItems.map((item) => { const active = isActive(item.href); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`nav-mobile-link ${active ? "nav-mobile-link-active" : ""}`} onClick={() => setMenuOpen(false)}><span className="nav-icon"><NavIcon name={item.icon} /></span><span className="flex-1">{item.label}</span><span aria-hidden="true">→</span></Link>; })}{!loading && (account ? <><Link href="/profile" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Profile <span className="ml-auto text-xs text-slate-400">{account.fullName}</span></Link><button onClick={() => { setMenuOpen(false); logout(); }} className="nav-mobile-link text-left text-red-600">Logout</button></> : <><Link href="/login" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Login</Link><Link href="/register" className="nav-mobile-link bg-indigo-50 text-indigo-700" onClick={() => setMenuOpen(false)}>Register</Link></>)}</nav></div>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6">{children}</main>
  </div>;
}
