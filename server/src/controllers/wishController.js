import { wishService } from "../services/wishService.js";

export const wishController = {
  async listWishes(req, res, next) {
    try {
      res.json(await wishService.listWishes(req.user.id));
    } catch (error) {
      next(error);
    }
  },

  async createWish(req, res, next) {
    try {
      res.status(201).json(await wishService.createWish(req.user.id, req.body));
    } catch (error) {
      next(error);
    }
  },

  async updateWish(req, res, next) {
    try {
      res.json(await wishService.updateWish(req.user.id, req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  },

  async cancelWish(req, res, next) {
    try {
      res.json(await wishService.cancelWish(req.user.id, req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async sendWishNow(req, res, next) {
    try {
      res.json(await wishService.sendWishNow(req.user.id, req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async processDue(req, res, next) {
    try {
      res.json(await wishService.processDueWishes());
    } catch (error) {
      next(error);
    }
  },
};
