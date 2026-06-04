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
      `INSERT INTO tasks (
        user_id, title, status, created_at, updated_at, completed_at, due_date, priority,
        category, tags_json, subtasks_json, estimated_minutes, actual_minutes, reminder_at,
        recurrence, focus_sessions_json, action_type, target_email, target_platform,
        target_account, scheduled_message, reminder_sent_at, email_reminder_sent_at,
        reminder_enabled, reminder_type, reminder_timing, reminder_custom_minutes,
        send_email_after_completion, recipient_email, email_subject, email_message,
        include_attachment, completion_email_sent_at, overdue_alert_sent_at,
        upcoming_deadline_alert_sent_at, sort_order
      ) VALUES (
        ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        userId,
        task.title,
        task.status || "pending",
        toDateOrNull(task.completedAt),
        task.dueDate || null,
        task.priority || "medium",
        task.category || "General",
        toJson(task.tags),
        toJson(task.subtasks),
        Number(task.estimatedMinutes) || 0,
        Number(task.actualMinutes) || 0,
        task.reminderAt || null,
        task.recurring || "none",
        toJson(task.focusSessions),
        task.actionType || "task",
        task.targetEmail || null,
        task.targetPlatform || null,
        task.targetAccount || null,
        task.scheduledMessage || null,
        toDateOrNull(task.reminderSentAt),
        toDateOrNull(task.emailReminderSentAt),
        task.reminderEnabled ? 1 : 0,
        task.reminderType || "email",
        task.reminderTiming || "15 min",
        task.reminderCustomMinutes ?? null,
        task.sendEmailAfterCompletion ? 1 : 0,
        task.recipientEmail || null,
        task.emailSubject || null,
        task.emailMessage || null,
        task.includeAttachment ? 1 : 0,
        toDateOrNull(task.completionEmailSentAt),
        toDateOrNull(task.overdueAlertSentAt),
        toDateOrNull(task.upcomingDeadlineAlertSentAt),
        task.sortOrder ?? 0,
      ],
    );

    return this.findById(result.insertId, userId);
  },

  async update(id, userId, task) {
    await execute(
      `UPDATE tasks
          SET title = COALESCE(?, title),
              status = COALESCE(?, status),
              updated_at = NOW(),
              completed_at = ?,
              due_date = COALESCE(?, due_date),
              priority = COALESCE(?, priority),
              category = COALESCE(?, category),
              tags_json = COALESCE(?, tags_json),
              subtasks_json = COALESCE(?, subtasks_json),
              estimated_minutes = COALESCE(?, estimated_minutes),
              actual_minutes = COALESCE(?, actual_minutes),
              reminder_at = COALESCE(?, reminder_at),
              recurrence = COALESCE(?, recurrence),
              focus_sessions_json = COALESCE(?, focus_sessions_json),
              action_type = COALESCE(?, action_type),
              target_email = COALESCE(?, target_email),
              target_platform = COALESCE(?, target_platform),
              target_account = COALESCE(?, target_account),
              scheduled_message = COALESCE(?, scheduled_message),
              reminder_sent_at = COALESCE(?, reminder_sent_at),
              email_reminder_sent_at = COALESCE(?, email_reminder_sent_at),
              reminder_enabled = COALESCE(?, reminder_enabled),
              reminder_type = COALESCE(?, reminder_type),
              reminder_timing = COALESCE(?, reminder_timing),
              reminder_custom_minutes = COALESCE(?, reminder_custom_minutes),
              send_email_after_completion = COALESCE(?, send_email_after_completion),
              recipient_email = COALESCE(?, recipient_email),
              email_subject = COALESCE(?, email_subject),
              email_message = COALESCE(?, email_message),
              include_attachment = COALESCE(?, include_attachment),
              completion_email_sent_at = COALESCE(?, completion_email_sent_at),
              overdue_alert_sent_at = COALESCE(?, overdue_alert_sent_at),
              upcoming_deadline_alert_sent_at = COALESCE(?, upcoming_deadline_alert_sent_at)
        WHERE id = ?
          AND user_id = ?`,
      [
        task.title ?? null,
        task.status ?? null,
        task.completedAt === undefined ? null : toDateOrNull(task.completedAt),
        task.dueDate ?? null,
        task.priority ?? null,
        task.category ?? null,
        task.tags ? toJson(task.tags) : null,
        task.subtasks ? toJson(task.subtasks) : null,
        task.estimatedMinutes ?? null,
        task.actualMinutes ?? null,
        task.reminderAt ?? null,
        task.recurring ?? null,
        task.focusSessions ? toJson(task.focusSessions) : null,
        task.actionType ?? null,
        task.targetEmail ?? null,
        task.targetPlatform ?? null,
        task.targetAccount ?? null,
        task.scheduledMessage ?? null,
        task.reminderSentAt === undefined ? null : toDateOrNull(task.reminderSentAt),
        task.emailReminderSentAt === undefined ? null : toDateOrNull(task.emailReminderSentAt),
        task.reminderEnabled === undefined ? null : (task.reminderEnabled ? 1 : 0),
        task.reminderType ?? null,
        task.reminderTiming ?? null,
        task.reminderCustomMinutes ?? null,
        task.sendEmailAfterCompletion === undefined ? null : (task.sendEmailAfterCompletion ? 1 : 0),
        task.recipientEmail ?? null,
        task.emailSubject ?? null,
        task.emailMessage ?? null,
        task.includeAttachment === undefined ? null : (task.includeAttachment ? 1 : 0),
        task.completionEmailSentAt === undefined ? null : toDateOrNull(task.completionEmailSentAt),
        task.overdueAlertSentAt === undefined ? null : toDateOrNull(task.overdueAlertSentAt),
        task.upcomingDeadlineAlertSentAt === undefined
          ? null
          : toDateOrNull(task.upcomingDeadlineAlertSentAt),
        id,
        userId,
      ],
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
