"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Account, AuthSession, clearStoredSession, getStoredSession, isSessionExpired, saveStoredSession } from "@/lib/auth-storage";
import { loginAccount, logoutAccount, refreshAuthSession, registerAccount, RegisterInput } from "@/lib/api";

type AuthContextValue = {
  session: AuthSession | null;
  account: Account | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  register: (input: RegisterInput) => Promise<Account>;
  logout: () => Promise<void>;
  updateAccount: (account: Account) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const stored = getStoredSession();
      if (!stored) { if (active) setLoading(false); return; }
      if (!isSessionExpired(stored)) {
        if (active) { setSession(stored); setLoading(false); }
        return;
      }
      try {
        const refreshed = await refreshAuthSession();
        if (active) setSession(refreshed);
      } catch {
        if (active) setSession(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    initialize();
    const sync = (event: Event) => setSession((event as CustomEvent<AuthSession | null>).detail);
    const unauthorized = (event: Event) => {
      const returnUrl = (event as CustomEvent<string>).detail || "/admin";
      setSession(null);
      router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    };
    window.addEventListener("tasktrack:session", sync);
    window.addEventListener("tasktrack:unauthorized", unauthorized);
    window.addEventListener("storage", initialize);
    return () => { active = false; window.removeEventListener("tasktrack:session", sync); window.removeEventListener("tasktrack:unauthorized", unauthorized); window.removeEventListener("storage", initialize); };
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    const next = await loginAccount({ email, password });
    saveStoredSession(next);
    setSession(next);
    return next;
  }, []);

  const register = useCallback((input: RegisterInput) => registerAccount(input), []);

  const logout = useCallback(async () => {
    const current = getStoredSession();
    if (current?.refreshToken) await logoutAccount(current.refreshToken).catch(() => undefined);
    clearStoredSession();
    setSession(null);
    router.replace("/");
    router.refresh();
  }, [router]);

  const updateAccount = useCallback((account: Account) => {
    const current = getStoredSession();
    if (!current) return;
    const next = { ...current, account };
    saveStoredSession(next);
    setSession(next);
  }, []);

  const value = useMemo(() => ({ session, account: session?.account || null, loading, login, register, logout, updateAccount }), [session, loading, login, register, logout, updateAccount]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
