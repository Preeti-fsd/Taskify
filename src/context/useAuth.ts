import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthRole, AuthSession, AuthUser } from "../types/auth";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context) {
    return context;
  }

  const fallback: {
    session: AuthSession | null;
    user: AuthUser | null;
    role: AuthRole | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthSession>;
    signup: (name: string, email: string, password: string) => Promise<{ user: AuthUser; verificationRequired: boolean; message: string }>;
    verifyOtp: (email: string, otp: string) => Promise<AuthSession>;
    forgotPassword: (email: string) => Promise<string>;
    resetPassword: (token: string, password: string) => Promise<string>;
    logout: () => void;
    refreshSession: () => Promise<void>;
    setSessionData: () => void;
  } = {
    session: null,
    user: null,
    role: null,
    loading: false,
    login: async () => ({ token: "", role: "user", user: { id: "", email: "" } }),
    signup: async () => ({ user: { id: "", email: "" }, verificationRequired: true, message: "" }),
    verifyOtp: async () => ({ token: "", role: "user", user: { id: "", email: "" } }),
    forgotPassword: async () => "",
    resetPassword: async () => "",
    logout: () => {},
    refreshSession: async () => {},
    setSessionData: () => {},
  };

  return fallback;
};
