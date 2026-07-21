import { AlertTriangle, Sparkles } from "lucide-react";
import type { Task } from "../../../types/task";
import { getOverdueTasks, getSmartScore, getSmartTasks } from "../utility/taskUtils";
import styles from "../styles/Task.module.css";

interface SmartTaskPanelProps {
  tasks: Task[];
  onApplyRecoveryPlan: (tasks: Task[]) => void;
}

const SmartTaskPanel = ({ tasks, onApplyRecoveryPlan }: SmartTaskPanelProps) => {
  const smartTasks = getSmartTasks(tasks);
  const overdueTasks = getOverdueTasks(tasks);
  const focusTasks = smartTasks.slice(0, 3);

  return (
    <section className={styles.smartPanel}>
      <div className={styles.panelHeader}>
        <h2>
          <Sparkles size={18} /> Smart plan
        </h2>
      </div>

      {overdueTasks.length > 0 && (
        <p className={styles.warningText}>
          <AlertTriangle size={16} /> {overdueTasks.length} overdue task
          {overdueTasks.length > 1 ? "s" : ""} need attention.
        </p>
      )}

      <div className={styles.smartGrid}>
        {focusTasks.map((task) => (
          <article key={task.id} className={styles.smartItem}>
            <strong>Focus: {task.title}</strong>
            <span>{task.category || "General"} · score {getSmartScore(task)}</span>
          </article>
        ))}
        {focusTasks.length === 0 && <p>No pending tasks for today.</p>}
      </div>
      <button
        className={styles.fullWidthButton}
        type="button"
        onClick={() => onApplyRecoveryPlan(smartTasks)}
        disabled={smartTasks.length === 0}
      >
        Apply smart order
      </button>
    </section>
  );
};

export default SmartTaskPanel;
