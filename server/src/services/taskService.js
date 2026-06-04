import crypto from "node:crypto";
import { AppError } from "../errors/AppError.js";
import { authRepository } from "../repositories/authRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { settingsRepository } from "../repositories/settingsRepository.js";
import { taskRepository } from "../repositories/taskRepository.js";
import { taskAttachmentRepository } from "../repositories/taskAttachmentRepository.js";
import { emailService } from "./emailService.js";
import { resolveAttachmentPath, saveTaskAttachment } from "../utils/taskFiles.js";

const sanitizeTags = (value) =>
  Array.isArray(value)
    ? value.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

const sanitizeSubtasks = (value) =>
  Array.isArray(value)
    ? value
        .map((subtask) => ({
          id: subtask.id || crypto.randomUUID(),
          title: String(subtask.title || "").trim(),
          completed: Boolean(subtask.completed),
        }))
        .filter((subtask) => subtask.title)
    : [];

const cleanPayload = (payload) => ({
  title: payload.title?.trim(),
  status: payload.status || "pending",
  dueDate: payload.dueDate || null,
  priority: payload.priority || "medium",
  category: payload.category?.trim() || "General",
  tags: sanitizeTags(payload.tags),
  subtasks: sanitizeSubtasks(payload.subtasks),
  estimatedMinutes: Math.max(0, Number(payload.estimatedMinutes) || 0),
  actualMinutes: Math.max(0, Number(payload.actualMinutes) || 0),
  reminderAt: payload.reminderAt || null,
  recurring: payload.recurring || "none",
  focusSessions: Array.isArray(payload.focusSessions) ? payload.focusSessions : [],
  actionType: payload.actionType || "task",
  targetEmail: payload.targetEmail?.trim() || null,
  targetPlatform: payload.targetPlatform?.trim() || null,
  targetAccount: payload.targetAccount?.trim() || null,
  scheduledMessage: payload.scheduledMessage?.trim() || null,
  reminderEnabled: Boolean(payload.reminderEnabled ?? payload.reminderAt),
  reminderType: payload.reminderType || "email",
  reminderTiming: payload.reminderTiming || "15 min",
  reminderCustomMinutes:
    payload.reminderCustomMinutes === undefined || payload.reminderCustomMinutes === null
      ? null
      : Number(payload.reminderCustomMinutes),
  reminderSentAt: payload.reminderSentAt || null,
  emailReminderSentAt: payload.emailReminderSentAt || null,
  completedAt: payload.completedAt || null,
  sendEmailAfterCompletion: Boolean(payload.sendEmailAfterCompletion),
  recipientEmail: payload.recipientEmail?.trim() || null,
  emailSubject: payload.emailSubject?.trim() || null,
  emailMessage: payload.emailMessage?.trim() || null,
  includeAttachment: Boolean(payload.includeAttachment),
  attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
});

const mergeTaskUpdate = (task, payload) => ({
  title: payload.title?.trim() || task.title,
  status: payload.status || task.status,
  completedAt:
    payload.status === "completed" && task.status !== "completed"
      ? new Date()
      : payload.status === "pending"
        ? null
        : payload.completedAt !== undefined
          ? payload.completedAt
          : task.completedAt ? new Date(task.completedAt) : null,
  dueDate: payload.dueDate ?? task.dueDate ?? null,
  priority: payload.priority ?? task.priority,
  category: payload.category?.trim() || task.category,
  tags: payload.tags ? sanitizeTags(payload.tags) : task.tags,
  subtasks: payload.subtasks ? sanitizeSubtasks(payload.subtasks) : task.subtasks,
  estimatedMinutes:
    payload.estimatedMinutes === undefined
      ? task.estimatedMinutes
      : Math.max(0, Number(payload.estimatedMinutes) || 0),
  actualMinutes:
    payload.actualMinutes === undefined
      ? task.actualMinutes
      : Math.max(0, Number(payload.actualMinutes) || 0),
  reminderAt: payload.reminderAt ?? task.reminderAt ?? null,
  recurring: payload.recurring ?? task.recurring,
  focusSessions: payload.focusSessions ? payload.focusSessions : task.focusSessions,
  actionType: payload.actionType ?? task.actionType,
  targetEmail: payload.targetEmail?.trim() || task.targetEmail || null,
  targetPlatform: payload.targetPlatform?.trim() || task.targetPlatform || null,
  targetAccount: payload.targetAccount?.trim() || task.targetAccount || null,
  scheduledMessage: payload.scheduledMessage?.trim() || task.scheduledMessage || null,
  reminderEnabled:
    payload.reminderEnabled === undefined ? task.reminderEnabled : Boolean(payload.reminderEnabled),
  reminderType: payload.reminderType ?? task.reminderType,
  reminderTiming: payload.reminderTiming ?? task.reminderTiming,
  reminderCustomMinutes:
    payload.reminderCustomMinutes === undefined
      ? task.reminderCustomMinutes
      : payload.reminderCustomMinutes === null
        ? null
        : Number(payload.reminderCustomMinutes),
  reminderSentAt:
    payload.reminderSentAt === undefined ? task.reminderSentAt || null : payload.reminderSentAt,
  emailReminderSentAt:
    payload.emailReminderSentAt === undefined
      ? task.emailReminderSentAt || null
      : payload.emailReminderSentAt,
  sendEmailAfterCompletion:
    payload.sendEmailAfterCompletion === undefined
      ? task.sendEmailAfterCompletion
      : Boolean(payload.sendEmailAfterCompletion),
  recipientEmail: payload.recipientEmail?.trim() || task.recipientEmail || null,
  emailSubject: payload.emailSubject?.trim() || task.emailSubject || null,
  emailMessage: payload.emailMessage?.trim() || task.emailMessage || null,
  includeAttachment:
    payload.includeAttachment === undefined ? task.includeAttachment : Boolean(payload.includeAttachment),
  attachments: Array.isArray(payload.attachments) ? payload.attachments : undefined,
});

const persistAttachments = async (task, userId, attachments = []) => {
  if (!attachments.length) return task;

  for (const attachment of attachments) {
    const saved = await saveTaskAttachment({
      taskId: task.id,
      originalName: attachment.originalName,
      dataUrl: attachment.dataUrl,
      uploadedBy: userId,
    });

    await taskAttachmentRepository.create({
      taskId: task.id,
      ...saved,
    });
  }

  return taskRepository.findById(task.id, userId);
};

const buildAttachmentList = (task) =>
  (task.attachments || []).map((attachment) => ({
    filename: attachment.originalName,
    path: resolveAttachmentPath(attachment.filePath),
  }));

export const taskService = {
  async getTasks(userId) {
    return taskRepository.findAllByUser(userId);
  },

  async createTask(userId, payload) {
    if (!payload.title?.trim()) {
      throw new AppError("Task title is required.", 400);
    }

    const task = cleanPayload(payload);
    const created = await taskRepository.create(userId, task);
    return persistAttachments(created, userId, task.attachments);
  },

  async updateTask(userId, id, payload) {
    const task = await taskRepository.findById(id, userId);
    if (!task) {
      throw new AppError("Task not found.", 404);
    }

    const nextTask = mergeTaskUpdate(task, payload);
    const updatedTask = await taskRepository.update(id, userId, nextTask);
    const withAttachments = await persistAttachments(
      updatedTask,
      userId,
      Array.isArray(payload.attachments) ? payload.attachments : [],
    );

    const taskAfterUpdate = withAttachments || updatedTask;

    if (
      task.status !== "completed" &&
      taskAfterUpdate.status === "completed" &&
      taskAfterUpdate.sendEmailAfterCompletion
    ) {
      const user = await authRepository.findUserById(userId);
      const recipient = taskAfterUpdate.recipientEmail || user?.email;

      if (recipient) {
        const notification = await notificationRepository.create({
          userId,
          event: "task.completed",
          category: "success",
          title: "Task Completed",
          message: `Completion email for ${taskAfterUpdate.title}`,
          status: "scheduled",
          metadata: {
            taskId: taskAfterUpdate.id,
            taskTitle: taskAfterUpdate.title,
            recipientEmail: recipient,
          },
          scheduledFor: new Date(),
        });

        try {
          const subject =
            taskAfterUpdate.emailSubject || `Task Completed: ${taskAfterUpdate.title}`;
          const message =
            taskAfterUpdate.emailMessage ||
            [
              "Hello,",
              "",
              "The task has been completed.",
              "",
              `Task: ${taskAfterUpdate.title}`,
              `Completed At: ${new Date().toLocaleString()}`,
              "",
              "Regards,",
              "Taskify",
            ].join("\n");

          await emailService.sendGenericEmail({
            to: recipient,
            subject,
            text: message,
            html: `<p>Hello,</p><p>The task has been completed.</p><p><strong>Task:</strong> ${taskAfterUpdate.title}</p><p><strong>Completed At:</strong> ${new Date().toLocaleString()}</p><p>${(taskAfterUpdate.emailMessage || "").replaceAll("\n", "<br />") || ""}</p><p>Regards,<br />Taskify</p>`,
            attachments: taskAfterUpdate.includeAttachment
              ? buildAttachmentList(taskAfterUpdate)
              : [],
            sourceType: "task-completion",
            sourceId: taskAfterUpdate.id,
          });

          await taskRepository.update(id, userId, {
            completionEmailSentAt: new Date(),
          });
          await notificationRepository.markSent(notification.id);
        } catch (error) {
          await notificationRepository.markFailed(notification.id);
          console.error("Task completion email failed:", error.message);
        }
      }
    }

    return taskRepository.findById(id, userId);
  },

  async deleteTask(userId, id) {
    const task = await taskRepository.findById(id, userId);
    if (!task) {
      throw new AppError("Task not found.", 404);
    }

    await taskRepository.delete(id, userId);
  },

  async reorderTasks(userId, tasks) {
    if (!Array.isArray(tasks)) {
      throw new AppError("Tasks must be an array.", 400);
    }

    return taskRepository.reorder(userId, tasks);
  },

  async addFocusSession(userId, taskId, session) {
    const task = await taskRepository.findById(taskId, userId);
    if (!task) {
      throw new AppError("Task not found.", 404);
    }

    const focusSessions = [...(task.focusSessions || []), session];
    const actualMinutes = (task.actualMinutes || 0) + Number(session.minutes || 0);
    return taskRepository.update(taskId, userId, {
      focusSessions,
      actualMinutes,
      completedAt: task.completedAt ? new Date(task.completedAt) : null,
    });
  },

  async listAttachments(userId, taskId) {
    const task = await taskRepository.findById(taskId, userId);
    if (!task) {
      throw new AppError("Task not found.", 404);
    }

    return task.attachments || [];
  },

  async downloadAttachment(userId, taskId, attachmentId) {
    const task = await taskRepository.findById(taskId, userId);
    if (!task) {
      throw new AppError("Task not found.", 404);
    }

    const attachment = (task.attachments || []).find((item) => String(item.id) === String(attachmentId));
    if (!attachment) {
      throw new AppError("Attachment not found.", 404);
    }

    return {
      attachment,
      absolutePath: resolveAttachmentPath(attachment.filePath),
      downloadName: attachment.originalName,
    };
  },

  async sendDueEmailReminders(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const settings = await settingsRepository.ensureForUser(userId, user.email);
    if (!settings.task_reminders_enabled || settings.silent_mode || settings.vacation_mode) {
      return { enabled: false, checked: 0, sent: 0, failed: 0 };
    }
    const tasks = await taskRepository.findAllByUser(userId);
    const now = Date.now();
    const dueTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.reminderEnabled !== false &&
        task.reminderAt &&
        new Date(task.reminderAt).getTime() <= now &&
        !task.emailReminderSentAt,
    );

    let sent = 0;
    let failed = 0;

    for (const task of dueTasks) {
      const recipientEmail = settings.notification_email || user.email;
      if (settings.reminder_type === "in-app") {
        continue;
      }
      const notification = await notificationRepository.create({
        userId,
        event: "task.reminder",
        category: "info",
        title: "Task Reminder",
        message: `Reminder for ${task.title}`,
        status: "scheduled",
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          recipientEmail,
        },
        scheduledFor: task.reminderAt || new Date(),
      });

      try {
        await emailService.sendTaskReminder({ task, toEmail: recipientEmail });
        await taskRepository.update(task.id, userId, {
          emailReminderSentAt: new Date(),
        });
        await notificationRepository.markSent(notification.id);
        sent++;
      } catch (error) {
        await notificationRepository.markFailed(notification.id);
        failed++;
      }
    }

    return {
      enabled: emailService.isEnabled(),
      checked: dueTasks.length,
      sent,
      failed,
    };
  },
};
