import React, { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { toast } from 'sonner'; 
import { CSS } from "@dnd-kit/utilities";
import styles from "../styles/Task.module.css";
import { GripVertical, Pencil, Trash2, Save } from "lucide-react";
import type { Task } from "../../../types/task";
interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

const TaskItem = ({ task, onDelete, onToggle, onEdit }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const editInput = useRef<HTMLInputElement | null>(null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && editInput.current) {
      editInput.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!editValue.trim()) {
      toast.error('Task title cannot be empty.');
      return
    };
    onEdit(task.id, editValue.trim());
    setIsEditing(false);
  };

  const isEditable = (task:Task) => {
    if (task.status === "completed") {
      toast.warning("Can't edit completed tasks.");
    } else {

      setIsEditing(true);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.card}>
      <div className={styles.left}>
        <span
          {...attributes}
          {...listeners}
          className={styles.dragHandle}
          aria-label="Reorder task"
        >
          <GripVertical size={18} />
        </span>
        <label className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            checked={task.status === "completed"}
            onChange={() => onToggle(task.id)}
          />
          <span className={styles.customCheckbox}></span>
        </label>

        {isEditing ? (
          <input
            className={styles.editInput}
            value={editValue}
            ref={editInput}
            onChange={(e) => setEditValue(e.target.value)}
          />
        ) : (
          <span
            className={
              task.status === "completed"
                ? `${styles.title} ${styles.completed}`
                : styles.title
            }
          >
            {task.title}
            {task.dueDate && (
              <span
                className={
                  new Date(task.dueDate) < new Date() &&
                  task.status === "pending"
                    ? styles.overdue
                    : styles.dueDate
                }
              >
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        {isEditing ? (
          <button
            className={styles.iconButton}
            onClick={handleEdit}
            aria-label="Save task"
            type="button"
          >
            <Save size={18} />
          </button>
        ) : (
          <button
            className={styles.iconButton}
            onClick={() => isEditable(task)}
            aria-label="Edit task"
            type="button"
          >
            <Pencil size={18} />
          </button>
        )}

        <button
          className={`${styles.iconButton} ${styles.delete}`}
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
          type="button"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(TaskItem);
