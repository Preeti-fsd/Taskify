import { authRepository } from "../repositories/authRepository.js";
import { emailLogRepository } from "../repositories/emailLogRepository.js";

export const adminController = {
  async listUsers(req, res, next) {
    try {
      const search = String(req.query.search || "").trim();
      const [users, total, emailLogs] = await Promise.all([
        authRepository.listUsers(search),
        authRepository.countUsers(),
        emailLogRepository.listRecent(25),
      ]);
      const loggedInUsers = users.filter((user) => user.last_login_at);

      res.json({
        total,
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          verified: Boolean(user.verified),
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at || null,
        })),
        recentUsers: users.slice(0, 5).map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          verified: Boolean(user.verified),
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at || null,
        })),
        loggedInUsers: loggedInUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          verified: Boolean(user.verified),
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at || null,
        })),
        emailLogs,
      });
    } catch (error) {
      next(error);
    }
  },
};
