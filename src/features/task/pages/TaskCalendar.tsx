import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import styles from "../styles/Task.module.css";

const TaskCalendar = () => {
  const { tasks, isLoading, error } = useTasks();

  const groupedTasks = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate || task.reminderAt)
      .reduce<Record<string, typeof tasks>>((acc, task) => {
        const key = task.dueDate || task.reminderAt?.slice(0, 10) || "Unscheduled";
        acc[key] ??= [];
        acc[key].push(task);
        return acc;
      }, {});
  }, [tasks]);

  const days = Object.entries(groupedTasks).sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className={styles.container}>
      <div className={styles.pageTitle}>
        <CalendarDays size={24} />
        <h1>Task Calendar</h1>
      </div>
      {isLoading && <p>Loading calendar...</p>}
      {error && <p>{error}</p>}
      <div className={styles.calendarGrid}>
        {days.map(([date, dayTasks]) => (
            <section key={date} className={styles.calendarDay}>
              <h2>{new Date(date).toLocaleDateString()}</h2>
              {dayTasks.map((task) => (
                <article key={task.id} className={styles.calendarTask}>
                  <strong>{task.title}</strong>
                  <span>{task.priority} priority</span>
                  {task.actionType !== "task" && (
                    <span>
                      {task.actionType === "wish" ? "Wish/message" : "Email"} task
                  </span>
                )}
                {task.targetAccount && (
                  <span>
                    {task.targetPlatform}: {task.targetAccount}
                  </span>
                )}
                {task.reminderAt && (
                  <span>Reminder {new Date(task.reminderAt).toLocaleString()}</span>
                )}
              </article>
            ))}
          </section>
        ))}
        {days.length === 0 && <p>No dated tasks yet.</p>}
      </div>
    </main>
  );
};

export default TaskCalendar;
