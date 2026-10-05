export type Account = {
  accountId: number;
  fullName: string;
  email: string;
  role: number;
  createdDate: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  account: Account;
};

const STORAGE_KEY = "tasktrack.ass2.session";

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveStoredSession(session: AuthSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("tasktrack:session", { detail: session }));
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("tasktrack:session", { detail: null }));
}

export function isSessionExpired(session: AuthSession, bufferSeconds = 10) {
  return new Date(session.expiresAt).getTime() <= Date.now() + bufferSeconds * 1000;
}
