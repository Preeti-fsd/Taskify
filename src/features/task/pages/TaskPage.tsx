import { useMemo, useState, useCallback } from "react";
import type { Task, TaskStatus } from "../../../types/task";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { createTask, filterTasks } from "../utility/taskUtils";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import FilterBar from "../../../components/filters/FilterBar";
import styles from '../styles/Task.module.css'
import { toast } from "sonner";
const TaskPage = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "asc" | "desc">("created");

  const handleAddTask = (title: string, dueDate?: string) => {
    const newTask = createTask(title, dueDate);
    setTasks((prev) => [newTask, ...prev]);
    toast.success('New Task Added.');
  };

  const handleDeleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success('Task Deleted.');
    },
    [setTasks],
  );

  const handleToggleTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                status: task.status === "pending" ? "completed" : "pending",
              }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const handleEditTask = useCallback(
    (id: string, newTitle: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, title: newTitle, updateAt: new Date().toISOString() }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const handleReorder = useCallback(
    (newTasks: Task[]) => {
      setTasks(newTasks);
    },
    [setTasks],
  );

  const filteredTasks = useMemo(() => {
    let result = filterTasks(tasks, filter);

    if (searchTerm.trim()) {
      result = result.filter((task) =>
        task.title.toLowerCase().startsWith(searchTerm.toLowerCase()),
      );
    }
    console.log(result)
    return result;
  }, [tasks, filter, searchTerm]);

  const handleSortChange = (value: "created" | "asc" | "desc") => {
    setSortBy(value);
    const sorted = [...tasks];

    if (value === "asc") sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (value === "desc") sorted.sort((a, b) => b.title.localeCompare(a.title));
    if (value === "created")
      sorted.sort((a, b) => b.createdAt - a.createdAt);

    setTasks(sorted);
  };

  return (
    <>
    <div className={styles.container}>
      <TaskForm onAdd={handleAddTask} />
      <FilterBar
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        task={tasks}
      />
      <TaskList
        tasks={filteredTasks}
        onDelete={handleDeleteTask}
        onToggle={handleToggleTask}
        onEdit={handleEditTask}
        onReorder={handleReorder}
      />
    </div>
    </>
  );
};

export default TaskPage;