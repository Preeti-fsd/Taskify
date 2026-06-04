import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { CSS } from "@dnd-kit/utilities";
import {
  Bell,
  Clock,
  Download,
  FileText,
  GripVertical,
  Mail,
  MessageCircle,
  Pencil,
  Play,
  Save,
  Trash2,
} from "lucide-react";
import styles from "../styles/Task.module.css";
import type { Task } from "../../../types/task";
import { taskApi } from "../../../services/taskApi";

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onSubtaskToggle: (task: Task, subtaskId: string) => void;
  onStartFocus: (task: Task) => void;
}

const TaskItem = ({
  task,
  onDelete,
  onToggle,
  onEdit,
  onSubtaskToggle,
  onStartFocus,
}: TaskItemProps) => {
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
      toast.error("Task title cannot be empty.");
      return;
    }
    onEdit(task.id, editValue.trim());
    setIsEditing(false);
  };

  const openEditor = () => {
    if (task.status === "completed") {
      toast.warning("Can't edit completed tasks.");
      return;
    }

    setIsEditing(true);
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status === "pending";

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

        <div className={styles.taskBody}>
          {isEditing ? (
            <input
              className={styles.editInput}
              value={editValue}
              ref={editInput}
              onChange={(e) => setEditValue(e.target.value)}
            />
          ) : (
            <>
              <span
                data-testid="task-title"
                className={
                  task.status === "completed"
                    ? `${styles.title} ${styles.completed}`
                    : styles.title
                }
              >
                {task.title}
              </span>
              <div className={styles.metaRow}>
                <span className={`${styles.priorityDot} ${styles[task.priority]}`}>
                  {task.priority}
                </span>
                <span>{task.category || "General"}</span>
                {task.actionType === "email" && (
                  <span>
                    <Mail size={14} /> Email
                  </span>
                )}
                {task.actionType === "wish" && (
                  <span>
                    <MessageCircle size={14} /> Wish
                  </span>
                )}
                <span>
                  <Clock size={14} /> {task.actualMinutes || 0}/
                  {task.estimatedMinutes || 0} min
                </span>
                {task.dueDate && (
                  <span className={isOverdue ? styles.overdue : styles.dueDate}>
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                {task.reminderAt && (
                  <span>
                    <Bell size={14} /> {new Date(task.reminderAt).toLocaleDateString()}
                  </span>
                )}
                {task.reminderEnabled && (
                  <span className={styles.statusChip}>Reminder {task.reminderType || "email"}</span>
                )}
                {task.recurring !== "none" && <span>Repeats {task.recurring}</span>}
                {task.sendEmailAfterCompletion && (
                  <span className={styles.statusChip}>Completion email</span>
                )}
                {task.attachments && task.attachments.length > 0 && (
                  <span className={styles.statusChip}>
                    <FileText size={14} /> {task.attachments.length} attachment
                    {task.attachments.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {task.tags.length > 0 && (
                <div className={styles.tagRow}>
                  {task.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(task.targetAccount || task.targetEmail || task.scheduledMessage) && (
                <div className={styles.actionSummary}>
                  {task.targetAccount && (
                    <span>
                      {task.targetPlatform || "Platform"}: {task.targetAccount}
                    </span>
                  )}
                  {task.targetEmail && <span>Email: {task.targetEmail}</span>}
                  {task.scheduledMessage && <p>{task.scheduledMessage}</p>}
                </div>
              )}
              {task.subtasks.length > 0 && (
                <div className={styles.subtaskList}>
                  {task.subtasks.map((subtask) => (
                    <label key={subtask.id} className={styles.subtask}>
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => onSubtaskToggle(task, subtask.id)}
                      />
                      <span>{subtask.title}</span>
                    </label>
                  ))}
                </div>
              )}
              {task.attachments && task.attachments.length > 0 && (
                <div className={styles.attachmentRow}>
                  {task.attachments.map((attachment) => (
                    <button
                      key={attachment.id}
                      className={styles.attachmentLink}
                      type="button"
                      onClick={() =>
                        void taskApi.downloadAttachment(
                          task.id,
                          attachment.id,
                          attachment.originalName,
                        )
                      }
                    >
                      <Download size={14} />
                      {attachment.originalName}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.iconButton}
          onClick={() => onStartFocus(task)}
          aria-label={`Focus on ${task.title}`}
          type="button"
          disabled={task.status === "completed"}
        >
          <Play size={18} />
        </button>
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
            onClick={openEditor}
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
