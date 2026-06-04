import { execute, query } from "../config/db.js";

export const notificationRepository = {
  async create({ userId, event, category = "info", title, message, status = "scheduled", metadata = {}, scheduledFor = null, sentAt = null, retryCount = 0 }) {
    const result = await execute(
      `INSERT INTO notification_events
        (user_id, event, category, title, message, status, metadata_json, scheduled_for, sent_at, retry_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        event,
        category,
        title,
        message,
        status,
        JSON.stringify(metadata),
        scheduledFor,
        sentAt,
        retryCount,
      ],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(
      `SELECT id, user_id, event, category, title, message, status, metadata_json,
              scheduled_for, sent_at, retry_count, created_at, updated_at
         FROM notification_events
        WHERE id = ?
        LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  },

  async listByUserId(userId, limit = 100) {
    return query(
      `SELECT id, user_id, event, category, title, message, status, metadata_json,
              scheduled_for, sent_at, retry_count, created_at, updated_at
         FROM notification_events
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?`,
      [userId, limit],
    );
  },

  async listPending(limit = 100) {
    return query(
      `SELECT id, user_id, event, category, title, message, status, metadata_json,
              scheduled_for, sent_at, retry_count, created_at, updated_at
         FROM notification_events
        WHERE status = 'scheduled'
          AND scheduled_for IS NOT NULL
          AND scheduled_for <= NOW()
        ORDER BY scheduled_for ASC
        LIMIT ?`,
      [limit],
    );
  },

  async markSent(id, sentAt = new Date()) {
    await execute(
      `UPDATE notification_events
          SET status = 'sent',
              sent_at = ?,
              updated_at = NOW()
        WHERE id = ?`,
      [sentAt, id],
    );

    return this.findById(id);
  },

  async markFailed(id) {
    await execute(
      `UPDATE notification_events
          SET status = 'failed',
              retry_count = retry_count + 1,
              updated_at = NOW()
        WHERE id = ?`,
      [id],
    );

    return this.findById(id);
  },

  async markScheduled(id) {
    await execute(
      `UPDATE notification_events
          SET status = 'scheduled',
              retry_count = retry_count + 1,
              updated_at = NOW()
        WHERE id = ?`,
      [id],
    );

    return this.findById(id);
  },
};
