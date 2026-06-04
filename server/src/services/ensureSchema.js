import { execute } from "../config/db.js";

const statements = [
  `CREATE TABLE IF NOT EXISTS task_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INT NOT NULL DEFAULT 0,
    mime_type VARCHAR(120) NOT NULL,
    uploaded_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachments_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS user_settings (
    user_id INT PRIMARY KEY,
    notification_email VARCHAR(191) DEFAULT NULL,
    task_reminders_enabled TINYINT(1) NOT NULL DEFAULT 1,
    reminder_type VARCHAR(16) NOT NULL DEFAULT 'both',
    reminder_timing VARCHAR(32) NOT NULL DEFAULT '15 min',
    daily_summary_enabled TINYINT(1) NOT NULL DEFAULT 1,
    daily_summary_time VARCHAR(8) NOT NULL DEFAULT '18:00',
    weekly_report_enabled TINYINT(1) NOT NULL DEFAULT 0,
    weekly_report_day VARCHAR(16) NOT NULL DEFAULT 'monday',
    monthly_report_enabled TINYINT(1) NOT NULL DEFAULT 0,
    productivity_report_enabled TINYINT(1) NOT NULL DEFAULT 1,
    productivity_report_frequency VARCHAR(16) NOT NULL DEFAULT 'daily',
    dark_mode TINYINT(1) NOT NULL DEFAULT 0,
    silent_mode TINYINT(1) NOT NULL DEFAULT 0,
    vacation_mode TINYINT(1) NOT NULL DEFAULT 0,
    last_daily_summary_sent_at DATETIME DEFAULT NULL,
    last_weekly_report_sent_at DATETIME DEFAULT NULL,
    last_monthly_report_sent_at DATETIME DEFAULT NULL,
    last_productivity_report_sent_at DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS notification_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
    metadata_json JSON DEFAULT (JSON_OBJECT()),
    scheduled_for DATETIME DEFAULT NULL,
    sent_at DATETIME DEFAULT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
];

const alterStatements = [
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_enabled TINYINT(1) NOT NULL DEFAULT 0`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_type VARCHAR(16) NOT NULL DEFAULT 'email'`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_timing VARCHAR(32) NOT NULL DEFAULT '15 min'`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_custom_minutes INT DEFAULT NULL`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS send_email_after_completion TINYINT(1) NOT NULL DEFAULT 0`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(191) DEFAULT NULL`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS email_subject VARCHAR(255) DEFAULT NULL`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS email_message TEXT DEFAULT NULL`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS include_attachment TINYINT(1) NOT NULL DEFAULT 0`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_email_sent_at DATETIME DEFAULT NULL`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS overdue_alert_sent_at DATETIME DEFAULT NULL`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS upcoming_deadline_alert_sent_at DATETIME DEFAULT NULL`,
  `ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS event VARCHAR(64) DEFAULT NULL`,
  `ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0`,
];

export const ensureSchema = async () => {
  for (const statement of statements) {
    await execute(statement);
  }

  for (const statement of alterStatements) {
    try {
      await execute(statement);
    } catch (error) {
      if (!String(error?.message || "").includes("Duplicate column")) {
        throw error;
      }
    }
  }
};
