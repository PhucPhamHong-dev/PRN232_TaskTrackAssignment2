"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/AuthFrame";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await login(email, password);
      const requested = new URLSearchParams(window.location.search).get("returnUrl");
      router.replace(requested?.startsWith("/") ? requested : "/admin");
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  };

  return <AuthFrame title="Welcome back" eyebrow="Sign in" description="Use your TaskTrack account to continue to the protected management workspace." footer={<>New to TaskTrack? <Link href="/register" className="font-bold text-indigo-600">Create a Staff account</Link></>}>
    <form onSubmit={submit} className="space-y-5">
      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      <label className="block text-sm font-bold text-slate-700">Email address<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="you@example.com" /></label>
      <label className="block text-sm font-bold text-slate-700">Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="Enter your password" /></label>
      <button disabled={busy} className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60">{busy ? "Signing in..." : "Sign in to workspace"}</button>
    </form>
  </AuthFrame>;
}
