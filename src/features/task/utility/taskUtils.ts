import type { Task, TaskInput, TaskStatus } from "../../../types/task";

export const createTask = (input: TaskInput): Task => {
  return {
    id: crypto.randomUUID(),
    title: input.title,
    status: "pending",
    createdAt: Date.now(),
    dueDate: input.dueDate || undefined,
    priority: input.priority || "medium",
    category: input.category?.trim() || "General",
    tags: input.tags || [],
    subtasks: input.subtasks || [],
    estimatedMinutes: input.estimatedMinutes ?? 0,
    actualMinutes: 0,
    reminderAt: input.reminderAt || undefined,
    recurring: input.recurring || "none",
    focusSessions: [],
    actionType: input.actionType || "task",
    targetEmail: input.targetEmail || undefined,
    targetPlatform: input.targetPlatform || undefined,
    targetAccount: input.targetAccount || undefined,
    scheduledMessage: input.scheduledMessage || undefined,
  };
};

export const filterTasks = (tasks: Task[], filter: TaskStatus | "all") => {
  if (filter === "all") return tasks;
  return tasks.filter(task => task.status === filter);
};

export const getSmartScore = (task: Task) => {
  if (task.status === "completed") return 0;

  const priorityScore = { low: 10, medium: 25, high: 45 }[task.priority];
  const due = task.dueDate ? new Date(task.dueDate).getTime() : null;
  const now = Date.now();
  const daysUntilDue = due ? Math.ceil((due - now) / 86400000) : 14;
  const dueScore = due
    ? daysUntilDue < 0
      ? 45
      : Math.max(0, 30 - daysUntilDue * 5)
    : 0;
  const ageScore = Math.min(20, Math.floor((now - task.createdAt) / 86400000) * 2);
  const effortScore = task.estimatedMinutes >= 60 ? 8 : 0;

  return priorityScore + dueScore + ageScore + effortScore;
};

export const getSmartTasks = (tasks: Task[]) =>
  [...tasks]
    .filter((task) => task.status === "pending")
    .sort((a, b) => getSmartScore(b) - getSmartScore(a));

export const getOverdueTasks = (tasks: Task[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter(
    (task) =>
      task.status === "pending" &&
      task.dueDate &&
      new Date(task.dueDate).getTime() < today.getTime(),
  );
};

export const getCompletionStreak = (tasks: Task[]) => {
  const completedDays = new Set(
    tasks
      .filter((task) => task.completedAt)
      .map((task) => new Date(task.completedAt as number).toDateString()),
  );
  let streak = 0;
  const cursor = new Date();

  while (completedDays.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const getCompletionTrend = (tasks: Task[], days = 7) => {
  const result = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      key: date.toDateString(),
      completed: 0,
    };
  });

  tasks.forEach((task) => {
    if (!task.completedAt) return;
    const day = result.find(
      (item) => item.key === new Date(task.completedAt as number).toDateString(),
    );
    if (day) day.completed++;
  });

  return result;
};

export const getCategoryAnalytics = (tasks: Task[]) => {
  const map = tasks.reduce<Record<string, { category: string; total: number; completed: number }>>(
    (acc, task) => {
      const category = task.category || "General";
      acc[category] ??= { category, total: 0, completed: 0 };
      acc[category].total++;
      if (task.status === "completed") acc[category].completed++;
      return acc;
    },
    {},
  );

  return Object.values(map);
};

export const calculateAnalytics = (tasks: Task[]) => {
  const today = new Date();

  const result = tasks.reduce(
    (acc, task) => {
      acc.total++;

      if (task.status === "completed") acc.completed++;
      if (task.status === "pending") acc.pending++;
      acc.estimatedMinutes += task.estimatedMinutes || 0;
      acc.actualMinutes += task.actualMinutes || 0;

      if (task.dueDate) {
        acc.withDueDate++;

        if (
          task.status === "pending" &&
          new Date(task.dueDate) < today
        ) {
          acc.overdue++;
        }
      }

      if (
        task.completedAt &&
        new Date(task.completedAt).toDateString() === today.toDateString()
      ) {
        acc.completedToday++;
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
      estimatedMinutes: 0,
      actualMinutes: 0,
    }
  );

  const productivityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (result.total ? Math.round((result.completed / result.total) * 100) : 0) * 0.5 +
          getCompletionStreak(tasks) * 4 -
          result.overdue * 6 +
          Math.max(0, result.actualMinutes - result.estimatedMinutes) * -0.02,
      ),
    ),
  );

  return {
    ...result,
    streak: getCompletionStreak(tasks),
    completedPercent: result.total
      ? Math.round((result.completed / result.total) * 100)
      : 0,
    pendingPercent: result.total
      ? Math.round((result.pending / result.total) * 100)
      : 0,
    productivityScore,
  };
};
