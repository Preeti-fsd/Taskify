import { request } from "./http";
import type { AuthSession } from "../types/auth";

export const authApi = {
  signup: (payload: { name: string; email: string; password: string }) =>
    request<{ user: AuthSession["user"]; verificationRequired: boolean; message: string }>(
      "/api/auth/signup",
      { method: "POST", body: JSON.stringify(payload), auth: false },
    ),

  verifyOtp: (payload: { email: string; otp: string }) =>
    request<AuthSession>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthSession>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),

  forgotPassword: (payload: { email: string }) =>
    request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),

  resetPassword: (payload: { token: string; password: string }) =>
    request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),

  me: () => request<{ role: string; id: string; email: string; name: string | null }>("/api/auth/me"),
};
