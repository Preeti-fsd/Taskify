export type TaskStatus = "pending" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskRecurrence = "none" | "daily" | "weekly" | "monthly";
export type TaskActionType = "task" | "email" | "wish";
export type ReminderType = "email" | "in-app" | "both";
export type ReminderTiming = "5 min before" | "15 min" | "30 min" | "1 hour" | "1 day" | "custom";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface FocusSession {
  id: string;
  startedAt: number;
  endedAt: number;
  minutes: number;
}

export interface PendingAttachment {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

export interface TaskAttachment {
  id: number;
  taskId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: number;
  createdAt: string;
}

export interface TaskInput {
  title: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  category?: string | null;
  tags?: string[];
  estimatedMinutes?: number | null;
  reminderAt?: string | null;
  reminderEnabled?: boolean;
  reminderType?: ReminderType;
  reminderTiming?: ReminderTiming;
  reminderCustomMinutes?: number | null;
  recurring?: TaskRecurrence;
  subtasks?: Subtask[];
  actionType?: TaskActionType;
  targetEmail?: string | null;
  targetPlatform?: string | null;
  targetAccount?: string | null;
  scheduledMessage?: string | null;
  attachments?: PendingAttachment[];
  sendEmailAfterCompletion?: boolean;
  recipientEmail?: string | null;
  emailSubject?: string | null;
  emailMessage?: string | null;
  includeAttachment?: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: number;
  updateAt?: number;
  completedAt?: number;
  dueDate?: string;
  priority: TaskPriority;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  estimatedMinutes: number;
  actualMinutes: number;
  reminderAt?: string;
  recurring: TaskRecurrence;
  focusSessions: FocusSession[];
  actionType: TaskActionType;
  targetEmail?: string;
  targetPlatform?: string;
  targetAccount?: string;
  scheduledMessage?: string;
  reminderSentAt?: number;
  emailReminderSentAt?: number;
  reminderEnabled?: boolean;
  reminderType?: ReminderType;
  reminderTiming?: ReminderTiming;
  reminderCustomMinutes?: number | null;
  sendEmailAfterCompletion?: boolean;
  recipientEmail?: string;
  emailSubject?: string;
  emailMessage?: string;
  includeAttachment?: boolean;
  completionEmailSentAt?: number;
  overdueAlertSentAt?: number;
  upcomingDeadlineAlertSentAt?: number;
  attachments?: TaskAttachment[];
}
