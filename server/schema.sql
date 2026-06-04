CREATE DATABASE IF NOT EXISTS taskify_db;
USE taskify_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  otp_hash VARCHAR(255) DEFAULT NULL,
  otp_expires_at DATETIME DEFAULT NULL,
  password_reset_token_hash VARCHAR(255) DEFAULT NULL,
  password_reset_expires_at DATETIME DEFAULT NULL,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id CHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at DATETIME DEFAULT NULL,
  due_date VARCHAR(64) DEFAULT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'medium',
  category VARCHAR(120) NOT NULL DEFAULT 'General',
  tags_json JSON DEFAULT (JSON_ARRAY()),
  subtasks_json JSON DEFAULT (JSON_ARRAY()),
  estimated_minutes INT NOT NULL DEFAULT 0,
  actual_minutes INT NOT NULL DEFAULT 0,
  reminder_at DATETIME DEFAULT NULL,
  recurrence VARCHAR(32) NOT NULL DEFAULT 'none',
  focus_sessions_json JSON DEFAULT (JSON_ARRAY()),
  action_type VARCHAR(32) NOT NULL DEFAULT 'task',
  target_email VARCHAR(191) DEFAULT NULL,
  target_platform VARCHAR(64) DEFAULT NULL,
  target_account VARCHAR(128) DEFAULT NULL,
  scheduled_message TEXT DEFAULT NULL,
  reminder_sent_at DATETIME DEFAULT NULL,
  email_reminder_sent_at DATETIME DEFAULT NULL,
  reminder_enabled TINYINT(1) NOT NULL DEFAULT 0,
  reminder_type VARCHAR(16) NOT NULL DEFAULT 'email',
  reminder_timing VARCHAR(32) NOT NULL DEFAULT '15 min',
  reminder_custom_minutes INT DEFAULT NULL,
  send_email_after_completion TINYINT(1) NOT NULL DEFAULT 0,
  recipient_email VARCHAR(191) DEFAULT NULL,
  email_subject VARCHAR(255) DEFAULT NULL,
  email_message TEXT DEFAULT NULL,
  include_attachment TINYINT(1) NOT NULL DEFAULT 0,
  completion_email_sent_at DATETIME DEFAULT NULL,
  overdue_alert_sent_at DATETIME DEFAULT NULL,
  upcoming_deadline_alert_sent_at DATETIME DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_attachments (
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
);

CREATE TABLE IF NOT EXISTS scheduled_wishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipient_email VARCHAR(191) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  scheduled_time DATETIME DEFAULT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  sent_at DATETIME DEFAULT NULL,
  delivery_error TEXT DEFAULT NULL,
  cancelled_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(191) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at DATETIME DEFAULT NULL,
  status VARCHAR(32) NOT NULL,
  source_type VARCHAR(64) DEFAULT NULL,
  source_id VARCHAR(64) DEFAULT NULL,
  event VARCHAR(64) DEFAULT NULL,
  retry_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_settings (
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
);

CREATE TABLE IF NOT EXISTS notification_events (
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
);
