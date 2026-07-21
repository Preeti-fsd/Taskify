export type AuthRole = "user" | "admin";

export interface AuthUser {
  id: string;
  name?: string | null;
  email: string;
  verified?: boolean;
}

export interface AuthSession {
  token: string;
  role: AuthRole;
  user: AuthUser;
}
