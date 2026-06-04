import type { FocusSession, Task, TaskInput } from "../types/task";
import { request } from "./http";

const API_URL = "/api/tasks";

type TaskUpdate = Partial<
  Pick<
    Task,
    | "title"
    | "status"
    | "dueDate"
    | "priority"
    | "category"
    | "tags"
    | "subtasks"
    | "estimatedMinutes"
    | "actualMinutes"
    | "reminderAt"
    | "recurring"
    | "focusSessions"
    | "actionType"
    | "targetEmail"
    | "targetPlatform"
    | "targetAccount"
    | "scheduledMessage"
    | "reminderSentAt"
    | "reminderEnabled"
    | "reminderType"
    | "reminderTiming"
    | "reminderCustomMinutes"
    | "sendEmailAfterCompletion"
    | "recipientEmail"
    | "emailSubject"
    | "emailMessage"
    | "includeAttachment"
  >
>;

export const taskApi = {
  getTasks: () => request<Task[]>(API_URL),

  createTask: (payload: TaskInput) =>
    request<Task>(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTask: (id: string, payload: TaskUpdate) =>
    request<Task>(`${API_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTask: (id: string) =>
    request<void>(`${API_URL}/${id}`, {
      method: "DELETE",
    }),

  reorderTasks: (tasks: Task[]) =>
    request<Task[]>(`${API_URL}/reorder`, {
      method: "PUT",
      body: JSON.stringify({ tasks }),
    }),

  addFocusSession: (task: Task, session: FocusSession) =>
    request<Task>(`${API_URL}/${task.id}/focus-sessions`, {
      method: "POST",
      body: JSON.stringify({ session }),
    }),

  listAttachments: (id: string) =>
    request<Task["attachments"]>(`${API_URL}/${id}/attachments`),

  downloadAttachment: async (
    taskId: string,
    attachmentId: number | string,
    filename = "attachment",
  ) => {
    const token = (() => {
      const raw = localStorage.getItem("taskify-session");
      if (!raw) return "";
      try {
        return (JSON.parse(raw) as { token?: string }).token || "";
      } catch {
        return "";
      }
    })();

    const response = await fetch(`${API_URL}/${taskId}/attachments/${attachmentId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      throw new Error("Unable to download attachment.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  },

  sendEmailReminders: () =>
    request<{ enabled: boolean; checked: number; sent: number; failed: number }>(
      `${API_URL}/send-reminders`,
      { method: "POST" },
    ),
};
