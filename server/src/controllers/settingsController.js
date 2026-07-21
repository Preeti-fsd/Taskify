import { settingsService } from "../services/settingsService.js";

export const settingsController = {
  async getSettings(req, res, next) {
    try {
      res.json(await settingsService.getSettings(req.user.id, req.user.email));
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req, res, next) {
    try {
      res.json(await settingsService.updateSettings(req.user.id, req.body, req.user.email));
    } catch (error) {
      next(error);
    }
  },
};
