import { request } from "./http";
import type { NotificationEvent } from "../types/notification";

export const notificationApi = {
  listNotifications: () => request<NotificationEvent[]>("/api/notifications"),
  retryNotification: (id: number | string) =>
    request<NotificationEvent>(`/api/notifications/${id}/retry`, {
      method: "POST",
    }),
};
