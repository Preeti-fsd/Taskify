import { useMemo, useState, useCallback } from "react";
import type { FocusSession, Task, TaskInput, TaskStatus } from "../../../types/task";
import { filterTasks, getSmartTasks } from "../utility/taskUtils";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import FilterBar from "../../../components/filters/FilterBar";
import SmartTaskPanel from "../components/SmartTaskPanel";
import FocusPanel from "../components/FocusPanel";
import ExportControls from "../components/ExportControls";
import styles from "../styles/Task.module.css";
import { toast } from "sonner";
import { useTasks } from "../hooks/useTasks";
import { useTaskReminders } from "../hooks/useTaskReminders";

const TaskPage = () => {
  const {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    replaceTasks,
    addFocusSession,
  } = useTasks();
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "asc" | "desc" | "smart">("created");
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const handleReminderShown = useCallback(
    async (task: Task) => {
      await updateTask(task.id, { reminderSentAt: Date.now() });
    },
    [updateTask],
  );

  useTaskReminders(tasks, handleReminderShown);

  const handleAddTask = async (payload: TaskInput) => {
    try {
      await addTask(payload);
      toast.success("Task added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add task.");
    }
  };

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        await deleteTask(id);
        toast.success("Task deleted.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to delete task.");
      }
    },
    [deleteTask],
  );

  const handleToggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;

      try {
        await updateTask(id, {
          status: task.status === "pending" ? "completed" : "pending",
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to update task.");
      }
    },
    [tasks, updateTask],
  );

  const handleEditTask = useCallback(
    async (id: string, newTitle: string) => {
      try {
        await updateTask(id, { title: newTitle });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to edit task.");
      }
    },
    [updateTask],
  );

  const handleSubtaskToggle = useCallback(
    async (task: Task, subtaskId: string) => {
      try {
        await updateTask(task.id, {
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask,
          ),
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to update subtask.");
      }
    },
    [updateTask],
  );

  const handleFocusSession = useCallback(
    async (task: Task, session: FocusSession) => {
      try {
        await addFocusSession(task, session);
        toast.success("Focus session logged.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to log focus session.");
      }
    },
    [addFocusSession],
  );

  const handleReorder = useCallback(
    async (visibleTasks: Task[]) => {
      const visibleTaskIds = new Set(visibleTasks.map((task) => task.id));
      let visibleIndex = 0;
      const nextTasks = tasks.map((task) =>
        visibleTaskIds.has(task.id) ? visibleTasks[visibleIndex++] : task,
      );

      try {
        await replaceTasks(nextTasks);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to reorder tasks.");
      }
    },
    [replaceTasks, tasks],
  );

  const applyRecoveryPlan = async (smartTasks: Task[]) => {
    const smartIds = new Set(smartTasks.map((task) => task.id));
    const nextTasks = [...smartTasks, ...tasks.filter((task) => !smartIds.has(task.id))];

    try {
      await replaceTasks(nextTasks);
      setSortBy("smart");
      toast.success("Smart plan applied.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to apply plan.");
    }
  };

  const filteredTasks = useMemo(() => {
    let result = filterTasks(tasks, filter);

    if (searchTerm.trim()) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (sortBy === "smart") {
      return getSmartTasks(result);
    }

    return result;
  }, [tasks, filter, searchTerm, sortBy]);

  const handleSortChange = async (value: "created" | "asc" | "desc" | "smart") => {
    setSortBy(value);
    const sorted = value === "smart" ? getSmartTasks(tasks) : [...tasks];

    if (value === "asc") sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (value === "desc") sorted.sort((a, b) => b.title.localeCompare(a.title));
    if (value === "created") {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    }

    try {
      await replaceTasks(sorted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to sort tasks.");
    }
  };

  if (isLoading) {
    return <p className={styles.container}>Loading tasks...</p>;
  }

  return (
    <main className={styles.container}>
      <section className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <span className={styles.kicker}>Workspace</span>
          <h1>Task Manager</h1>
          <p className={styles.subtitle}>Manage smarter. Finish faster.</p>
        </div>
        <ExportControls tasks={tasks} />
      </section>

      {error && <p className={styles.errorText}>{error}</p>}

      <section className={styles.createSection}>
        <TaskForm onAdd={handleAddTask} />
      </section>

      <div className={styles.taskLayout}>
        <aside className={styles.sidePanel}>
          <SmartTaskPanel tasks={tasks} onApplyRecoveryPlan={applyRecoveryPlan} />
        </aside>

        <section className={styles.taskColumn}>
          <FocusPanel
            task={focusTask}
            onClose={() => setFocusTask(null)}
            onCompleteSession={handleFocusSession}
          />
          <div className={styles.toolbarRow}>
            <FilterBar
              filter={filter}
              setFilter={setFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              task={tasks}
            />
          </div>
          <TaskList
            tasks={filteredTasks}
            onDelete={handleDeleteTask}
            onToggle={handleToggleTask}
            onEdit={handleEditTask}
            onSubtaskToggle={handleSubtaskToggle}
            onStartFocus={setFocusTask}
            onReorder={handleReorder}
          />
        </section>
      </div>
    </main>
  );
};

export default TaskPage;
