import { AppError } from "../errors/AppError.js";
import { verifyToken } from "../utils/security.js";

const getToken = (req) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice(7);
};

export const requireAuth = (req, _res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      throw new AppError("Authentication required.", 401);
    }

    const payload = verifyToken(token);
    if (payload.role !== "user" && payload.role !== "admin") {
      throw new AppError("Invalid session.", 401);
    }

    req.user = {
      ...payload,
      id: payload.id || payload.sub,
      userId: payload.userId || payload.sub,
    };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Authentication required.", 401));
  }
};

export const requireUser = (req, res, next) => {
  requireAuth(req, res, (error) => {
    if (error) return next(error);
    if (req.user?.role !== "user" && req.user?.role !== "admin") {
      return next(new AppError("User access required.", 403));
    }
    return next();
  });
};

export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, (error) => {
    if (error) return next(error);
    if (req.user?.role !== "admin") {
      return next(new AppError("Admin access required.", 403));
    }
    return next();
  });
};
