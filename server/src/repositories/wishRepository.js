import { execute, query } from "../config/db.js";

export const wishRepository = {
  async listByUserId(userId) {
    return query(
      `SELECT id, user_id, recipient_email, subject, message, scheduled_time, status,
              sent_at, delivery_error, cancelled_at, created_at, updated_at
         FROM scheduled_wishes
        WHERE user_id = ?
        ORDER BY COALESCE(scheduled_time, created_at) DESC`,
      [userId],
    );
  },

  async findById(id) {
    const rows = await query(
      `SELECT id, user_id, recipient_email, subject, message, scheduled_time, status,
              sent_at, delivery_error, cancelled_at, created_at, updated_at
         FROM scheduled_wishes
        WHERE id = ?
        LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  },

  async create({ userId, recipientEmail, subject, message, scheduledTime, status = "pending" }) {
    const result = await execute(
      `INSERT INTO scheduled_wishes
        (user_id, recipient_email, subject, message, scheduled_time, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, recipientEmail, subject, message, scheduledTime, status],
    );

    return this.findById(result.insertId);
  },

  async update(id, { recipientEmail, subject, message, scheduledTime, status, sentAt, deliveryError, cancelledAt }) {
    await execute(
      `UPDATE scheduled_wishes
          SET recipient_email = COALESCE(?, recipient_email),
              subject = COALESCE(?, subject),
              message = COALESCE(?, message),
              scheduled_time = COALESCE(?, scheduled_time),
              status = COALESCE(?, status),
              sent_at = COALESCE(?, sent_at),
              delivery_error = CASE WHEN ? IS NULL THEN NULL ELSE ? END,
              cancelled_at = COALESCE(?, cancelled_at),
              updated_at = NOW()
        WHERE id = ?`,
      [
        recipientEmail,
        subject,
        message,
        scheduledTime,
        status,
        sentAt,
        deliveryError,
        deliveryError,
        cancelledAt,
        id,
      ],
    );

    return this.findById(id);
  },

  async listDue(limit = 25) {
    return query(
      `SELECT id, user_id, recipient_email, subject, message, scheduled_time, status,
              sent_at, delivery_error, cancelled_at, created_at, updated_at
         FROM scheduled_wishes
        WHERE status = 'pending'
          AND scheduled_time IS NOT NULL
          AND scheduled_time <= NOW()
        ORDER BY scheduled_time ASC
        LIMIT ?`,
      [limit],
    );
  },
};
