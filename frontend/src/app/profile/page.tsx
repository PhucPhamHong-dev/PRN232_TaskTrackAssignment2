"use client";

import { FormEvent, useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { Shell } from "@/components/Shell";
import { changePassword, getProfile, updateProfile } from "@/lib/api";

export default function ProfilePage() {
  return <Shell><AuthGuard><ProfileContent /></AuthGuard></Shell>;
}

function ProfileContent() {
  const { account, updateAccount, logout } = useAuth();
  const [fullName, setFullName] = useState(account?.fullName || "");
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { getProfile().then((profile) => { updateAccount(profile); setFullName(profile.fullName); }).catch(() => undefined); }, [updateAccount]);
  const saveName = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setMessage(null); try { const updated = await updateProfile(fullName); updateAccount(updated); setMessage({ text: "Profile updated successfully." }); } catch (error) { setMessage({ text: (error as Error).message, error: true }); } finally { setSaving(false); } };
  const savePassword = async (event: FormEvent) => { event.preventDefault(); setMessage(null); if (passwords.next !== passwords.confirm) return setMessage({ text: "New passwords do not match.", error: true }); setSaving(true); try { await changePassword(passwords.current, passwords.next); setMessage({ text: "Password changed. Please sign in again." }); window.setTimeout(() => logout(), 900); } catch (error) { setMessage({ text: (error as Error).message, error: true }); } finally { setSaving(false); } };
  const input = "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";
  return <div className="mx-auto max-w-4xl"><div className="mb-8"><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">Your account</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Profile settings</h1><p className="mt-2 text-slate-500">Update your identity and keep your account secure.</p></div>{message && <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-bold ${message.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message.text}</div>}<div className="grid gap-6 lg:grid-cols-2"><form onSubmit={saveName} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-xl font-black">Personal information</h2><p className="mt-1 text-sm text-slate-500">Role: {account?.role === 1 ? "Administrator" : "Staff"}</p><label className="mt-6 block text-sm font-bold">Full name<input className={input} required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)} /></label><label className="mt-4 block text-sm font-bold">Email<input className={`${input} text-slate-400`} disabled value={account?.email || ""} /></label><button disabled={saving} className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Save profile</button></form><form onSubmit={savePassword} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-xl font-black">Change password</h2><p className="mt-1 text-sm text-slate-500">All refresh tokens are revoked after this change.</p><label className="mt-6 block text-sm font-bold">Current password<input type="password" className={input} required value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} /></label><label className="mt-4 block text-sm font-bold">New password<input type="password" className={input} required minLength={8} value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} /></label><label className="mt-4 block text-sm font-bold">Confirm new password<input type="password" className={input} required value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></label><button disabled={saving} className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Update password</button></form></div></div>;
}
