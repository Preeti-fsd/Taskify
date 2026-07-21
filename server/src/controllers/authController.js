import { authService } from "../services/authService.js";

const respond = (res, payload) => {
  res.json(payload);
};

export const authController = {
  async signup(req, res, next) {
    try {
      respond(res, await authService.signup(req.body));
    } catch (error) {
      next(error);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      respond(res, await authService.verifyOtp(req.body));
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      respond(res, await authService.login(req.body));
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      respond(res, await authService.forgotPassword(req.body));
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      respond(res, await authService.resetPassword(req.body));
    } catch (error) {
      next(error);
    }
  },

  async adminLogin(req, res, next) {
    try {
      respond(res, await authService.adminLogin(req.body));
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const role = req.user.role;
      res.json({
        role,
        id: req.user.sub,
        email: req.user.email,
        name: req.user.name || null,
      });
    } catch (error) {
      next(error);
    }
  },
};
