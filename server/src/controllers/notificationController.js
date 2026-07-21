import { notificationService } from "../services/notificationService.js";

export const notificationController = {
  async listNotifications(req, res, next) {
    try {
      res.json(await notificationService.listNotifications(req.user.id));
    } catch (error) {
      next(error);
    }
  },

  async retryNotification(req, res, next) {
    try {
      res.json(await notificationService.retryNotification(req.params.id));
    } catch (error) {
      next(error);
    }
  },
};
