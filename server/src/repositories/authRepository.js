import { execute, query } from "../config/db.js";

export const authRepository = {
  async listUsers(search = "") {
    const like = `%${search}%`;
    return query(
      `SELECT id, name, email, verified, created_at, last_login_at
         FROM users
        WHERE (? = '' OR name LIKE ? OR email LIKE ?)
        ORDER BY created_at DESC`,
      [search, like, like],
    );
  },

  async countUsers() {
    const rows = await query(`SELECT COUNT(*) AS total FROM users`);
    return Number(rows[0]?.total || 0);
  },

  async findUserByEmail(email) {
    const rows = await query(
      `SELECT id, name, email, password_hash, verified, otp_hash, otp_expires_at,
              password_reset_token_hash, password_reset_expires_at, created_at
         FROM users
        WHERE email = ?
        LIMIT 1`,
      [email],
    );

    return rows[0] || null;
  },

  async findUserById(id) {
    const rows = await query(
      `SELECT id, name, email, verified, created_at, last_login_at
         FROM users
        WHERE id = ?
        LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  },

  async createUser({ name, email, passwordHash, otpHash, otpExpiresAt }) {
    const result = await execute(
      `INSERT INTO users
        (name, email, password_hash, verified, otp_hash, otp_expires_at, created_at, updated_at)
       VALUES (?, ?, ?, 0, ?, ?, NOW(), NOW())`,
      [name, email, passwordHash, otpHash, otpExpiresAt],
    );

    return this.findUserById(result.insertId);
  },

  async upsertVerifiedUser({ name, email, passwordHash }) {
    const result = await execute(
      `INSERT INTO users
        (name, email, password_hash, verified, created_at, updated_at)
       VALUES (?, ?, ?, 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         verified = 1,
         updated_at = NOW()`,
      [name, email, passwordHash],
    );

    return this.findUserById(result.insertId || (await this.findUserByEmail(email))?.id);
  },

  async markUserVerified(email) {
    await execute(
      `UPDATE users
          SET verified = 1,
              otp_hash = NULL,
              otp_expires_at = NULL,
              updated_at = NOW()
        WHERE email = ?`,
      [email],
    );
  },

  async updateLastLogin(email) {
    await execute(
      `UPDATE users
          SET last_login_at = NOW(),
              updated_at = NOW()
        WHERE email = ?`,
      [email],
    );
  },

  async updateUserPassword(email, passwordHash) {
    await execute(
      `UPDATE users
          SET password_hash = ?,
              password_reset_token_hash = NULL,
              password_reset_expires_at = NULL,
              updated_at = NOW()
        WHERE email = ?`,
      [passwordHash, email],
    );
  },

  async storeResetToken(email, tokenHash, expiresAt) {
    await execute(
      `UPDATE users
          SET password_reset_token_hash = ?,
              password_reset_expires_at = ?,
              updated_at = NOW()
        WHERE email = ?`,
      [tokenHash, expiresAt, email],
    );
  },

  async verifyOtp(email, otpHash) {
    const rows = await query(
      `SELECT id
         FROM users
        WHERE email = ?
          AND otp_hash = ?
          AND otp_expires_at >= NOW()
        LIMIT 1`,
      [email, otpHash],
    );

    return Boolean(rows[0]);
  },

  async verifyPasswordResetToken(tokenHash) {
    const rows = await query(
      `SELECT id, email
         FROM users
        WHERE password_reset_token_hash = ?
          AND password_reset_expires_at >= NOW()
        LIMIT 1`,
      [tokenHash],
    );

    return rows[0] || null;
  },
};

export const adminRepository = {
  async findAdminByEmail(email) {
    const rows = await query(
      `SELECT id, email, password_hash
         FROM admins
        WHERE email = ?
        LIMIT 1`,
      [email],
    );

    return rows[0] || null;
  },

  async findAdminById(id) {
    const rows = await query(
      `SELECT id, email
         FROM admins
        WHERE id = ?
        LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  },
};
