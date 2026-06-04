import { request } from "./http";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export const adminApi = {
  listUsers: (search = "") =>
    request<{
      total: number;
      users: AdminUserRow[];
      recentUsers: AdminUserRow[];
      loggedInUsers: AdminUserRow[];
      emailLogs: unknown[];
    }>(
      `/api/admin/users?search=${encodeURIComponent(search)}`,
    ),
};
