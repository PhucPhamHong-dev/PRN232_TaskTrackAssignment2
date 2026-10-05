"use client";

import { useEffect } from "react";

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", listener);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", listener); document.body.style.overflow = ""; };
  }, [onClose, open]);
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  useEscape(open, onClose);
  if (!open) return null;
  return <div className="dialog-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={onClose}><div role="dialog" aria-modal="true" aria-label={title} className="dialog-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-white/50 bg-white shadow-2xl shadow-slate-950/30" onMouseDown={(event) => event.stopPropagation()}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-5 backdrop-blur"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-indigo-600">TaskTrack workspace</p><h2 className="mt-1 text-xl font-black tracking-tight">{title}</h2></div><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-10 w-10 place-items-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900">×</button></div><div className="p-6">{children}</div></div></div>;
}

export function ConfirmDialog({ open, title, message, busy, onCancel, onConfirm }: { open: boolean; title: string; message: string; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  useEscape(open && !busy, onCancel);
  if (!open) return null;
  return <div className="dialog-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"><div role="alertdialog" aria-modal="true" aria-label={title} className="dialog-panel w-full max-w-md rounded-[1.75rem] border border-white/50 bg-white p-7 shadow-2xl"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-xl text-red-600">!</div><h2 className="mt-5 text-2xl font-black tracking-tight">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{message}</p><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Cancel</button><button type="button" onClick={onConfirm} disabled={busy} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:opacity-50">{busy ? "Deleting..." : "Delete"}</button></div></div></div>;
}
