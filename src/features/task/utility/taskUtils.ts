import type { Task, TaskStatus } from "../../../types/task";


export const createTask = (title: string, dueDate?: string): Task => {
  return {
    id: crypto.randomUUID(),
    title,
    status: "pending",
    createdAt: new Date().toISOString(),
    dueDate,
  };
};

export const filterTasks = (tasks: Task[], filter: TaskStatus | "all") => {
  if (filter === "all") return tasks;
  return tasks.filter(task => task.status === filter);
};

export const calculateAnalytics = (tasks: Task[]) => {
  const today = new Date();

  const result = tasks.reduce(
    (acc, task) => {
      acc.total++;

      if (task.status === "completed") acc.completed++;
      if (task.status === "pending") acc.pending++;

      if (task.dueDate) {
        acc.withDueDate++;

        if (
          task.status === "pending" &&
          new Date(task.dueDate) < today
        ) {
          acc.overdue++;
        }
      }

      return acc;
    },
    {
      total: 0,
      completed: 0,
      pending: 0,
      withDueDate: 0,
      overdue: 0,
      completedToday: 0,
    }
  );

  return {
    ...result,
    completedPercent: result.total
      ? Math.round((result.completed / result.total) * 100)
      : 0,
    pendingPercent: result.total
      ? Math.round((result.pending / result.total) * 100)
      : 0,
  };
};