import { notificationRepository } from "../repositories/notificationRepository.js";
import { AppError } from "../errors/AppError.js";

const mapNotification = (notification) => ({
  id: notification.id,
  userId: notification.user_id,
  event: notification.event,
  category: notification.category,
  title: notification.title,
  message: notification.message,
  status: notification.status,
  metadata:
    !notification.metadata_json
      ? {}
      : typeof notification.metadata_json === "object"
        ? notification.metadata_json
        : JSON.parse(notification.metadata_json),
  scheduledFor: notification.scheduled_for || null,
  sentAt: notification.sent_at || null,
  retryCount: notification.retry_count,
  createdAt: notification.created_at,
  updatedAt: notification.updated_at,
});

export const notificationService = {
  async listNotifications(userId) {
    const notifications = await notificationRepository.listByUserId(userId, 200);
    return notifications.map(mapNotification);
  },

  async createNotification(payload) {
    const notification = await notificationRepository.create(payload);
    return notification ? mapNotification(notification) : null;
  },

  async retryNotification(id) {
    const notification = await notificationRepository.findById(id);
    if (!notification) throw new AppError("Notification not found.", 404);
    return notificationRepository.markScheduled(id);
  },
};
