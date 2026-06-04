import { useEffect } from "react";
import { toast } from "sonner";
import type { Task } from "../../../types/task";

export const useTaskReminders = (
  tasks: Task[],
  onReminderShown: (task: Task) => void,
) => {
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      tasks.forEach((task) => {
        if (
          task.status === "pending" &&
          task.reminderEnabled !== false &&
          task.reminderAt &&
          new Date(task.reminderAt).getTime() <= now &&
          !task.reminderSentAt
        ) {
          const canShowInApp =
            task.reminderType === "in-app" || task.reminderType === "both" || !task.reminderType;
          if (canShowInApp && "Notification" in window && Notification.permission === "granted") {
            new Notification("Taskify reminder", {
              body: task.title,
            });
          }
          if (canShowInApp) {
            toast.info(`Reminder: ${task.title}`);
          }
          onReminderShown(task);
        }
      });
    }, 30000);

    return () => window.clearInterval(interval);
  }, [onReminderShown, tasks]);
};
