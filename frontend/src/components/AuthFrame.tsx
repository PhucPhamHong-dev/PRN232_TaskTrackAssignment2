import Link from "next/link";

export function AuthFrame({ title, eyebrow, description, children, footer }: { title: string; eyebrow: string; description: string; children: React.ReactNode; footer: React.ReactNode }) {
  return <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-8 text-slate-900">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,.38),transparent_28%),radial-gradient(circle_at_85%_75%,rgba(168,85,247,.3),transparent_30%)]" />
    <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-white shadow-2xl shadow-indigo-950/40 lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="relative"><Link href="/" className="inline-flex items-center gap-3 text-white hover:text-white"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur">✓</span><span className="text-xl font-black tracking-tight">TaskTrack</span></Link></div>
        <div className="relative max-w-lg"><p className="text-sm font-bold uppercase tracking-[.2em] text-indigo-200">Secure workspace</p><h2 className="mt-5 text-5xl font-black leading-[1.05] tracking-[-.04em]">Plan clearly.<br />Deliver confidently.</h2><p className="mt-6 max-w-md text-base leading-7 text-indigo-100/85">One polished workspace for departments, projects, tasks, tags, and role-based collaboration.</p></div>
        <div className="relative flex gap-3 text-xs font-semibold text-indigo-100"><span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">JWT protected</span><span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Role aware</span></div>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14"><div className="w-full max-w-md"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 lg:hidden">← Back to TaskTrack</Link><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">{eyebrow}</p><h1 className="mt-3 text-4xl font-black tracking-[-.04em] text-slate-950">{title}</h1><p className="mt-3 leading-7 text-slate-500">{description}</p><div className="mt-8">{children}</div><div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">{footer}</div></div></section>
    </div>
  </main>;
}
