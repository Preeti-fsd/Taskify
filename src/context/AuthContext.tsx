import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthRole, AuthSession, AuthUser } from "../types/auth";
import { authApi } from "../services/authApi";

interface AuthContextType {
  session: AuthSession | null;
  user: AuthUser | null;
  role: AuthRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  signup: (name: string, email: string, password: string) => Promise<{
    user: AuthUser;
    verificationRequired: boolean;
    message: string;
  }>;
  verifyOtp: (email: string, otp: string) => Promise<AuthSession>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<string>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  setSessionData: (session: AuthSession | null) => void;
}

const STORAGE_KEY = "taskify-session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readSession = (): AuthSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

const writeSession = (session: AuthSession | null) => {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readSession();
    if (!stored) {
      setLoading(false);
      return;
    }

    void authApi
      .me()
      .then(() => {
        setSession(stored);
      })
      .catch(() => {
        setSession(null);
        writeSession(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const setSessionData = useCallback((nextSession: AuthSession | null) => {
    setSession(nextSession);
    writeSession(nextSession);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthSession> => {
    const next = await authApi.login({ email, password });
    setSessionData(next);
    return next;
  }, [setSessionData]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    return authApi.signup({ name, email, password });
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string): Promise<AuthSession> => {
    const next = await authApi.verifyOtp({ email, otp });
    setSessionData(next);
    return next;
  }, [setSessionData]);

  const forgotPassword = useCallback(async (email: string) => {
    const result = await authApi.forgotPassword({ email });
    return result.message;
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    const result = await authApi.resetPassword({ token, password });
    return result.message;
  }, []);

  const logout = useCallback(() => {
    setSessionData(null);
  }, [setSessionData]);

  const refreshSession = useCallback(async () => {
    const stored = readSession();
    if (!stored) {
      setSession(null);
      return;
    }

    try {
      await authApi.me();
      setSession(stored);
    } catch {
      setSessionData(null);
    }
  }, [setSessionData]);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user: session?.user || null,
      role: session?.role || null,
      loading,
      login,
      signup,
      verifyOtp,
      forgotPassword,
      resetPassword,
      logout,
      refreshSession,
      setSessionData,
    }),
    [forgotPassword, loading, login, refreshSession, resetPassword, session, setSessionData, signup, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
