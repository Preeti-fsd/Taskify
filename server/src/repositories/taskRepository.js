import { execute, query } from "../config/db.js";
import { taskAttachmentRepository } from "./taskAttachmentRepository.js";

const parseJson = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mapTaskRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  status: row.status,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  updateAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
  completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
  dueDate: row.due_date || undefined,
  priority: row.priority,
  category: row.category,
  tags: parseJson(row.tags_json, []),
  subtasks: parseJson(row.subtasks_json, []),
  estimatedMinutes: Number(row.estimated_minutes) || 0,
  actualMinutes: Number(row.actual_minutes) || 0,
  reminderAt: row.reminder_at || undefined,
  recurring: row.recurrence,
  focusSessions: parseJson(row.focus_sessions_json, []),
  actionType: row.action_type,
  targetEmail: row.target_email || undefined,
  targetPlatform: row.target_platform || undefined,
  targetAccount: row.target_account || undefined,
  scheduledMessage: row.scheduled_message || undefined,
  reminderSentAt: row.reminder_sent_at ? new Date(row.reminder_sent_at).getTime() : undefined,
  emailReminderSentAt: row.email_reminder_sent_at
    ? new Date(row.email_reminder_sent_at).getTime()
    : undefined,
  reminderEnabled: Boolean(row.reminder_enabled),
  reminderType: row.reminder_type || "email",
  reminderTiming: row.reminder_timing || "15 min",
  reminderCustomMinutes: row.reminder_custom_minutes ?? null,
  sendEmailAfterCompletion: Boolean(row.send_email_after_completion),
  recipientEmail: row.recipient_email || undefined,
  emailSubject: row.email_subject || undefined,
  emailMessage: row.email_message || undefined,
  includeAttachment: Boolean(row.include_attachment),
  completionEmailSentAt: row.completion_email_sent_at
    ? new Date(row.completion_email_sent_at).getTime()
    : undefined,
  overdueAlertSentAt: row.overdue_alert_sent_at
    ? new Date(row.overdue_alert_sent_at).getTime()
    : undefined,
  upcomingDeadlineAlertSentAt: row.upcoming_deadline_alert_sent_at
    ? new Date(row.upcoming_deadline_alert_sent_at).getTime()
    : undefined,
  attachments: [],
});

const toJson = (value) => JSON.stringify(value ?? []);
const toDateOrNull = (value) => (value ? new Date(value) : null);
const attachFiles = async (tasks) => {
  if (!tasks.length) return tasks;

  const attachments = await taskAttachmentRepository.listByTaskIds(tasks.map((task) => task.id));
  const grouped = attachments.reduce((acc, attachment) => {
    acc[attachment.task_id] ??= [];
    acc[attachment.task_id].push({
      id: attachment.id,
      taskId: attachment.task_id,
      fileName: attachment.file_name,
      originalName: attachment.original_name,
      filePath: attachment.file_path,
      fileSize: Number(attachment.file_size) || 0,
      mimeType: attachment.mime_type,
      uploadedBy: attachment.uploaded_by,
      createdAt: attachment.created_at,
    });
    return acc;
  }, {});

  return tasks.map((task) => ({
    ...task,
    attachments: grouped[task.id] || [],
  }));
};

export const taskRepository = {
  async findAllByUser(userId) {
    const rows = await query(
      `SELECT *
         FROM tasks
        WHERE user_id = ?
        ORDER BY COALESCE(sort_order, 0) ASC, created_at DESC`,
      [userId],
    );

    return attachFiles(rows.map(mapTaskRow));
  },

  async findById(id, userId) {
    const rows = await query(
      `SELECT *
         FROM tasks
        WHERE id = ?
          AND user_id = ?
        LIMIT 1`,
      [id, userId],
    );

    if (!rows[0]) return null;
    const [task] = await attachFiles([mapTaskRow(rows[0])]);
    return task || null;
  },

  async create(userId, task) {
    const result = await execute(
      `INSERT INTO tasks SET
        user_id = :userId,
        title = :title,
        status = :status,
        created_at = NOW(),
        updated_at = NOW(),
        completed_at = :completedAt,
        due_date = :dueDate,
        priority = :priority,
        category = :category,
        tags_json = :tagsJson,
        subtasks_json = :subtasksJson,
        estimated_minutes = :estimatedMinutes,
        actual_minutes = :actualMinutes,
        reminder_at = :reminderAt,
        recurrence = :recurrence,
        focus_sessions_json = :focusSessionsJson,
        action_type = :actionType,
        target_email = :targetEmail,
        target_platform = :targetPlatform,
        target_account = :targetAccount,
        scheduled_message = :scheduledMessage,
        reminder_sent_at = :reminderSentAt,
        email_reminder_sent_at = :emailReminderSentAt,
        reminder_enabled = :reminderEnabled,
        reminder_type = :reminderType,
        reminder_timing = :reminderTiming,
        reminder_custom_minutes = :reminderCustomMinutes,
        send_email_after_completion = :sendEmailAfterCompletion,
        recipient_email = :recipientEmail,
        email_subject = :emailSubject,
        email_message = :emailMessage,
        include_attachment = :includeAttachment,
        completion_email_sent_at = :completionEmailSentAt,
        overdue_alert_sent_at = :overdueAlertSentAt,
        upcoming_deadline_alert_sent_at = :upcomingDeadlineAlertSentAt,
        sort_order = :sortOrder`,
      {
        userId,
        title: task.title,
        status: task.status || "pending",
        completedAt: toDateOrNull(task.completedAt),
        dueDate: task.dueDate || null,
        priority: task.priority || "medium",
        category: task.category || "General",
        tagsJson: toJson(task.tags),
        subtasksJson: toJson(task.subtasks),
        estimatedMinutes: Number(task.estimatedMinutes) || 0,
        actualMinutes: Number(task.actualMinutes) || 0,
        reminderAt: task.reminderAt || null,
        recurrence: task.recurring || "none",
        focusSessionsJson: toJson(task.focusSessions),
        actionType: task.actionType || "task",
        targetEmail: task.targetEmail || null,
        targetPlatform: task.targetPlatform || null,
        targetAccount: task.targetAccount || null,
        scheduledMessage: task.scheduledMessage || null,
        reminderSentAt: toDateOrNull(task.reminderSentAt),
        emailReminderSentAt: toDateOrNull(task.emailReminderSentAt),
        reminderEnabled: task.reminderEnabled ? 1 : 0,
        reminderType: task.reminderType || "email",
        reminderTiming: task.reminderTiming || "15 min",
        reminderCustomMinutes: task.reminderCustomMinutes ?? null,
        sendEmailAfterCompletion: task.sendEmailAfterCompletion ? 1 : 0,
        recipientEmail: task.recipientEmail || null,
        emailSubject: task.emailSubject || null,
        emailMessage: task.emailMessage || null,
        includeAttachment: task.includeAttachment ? 1 : 0,
        completionEmailSentAt: toDateOrNull(task.completionEmailSentAt),
        overdueAlertSentAt: toDateOrNull(task.overdueAlertSentAt),
        upcomingDeadlineAlertSentAt: toDateOrNull(task.upcomingDeadlineAlertSentAt),
        sortOrder: task.sortOrder ?? 0,
      },
    );

    return this.findById(result.insertId, userId);
  },

  async update(id, userId, task) {
    await execute(
      `UPDATE tasks SET
              title = COALESCE(:title, title),
              status = COALESCE(:status, status),
              updated_at = NOW(),
              completed_at = :completedAt,
              due_date = COALESCE(:dueDate, due_date),
              priority = COALESCE(:priority, priority),
              category = COALESCE(:category, category),
              tags_json = COALESCE(:tagsJson, tags_json),
              subtasks_json = COALESCE(:subtasksJson, subtasks_json),
              estimated_minutes = COALESCE(:estimatedMinutes, estimated_minutes),
              actual_minutes = COALESCE(:actualMinutes, actual_minutes),
              reminder_at = COALESCE(:reminderAt, reminder_at),
              recurrence = COALESCE(:recurrence, recurrence),
              focus_sessions_json = COALESCE(:focusSessionsJson, focus_sessions_json),
              action_type = COALESCE(:actionType, action_type),
              target_email = COALESCE(:targetEmail, target_email),
              target_platform = COALESCE(:targetPlatform, target_platform),
              target_account = COALESCE(:targetAccount, target_account),
              scheduled_message = COALESCE(:scheduledMessage, scheduled_message),
              reminder_sent_at = COALESCE(:reminderSentAt, reminder_sent_at),
              email_reminder_sent_at = COALESCE(:emailReminderSentAt, email_reminder_sent_at),
              reminder_enabled = COALESCE(:reminderEnabled, reminder_enabled),
              reminder_type = COALESCE(:reminderType, reminder_type),
              reminder_timing = COALESCE(:reminderTiming, reminder_timing),
              reminder_custom_minutes = COALESCE(:reminderCustomMinutes, reminder_custom_minutes),
              send_email_after_completion = COALESCE(:sendEmailAfterCompletion, send_email_after_completion),
              recipient_email = COALESCE(:recipientEmail, recipient_email),
              email_subject = COALESCE(:emailSubject, email_subject),
              email_message = COALESCE(:emailMessage, email_message),
              include_attachment = COALESCE(:includeAttachment, include_attachment),
              completion_email_sent_at = COALESCE(:completionEmailSentAt, completion_email_sent_at),
              overdue_alert_sent_at = COALESCE(:overdueAlertSentAt, overdue_alert_sent_at),
              upcoming_deadline_alert_sent_at = COALESCE(:upcomingDeadlineAlertSentAt, upcoming_deadline_alert_sent_at)
        WHERE id = :id
          AND user_id = :userId`,
      {
        title: task.title ?? null,
        status: task.status ?? null,
        completedAt: task.completedAt === undefined ? null : toDateOrNull(task.completedAt),
        dueDate: task.dueDate ?? null,
        priority: task.priority ?? null,
        category: task.category ?? null,
        tagsJson: task.tags ? toJson(task.tags) : null,
        subtasksJson: task.subtasks ? toJson(task.subtasks) : null,
        estimatedMinutes: task.estimatedMinutes ?? null,
        actualMinutes: task.actualMinutes ?? null,
        reminderAt: task.reminderAt ?? null,
        recurrence: task.recurring ?? null,
        focusSessionsJson: task.focusSessions ? toJson(task.focusSessions) : null,
        actionType: task.actionType ?? null,
        targetEmail: task.targetEmail ?? null,
        targetPlatform: task.targetPlatform ?? null,
        targetAccount: task.targetAccount ?? null,
        scheduledMessage: task.scheduledMessage ?? null,
        reminderSentAt: task.reminderSentAt === undefined ? null : toDateOrNull(task.reminderSentAt),
        emailReminderSentAt:
          task.emailReminderSentAt === undefined ? null : toDateOrNull(task.emailReminderSentAt),
        reminderEnabled:
          task.reminderEnabled === undefined ? null : task.reminderEnabled ? 1 : 0,
        reminderType: task.reminderType ?? null,
        reminderTiming: task.reminderTiming ?? null,
        reminderCustomMinutes: task.reminderCustomMinutes ?? null,
        sendEmailAfterCompletion:
          task.sendEmailAfterCompletion === undefined
            ? null
            : task.sendEmailAfterCompletion
              ? 1
              : 0,
        recipientEmail: task.recipientEmail ?? null,
        emailSubject: task.emailSubject ?? null,
        emailMessage: task.emailMessage ?? null,
        includeAttachment:
          task.includeAttachment === undefined ? null : task.includeAttachment ? 1 : 0,
        completionEmailSentAt:
          task.completionEmailSentAt === undefined
            ? null
            : toDateOrNull(task.completionEmailSentAt),
        overdueAlertSentAt:
          task.overdueAlertSentAt === undefined ? null : toDateOrNull(task.overdueAlertSentAt),
        upcomingDeadlineAlertSentAt:
          task.upcomingDeadlineAlertSentAt === undefined
            ? null
            : toDateOrNull(task.upcomingDeadlineAlertSentAt),
        id,
        userId,
      },
    );

    return this.findById(id, userId);
  },

  async delete(id, userId) {
    await execute(
      `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
  },

  async reorder(userId, tasks) {
    const orderedIds = tasks.map((task) => task.id);
    const existing = await this.findAllByUser(userId);
    const map = new Map(existing.map((task) => [task.id, task]));
    const nextTasks = orderedIds
      .map((id) => map.get(id))
      .filter(Boolean)
      .concat(existing.filter((task) => !orderedIds.includes(task.id)));

    await Promise.all(
      nextTasks.map((task, index) =>
        execute(
          `UPDATE tasks SET sort_order = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
          [index, task.id, userId],
        ),
      ),
    );

    return this.findAllByUser(userId);
  },

  async listDueReminders() {
    const rows = await query(
      `SELECT *
         FROM tasks
        WHERE status = 'pending'
          AND reminder_enabled = 1
          AND reminder_at IS NOT NULL
        AND reminder_at <= NOW()
          AND email_reminder_sent_at IS NULL
        ORDER BY reminder_at ASC`,
    );

    return attachFiles(rows.map(mapTaskRow));
  },
};
