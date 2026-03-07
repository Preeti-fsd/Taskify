import { useState } from "react";
import styles from "../styles/Task.module.css";

interface TaskFormProps {
  onAdd: (title: string, dueDate?: string) => void;
}

const TaskForm = ({ onAdd }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd(title.trim(), dueDate);
    setTitle("");
    setDueDate("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Enter a task..."
        value={title}
        data-testid='Form input'
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className={styles.dateInput}
      />
      <button
        className={`${styles.addButton} ${!title.trim() ? styles.disabled : ""}`}
        type="submit"
        disabled={!title.trim()}
        aria-label="Add btn"
      >
        Add
      </button>
    </form>
  );
};

export default TaskForm;
