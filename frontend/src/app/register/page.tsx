"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/AuthFrame";
import { useAuth } from "@/components/AuthProvider";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function RegisterPage() {
  const { register } = useAuth(); const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!passwordPattern.test(form.password)) return setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special characters.");
    setBusy(true);
    try { await register({ fullName: form.fullName, email: form.email, password: form.password }); setSuccess("Account created. Redirecting to sign in..."); window.setTimeout(() => router.replace("/login"), 850); }
    catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  };
  const input = "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";
  return <AuthFrame title="Create your account" eyebrow="Staff registration" description="Join the workspace as a Staff member. Administrator access is assigned separately." footer={<>Already have an account? <Link href="/login" className="font-bold text-indigo-600">Sign in</Link></>}>
    <form onSubmit={submit} className="space-y-4">
      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}
      <label className="block text-sm font-bold text-slate-700">Full name<input required minLength={2} maxLength={150} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={input} /></label>
      <label className="block text-sm font-bold text-slate-700">Email address<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-slate-700">Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} /></label><label className="block text-sm font-bold text-slate-700">Confirm password<input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={input} /></label></div>
      <p className="text-xs leading-5 text-slate-500">Use 8+ characters with uppercase, lowercase, a number, and a special character.</p>
      <button disabled={busy || !!success} className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{busy ? "Creating account..." : "Create Staff account"}</button>
    </form>
  </AuthFrame>;
}
