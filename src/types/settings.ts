export interface UserSettings {
  userId: number;
  notificationEmail: string | null;
  taskRemindersEnabled: boolean;
  reminderType: "email" | "in-app" | "both";
  reminderTiming: string;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string;
  weeklyReportEnabled: boolean;
  weeklyReportDay: string;
  monthlyReportEnabled: boolean;
  productivityReportEnabled: boolean;
  productivityReportFrequency: "daily" | "weekly" | "monthly";
  darkMode: boolean;
  silentMode: boolean;
  vacationMode: boolean;
  lastDailySummarySentAt?: string | null;
  lastWeeklyReportSentAt?: string | null;
  lastMonthlyReportSentAt?: string | null;
  lastProductivityReportSentAt?: string | null;
}
