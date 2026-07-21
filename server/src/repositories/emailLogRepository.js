import { execute, query } from "../config/db.js";

export const emailLogRepository = {
  async createLog({
    recipient,
    subject,
    status,
    sentAt = null,
    sourceType = null,
    sourceId = null,
    event = null,
    retryCount = 0,
  }) {
    await execute(
      `INSERT INTO email_logs (recipient, subject, sent_at, status, source_type, source_id, event, retry_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [recipient, subject, sentAt, status, sourceType, sourceId, event, retryCount],
    );
  },

  async listRecent(limit = 100) {
    return query(
      `SELECT id, recipient, subject, sent_at, status, source_type, source_id
         FROM email_logs
        ORDER BY id DESC
        LIMIT ?`,
      [limit],
    );
  },
};
