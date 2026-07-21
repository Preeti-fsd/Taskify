import { Download } from "lucide-react";
import type { Task } from "../../../types/task";
import styles from "../styles/Task.module.css";

interface ExportControlsProps {
  tasks: Task[];
}

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const ExportControls = ({ tasks }: ExportControlsProps) => {
  const exportJson = () => {
    downloadFile(JSON.stringify(tasks, null, 2), "taskify-tasks.json", "application/json");
  };

  const exportCsv = () => {
    const headers = [
      "title",
      "status",
      "priority",
      "category",
      "dueDate",
      "estimatedMinutes",
      "actualMinutes",
      "tags",
    ];
    const rows = tasks.map((task) =>
      headers
        .map((key) => {
          const value = key === "tags" ? task.tags.join("|") : task[key as keyof Task];
          return `"${String(value ?? "").replaceAll('"', '""')}"`;
        })
        .join(","),
    );

    downloadFile([headers.join(","), ...rows].join("\n"), "taskify-tasks.csv", "text/csv");
  };

  return (
    <div className={styles.exportControls}>
      <button className={styles.secondaryButton} type="button" onClick={exportCsv}>
        <Download size={16} /> CSV
      </button>
      <button className={styles.secondaryButton} type="button" onClick={exportJson}>
        <Download size={16} /> JSON
      </button>
    </div>
  );
};

export default ExportControls;
