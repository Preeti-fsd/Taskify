import { authRepository } from "../repositories/authRepository.js";
import { settingsRepository } from "../repositories/settingsRepository.js";
import { AppError } from "../errors/AppError.js";

const publicSettings = (settings, fallbackEmail = null) => ({
  userId: settings.user_id,
  notificationEmail: settings.notification_email || fallbackEmail,
  taskRemindersEnabled: Boolean(settings.task_reminders_enabled),
  reminderType: settings.reminder_type,
  reminderTiming: settings.reminder_timing,
  dailySummaryEnabled: Boolean(settings.daily_summary_enabled),
  dailySummaryTime: settings.daily_summary_time,
  weeklyReportEnabled: Boolean(settings.weekly_report_enabled),
  weeklyReportDay: settings.weekly_report_day,
  monthlyReportEnabled: Boolean(settings.monthly_report_enabled),
  productivityReportEnabled: Boolean(settings.productivity_report_enabled),
  productivityReportFrequency: settings.productivity_report_frequency,
  darkMode: Boolean(settings.dark_mode),
  silentMode: Boolean(settings.silent_mode),
  vacationMode: Boolean(settings.vacation_mode),
  lastDailySummarySentAt: settings.last_daily_summary_sent_at || null,
  lastWeeklyReportSentAt: settings.last_weekly_report_sent_at || null,
  lastMonthlyReportSentAt: settings.last_monthly_report_sent_at || null,
  lastProductivityReportSentAt: settings.last_productivity_report_sent_at || null,
});

export const settingsService = {
  async getSettings(userId, fallbackEmail = null) {
    const user = await authRepository.findUserById(userId);
    const email = user?.email || fallbackEmail;
    const settings = await settingsRepository.ensureForUser(userId, email);
    return publicSettings(settings, email);
  },

  async updateSettings(userId, payload, fallbackEmail = null) {
    const user = await authRepository.findUserById(userId);
    const email = user?.email || fallbackEmail;

    const settings = await settingsRepository.updateForUser(userId, {
      notificationEmail: payload.notificationEmail,
      taskRemindersEnabled: payload.taskRemindersEnabled,
      reminderType: payload.reminderType,
      reminderTiming: payload.reminderTiming,
      dailySummaryEnabled: payload.dailySummaryEnabled,
      dailySummaryTime: payload.dailySummaryTime,
      weeklyReportEnabled: payload.weeklyReportEnabled,
      weeklyReportDay: payload.weeklyReportDay,
      monthlyReportEnabled: payload.monthlyReportEnabled,
      productivityReportEnabled: payload.productivityReportEnabled,
      productivityReportFrequency: payload.productivityReportFrequency,
      darkMode: payload.darkMode,
      silentMode: payload.silentMode,
      vacationMode: payload.vacationMode,
    });

    return publicSettings(settings, email);
  },
};
