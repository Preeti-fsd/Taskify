import { useCallback, useEffect, useState } from "react";
import { taskApi } from "../../../services/taskApi";
import type { FocusSession, Task, TaskInput } from "../../../types/task";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTasks(await taskApi.getTasks());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(async (payload: TaskInput) => {
    const task = await taskApi.createTask(payload);
    setTasks((prev) => [task, ...prev]);
  }, []);

  const updateTask = useCallback(
    async (id: string, payload: Parameters<typeof taskApi.updateTask>[1]) => {
      const updatedTask = await taskApi.updateTask(id, payload);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task)),
      );
    },
    [],
  );

  const deleteTask = useCallback(async (id: string) => {
    await taskApi.deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const replaceTasks = useCallback(async (nextTasks: Task[]) => {
    const savedTasks = await taskApi.reorderTasks(nextTasks);
    setTasks(savedTasks);
  }, []);

  const addFocusSession = useCallback(async (task: Task, session: FocusSession) => {
    const updatedTask = await taskApi.addFocusSession(task, session);
    setTasks((prev) =>
      prev.map((item) => (item.id === updatedTask.id ? updatedTask : item)),
    );
  }, []);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    replaceTasks,
    addFocusSession,
    reloadTasks: loadTasks,
  };
};
