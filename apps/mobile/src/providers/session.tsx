import * as SecureStore from "expo-secure-store";
import { createContext, use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { apiFetch } from "@/lib/api";
import type { AuthPayload, User } from "@/types";

const STORAGE_KEY = "queuemate.mobile.session";

type Credentials = { email: string; password: string };
type Registration = Credentials & {
  fullName: string;
  mobile: string;
  passwordConfirmation: string;
  acceptTerms: true;
  acceptPrivacy: true;
};

type SessionContextValue = {
  loading: boolean;
  token: string | null;
  user: User | null;
  signIn: (credentials: Credentials) => Promise<void>;
  register: (registration: Registration) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const saveSession = useCallback(async (payload: AuthPayload) => {
    if (payload.user.role === "ADMIN") throw new Error("Administrators should use the secure web portal.");
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ token: payload.token, expiresAt: payload.expiresAt }));
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!saved) return;
        const session = JSON.parse(saved) as { token?: string; expiresAt?: string };
        if (!session.token || !session.expiresAt || new Date(session.expiresAt) <= new Date()) return;
        const current = await apiFetch<User>("/auth/me", { token: session.token });
        if (current.role === "ADMIN") return;
        setToken(session.token);
        setUser(current);
      } catch {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (credentials: Credentials) => {
    const payload = await apiFetch<AuthPayload>("/auth/mobile/login", { method: "POST", body: JSON.stringify(credentials) });
    await saveSession(payload);
  }, [saveSession]);

  const register = useCallback(async (registration: Registration) => {
    const payload = await apiFetch<AuthPayload>("/auth/mobile/register", { method: "POST", body: JSON.stringify(registration), timeoutMs: 35_000 });
    await saveSession(payload);
  }, [saveSession]);

  const signOut = useCallback(async () => {
    try {
      if (token) await apiFetch("/auth/logout", { method: "POST", token });
    } finally {
      await clearSession();
    }
  }, [clearSession, token]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    setUser(await apiFetch<User>("/auth/me", { token }));
  }, [token]);

  const value = useMemo(() => ({ loading, token, user, signIn, register, signOut, refreshUser }), [loading, token, user, signIn, register, signOut, refreshUser]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = use(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
