import { env } from "../config/env.js";
import { authRepository } from "../repositories/authRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { taskRepository } from "../repositories/taskRepository.js";
import { settingsRepository } from "../repositories/settingsRepository.js";
import { emailService } from "./emailService.js";
import { wishService } from "./wishService.js";

let intervalHandle = null;

const toDayKey = (value) => new Date(value).toDateString();
const nowTimeLabel = () =>
  new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const buildSummary = (tasks) => {
  const today = new Date();
  const todayKey = today.toDateString();

  const summary = tasks.reduce(
    (acc, task) => {
      if (task.status === "completed") acc.completed++;
      if (task.status === "pending") acc.pending++;
      if (task.status === "pending" && task.dueDate && new Date(task.dueDate) < today) {
        acc.overdue++;
      }
      if (task.completedAt && toDayKey(task.completedAt) === todayKey) {
        acc.completedToday++;
      }
      if (task.dueDate && toDayKey(task.dueDate) === todayKey) {
        acc.dueToday++;
      }
      return acc;
    },
    { completed: 0, pending: 0, overdue: 0, completedToday: 0, dueToday: 0 },
  );

  const productivityScore = Math.max(
    0,
    Math.min(100, summary.completed * 8 + summary.completedToday * 5 - summary.overdue * 10),
  );

  return { ...summary, productivityScore };
};

const processTaskReminders = async () => {
  let sent = 0;
  const users = await authRepository.listUsers("");

  for (const user of users) {
    const settings = await settingsRepository.ensureForUser(user.id, user.email);
    if (!settings.task_reminders_enabled || settings.silent_mode || settings.vacation_mode) {
      continue;
    }
    if (settings.reminder_type === "in-app") {
      continue;
    }

    const tasks = await taskRepository.findAllByUser(user.id);
    const dueTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.reminderEnabled !== false &&
        task.reminderAt &&
        new Date(task.reminderAt).getTime() <= Date.now() &&
        !task.emailReminderSentAt,
    );

    for (const task of dueTasks) {
      const recipientEmail = settings.notification_email || user.email;
      const notification = await notificationRepository.create({
        userId: user.id,
        event: "task.reminder",
        category: "info",
        title: "Task Reminder",
        message: `Reminder for ${task.title}`,
        status: "scheduled",
        metadata: { taskId: task.id, recipientEmail },
        scheduledFor: task.reminderAt || new Date(),
      });

      try {
        await emailService.sendTaskReminder({ task, toEmail: recipientEmail });
        await taskRepository.update(task.id, user.id, {
          emailReminderSentAt: new Date(),
        });
        await notificationRepository.markSent(notification.id);
        sent++;
      } catch (error) {
        await notificationRepository.markFailed(notification.id);
        console.error("Task reminder failed:", error.message);
      }
    }
  }

  return sent;
};

const processOverdueAlerts = async () => {
  const users = await authRepository.listUsers("");
  let sent = 0;

  for (const user of users) {
    const settings = await settingsRepository.ensureForUser(user.id, user.email);
    if (settings.silent_mode || settings.vacation_mode) continue;

    const tasks = await taskRepository.findAllByUser(user.id);
    const overdueTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.dueDate &&
        new Date(task.dueDate).getTime() < Date.now() &&
        !task.overdueAlertSentAt,
    );

    for (const task of overdueTasks) {
      const recipientEmail = settings.notification_email || user.email;
      const notification = await notificationRepository.create({
        userId: user.id,
        event: "task.overdue",
        category: "warning",
        title: "Task Overdue",
        message: `${task.title} is overdue`,
        status: "scheduled",
        metadata: { taskId: task.id, recipientEmail },
        scheduledFor: new Date(),
      });

      try {
        await emailService.sendTaskOverdue({ task, toEmail: recipientEmail });
        await taskRepository.update(task.id, user.id, {
          overdueAlertSentAt: new Date(),
        });
        await notificationRepository.markSent(notification.id);
        sent++;
      } catch (error) {
        await notificationRepository.markFailed(notification.id);
        console.error("Overdue alert failed:", error.message);
      }
    }
  }

  return sent;
};

const processScheduledReports = async () => {
  const users = await authRepository.listUsers("");
  const currentTime = nowTimeLabel();
  const today = new Date();
  const weekday = today
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  let sent = 0;

  for (const user of users) {
    const settings = await settingsRepository.ensureForUser(user.id, user.email);
    if (settings.silent_mode || settings.vacation_mode) continue;

    const tasks = await taskRepository.findAllByUser(user.id);
    const summary = buildSummary(tasks);
    const recipientEmail = settings.notification_email || user.email;

    const shouldSendDaily =
      settings.daily_summary_enabled &&
      settings.daily_summary_time === currentTime &&
      (!settings.last_daily_summary_sent_at ||
        toDayKey(settings.last_daily_summary_sent_at) !== toDayKey(today));

    if (shouldSendDaily) {
      await emailService.sendGenericEmail({
        to: recipientEmail,
        subject: "Daily Summary",
        text: [
          `Today's tasks: ${summary.dueToday}`,
          `Completed: ${summary.completedToday}`,
          `Pending: ${summary.pending}`,
          `Overdue: ${summary.overdue}`,
          `Productivity score: ${summary.productivityScore}`,
        ].join("\n"),
        html: `<p>Today's tasks: ${summary.dueToday}</p><p>Completed: ${summary.completedToday}</p><p>Pending: ${summary.pending}</p><p>Overdue: ${summary.overdue}</p><p>Productivity score: ${summary.productivityScore}</p>`,
        sourceType: "daily-summary",
        sourceId: String(user.id),
      });
      await settingsRepository.recordReportSent(user.id, {
        dailySummaryAt: new Date(),
      });
      sent++;
    }

    const shouldSendWeekly =
      settings.weekly_report_enabled &&
      settings.weekly_report_day === weekday &&
      settings.daily_summary_time === currentTime &&
      (!settings.last_weekly_report_sent_at ||
        toDayKey(settings.last_weekly_report_sent_at) !== toDayKey(today));

    if (shouldSendWeekly) {
      await emailService.sendGenericEmail({
        to: recipientEmail,
        subject: "Weekly Productivity Report",
        text: `Tasks completed: ${summary.completed}\nPending: ${summary.pending}\nOverdue: ${summary.overdue}\nScore: ${summary.productivityScore}`,
        html: `<p>Tasks completed: ${summary.completed}</p><p>Pending: ${summary.pending}</p><p>Overdue: ${summary.overdue}</p><p>Score: ${summary.productivityScore}</p>`,
        sourceType: "weekly-report",
        sourceId: String(user.id),
      });
      await settingsRepository.recordReportSent(user.id, {
        weeklyReportAt: new Date(),
      });
      sent++;
    }

    const shouldSendMonthly =
      settings.monthly_report_enabled &&
      today.getDate() === 1 &&
      settings.daily_summary_time === currentTime &&
      (!settings.last_monthly_report_sent_at ||
        toDayKey(settings.last_monthly_report_sent_at) !== toDayKey(today));

    if (shouldSendMonthly) {
      await emailService.sendGenericEmail({
        to: recipientEmail,
        subject: "Monthly Productivity Report",
        text: `Tasks completed: ${summary.completed}\nPending: ${summary.pending}\nOverdue: ${summary.overdue}\nScore: ${summary.productivityScore}`,
        html: `<p>Tasks completed: ${summary.completed}</p><p>Pending: ${summary.pending}</p><p>Overdue: ${summary.overdue}</p><p>Score: ${summary.productivityScore}</p>`,
        sourceType: "monthly-report",
        sourceId: String(user.id),
      });
      await settingsRepository.recordReportSent(user.id, {
        monthlyReportAt: new Date(),
      });
      sent++;
    }

    const shouldSendProductivity =
      settings.productivity_report_enabled &&
      ((settings.productivity_report_frequency === "daily" && shouldSendDaily) ||
        (settings.productivity_report_frequency === "weekly" && shouldSendWeekly) ||
        (settings.productivity_report_frequency === "monthly" && shouldSendMonthly));

    if (shouldSendProductivity) {
      await emailService.sendGenericEmail({
        to: recipientEmail,
        subject: "Productivity Report",
        text: `Focus time, tasks completed, streak, and score summary.\nScore: ${summary.productivityScore}`,
        html: `<p>Focus time, tasks completed, streak, and score summary.</p><p>Score: ${summary.productivityScore}</p>`,
        sourceType: "productivity-report",
        sourceId: String(user.id),
      });
      await settingsRepository.recordReportSent(user.id, {
        productivityReportAt: new Date(),
      });
      sent++;
    }
  }

  return sent;
};

export const startReminderScheduler = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }

  const run = async () => {
    try {
      await processTaskReminders();
      await processOverdueAlerts();
      await processScheduledReports();
      await wishService.processDueWishes();
    } catch (error) {
      console.error("Scheduled email processing failed:", error.message);
    }
  };

  void run();
  intervalHandle = setInterval(run, env.emailReminderIntervalMs);
};
