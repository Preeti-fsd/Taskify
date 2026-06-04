import { request } from "./http";
import type { UserSettings } from "../types/settings";

export const settingsApi = {
  getSettings: () => request<UserSettings>("/api/settings"),
  updateSettings: (payload: Partial<UserSettings> & { notificationEmail?: string | null }) =>
    request<UserSettings>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
