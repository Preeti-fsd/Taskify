import { execute, query } from "../config/db.js";

const defaultSettings = {
  notification_email: null,
  task_reminders_enabled: 1,
  reminder_type: "both",
  reminder_timing: "15 min",
  daily_summary_enabled: 1,
  daily_summary_time: "18:00",
  weekly_report_enabled: 0,
  weekly_report_day: "monday",
  monthly_report_enabled: 0,
  productivity_report_enabled: 1,
  productivity_report_frequency: "daily",
  dark_mode: 0,
  silent_mode: 0,
  vacation_mode: 0,
};

export const settingsRepository = {
  async getByUserId(userId) {
    const rows = await query(
      `SELECT user_id, notification_email, task_reminders_enabled, reminder_type, reminder_timing,
              daily_summary_enabled, daily_summary_time, weekly_report_enabled, weekly_report_day,
              monthly_report_enabled, productivity_report_enabled, productivity_report_frequency,
              dark_mode, silent_mode, vacation_mode, last_daily_summary_sent_at,
              last_weekly_report_sent_at, last_monthly_report_sent_at, last_productivity_report_sent_at
         FROM user_settings
        WHERE user_id = ?
        LIMIT 1`,
      [userId],
    );

    return rows[0] || null;
  },

  async ensureForUser(userId, notificationEmail = null) {
    const current = await this.getByUserId(userId);
    if (current) return current;

    await execute(
      `INSERT INTO user_settings
        (user_id, notification_email, task_reminders_enabled, reminder_type, reminder_timing,
         daily_summary_enabled, daily_summary_time, weekly_report_enabled, weekly_report_day,
         monthly_report_enabled, productivity_report_enabled, productivity_report_frequency,
         dark_mode, silent_mode, vacation_mode, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        notificationEmail,
        defaultSettings.task_reminders_enabled,
        defaultSettings.reminder_type,
        defaultSettings.reminder_timing,
        defaultSettings.daily_summary_enabled,
        defaultSettings.daily_summary_time,
        defaultSettings.weekly_report_enabled,
        defaultSettings.weekly_report_day,
        defaultSettings.monthly_report_enabled,
        defaultSettings.productivity_report_enabled,
        defaultSettings.productivity_report_frequency,
        defaultSettings.dark_mode,
        defaultSettings.silent_mode,
        defaultSettings.vacation_mode,
      ],
    );

    return this.getByUserId(userId);
  },

  async updateForUser(userId, payload) {
    const next = {
      notification_email: payload.notificationEmail ?? null,
      task_reminders_enabled: payload.taskRemindersEnabled ?? 1,
      reminder_type: payload.reminderType ?? "both",
      reminder_timing: payload.reminderTiming ?? "15 min",
      daily_summary_enabled: payload.dailySummaryEnabled ?? 1,
      daily_summary_time: payload.dailySummaryTime ?? "18:00",
      weekly_report_enabled: payload.weeklyReportEnabled ?? 0,
      weekly_report_day: payload.weeklyReportDay ?? "monday",
      monthly_report_enabled: payload.monthlyReportEnabled ?? 0,
      productivity_report_enabled: payload.productivityReportEnabled ?? 1,
      productivity_report_frequency: payload.productivityReportFrequency ?? "daily",
      dark_mode: payload.darkMode ?? 0,
      silent_mode: payload.silentMode ?? 0,
      vacation_mode: payload.vacationMode ?? 0,
    };

    await execute(
      `INSERT INTO user_settings
        (user_id, notification_email, task_reminders_enabled, reminder_type, reminder_timing,
         daily_summary_enabled, daily_summary_time, weekly_report_enabled, weekly_report_day,
         monthly_report_enabled, productivity_report_enabled, productivity_report_frequency,
         dark_mode, silent_mode, vacation_mode, updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         notification_email = VALUES(notification_email),
         task_reminders_enabled = VALUES(task_reminders_enabled),
         reminder_type = VALUES(reminder_type),
         reminder_timing = VALUES(reminder_timing),
         daily_summary_enabled = VALUES(daily_summary_enabled),
         daily_summary_time = VALUES(daily_summary_time),
         weekly_report_enabled = VALUES(weekly_report_enabled),
         weekly_report_day = VALUES(weekly_report_day),
         monthly_report_enabled = VALUES(monthly_report_enabled),
         productivity_report_enabled = VALUES(productivity_report_enabled),
         productivity_report_frequency = VALUES(productivity_report_frequency),
         dark_mode = VALUES(dark_mode),
         silent_mode = VALUES(silent_mode),
         vacation_mode = VALUES(vacation_mode),
         updated_at = NOW()`,
      [
        userId,
        next.notification_email,
        next.task_reminders_enabled,
        next.reminder_type,
        next.reminder_timing,
        next.daily_summary_enabled,
        next.daily_summary_time,
        next.weekly_report_enabled,
        next.weekly_report_day,
        next.monthly_report_enabled,
        next.productivity_report_enabled,
        next.productivity_report_frequency,
        next.dark_mode,
        next.silent_mode,
        next.vacation_mode,
      ],
    );

    return this.getByUserId(userId);
  },

  async recordReportSent(userId, payload = {}) {
    const fields = [];
    const values = [];

    if (payload.dailySummaryAt) {
      fields.push("last_daily_summary_sent_at = ?");
      values.push(payload.dailySummaryAt);
    }
    if (payload.weeklyReportAt) {
      fields.push("last_weekly_report_sent_at = ?");
      values.push(payload.weeklyReportAt);
    }
    if (payload.monthlyReportAt) {
      fields.push("last_monthly_report_sent_at = ?");
      values.push(payload.monthlyReportAt);
    }
    if (payload.productivityReportAt) {
      fields.push("last_productivity_report_sent_at = ?");
      values.push(payload.productivityReportAt);
    }

    if (!fields.length) return this.getByUserId(userId);

    await execute(
      `UPDATE user_settings
          SET ${fields.join(", ")},
              updated_at = NOW()
        WHERE user_id = ?`,
      [...values, userId],
    );

    return this.getByUserId(userId);
  },

  async listUsersNeedingSummary(timeLabel) {
    return query(
      `SELECT user_id, notification_email, task_reminders_enabled, reminder_type, reminder_timing,
              daily_summary_enabled, daily_summary_time, weekly_report_enabled, weekly_report_day,
              monthly_report_enabled, productivity_report_enabled, productivity_report_frequency,
              dark_mode, silent_mode, vacation_mode, last_daily_summary_sent_at,
              last_weekly_report_sent_at, last_monthly_report_sent_at, last_productivity_report_sent_at
         FROM user_settings
        WHERE daily_summary_enabled = 1
          AND daily_summary_time = ?
        ORDER BY user_id ASC`,
      [timeLabel],
    );
  },
};
