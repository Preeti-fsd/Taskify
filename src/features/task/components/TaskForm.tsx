import { useState, type FormEvent } from "react";
import { Paperclip, SlidersHorizontal, Upload } from "lucide-react";
import styles from "../styles/Task.module.css";
import type {
  PendingAttachment,
  TaskInput,
  TaskPriority,
  TaskRecurrence,
} from "../../../types/task";

interface TaskFormProps {
  onAdd: (task: TaskInput) => void;
}

const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024;
const allowedAttachmentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "application/zip",
]);

const attachmentToPending = async (file: File): Promise<PendingAttachment> => {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

  return {
    fileName: file.name,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    dataUrl,
  };
};

const TaskForm = ({ onAdd }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [recurring, setRecurring] = useState<TaskRecurrence>("none");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderAt, setReminderAt] = useState("");
  const [scheduledMessage, setScheduledMessage] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const buildPayload = (smart = false): TaskInput => ({
    title: title.trim(),
    dueDate: dueDate || null,
    priority: smart ? (dueDate ? "high" : priority) : priority,
    estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
    reminderEnabled,
    reminderType: "email",
    reminderAt: reminderEnabled ? reminderAt || null : null,
    recurring,
    actionType: "email",
    scheduledMessage: scheduledMessage.trim() || null,
    attachments,
  });

  const resetFields = () => {
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setEstimatedMinutes("");
    setRecurring("none");
    setReminderEnabled(false);
    setReminderAt("");
    setScheduledMessage("");
    setAttachments([]);
    setError("");
  };

  const validateAttachment = (file: File) => {
    if (!allowedAttachmentTypes.has(file.type)) {
      throw new Error(`Unsupported file type: ${file.name}`);
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      throw new Error(`Attachment is too large: ${file.name}`);
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    try {
      const nextAttachments: PendingAttachment[] = [];
      for (const file of Array.from(files)) {
        validateAttachment(file);
        nextAttachments.push(await attachmentToPending(file));
      }
      setAttachments((prev) => [...prev, ...nextAttachments]);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read attachment.");
    }
  };

  const submitTask = (smart = false) => {
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (estimatedMinutes && Number.isNaN(Number(estimatedMinutes))) {
      setError("Estimate must be a valid number.");
      return;
    }

    if (reminderEnabled && !reminderAt) {
      setError("Reminder date and time is required when reminders are enabled.");
      return;
    }

    onAdd(buildPayload(smart));
    resetFields();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitTask(false);
  };

  return (
    <form className={styles.formCard} onSubmit={handleSubmit}>
      <p className={styles.muted}>Task title is required. Everything else is optional.</p>
      {error && <p className={styles.errorText}>{error}</p>}
      <div className={styles.quickAddRow}>
        <input
          className={styles.taskInput}
          type="text"
          placeholder="Enter a task..."
          value={title}
          data-testid="Form input"
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.dateInput}
          aria-label="Due date"
        />
        <button
          className={styles.advancedToggle}
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal size={16} />
          Advanced
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => submitTask(true)}
          disabled={!title.trim()}
        >
          Smart Add
        </button>
        <button
          className={`${styles.addButton} ${!title.trim() ? styles.disabled : ""}`}
          type="submit"
          disabled={!title.trim()}
          aria-label="Add task"
        >
          Add Task
        </button>
      </div>

      {showAdvanced && (
        <div className={styles.advancedFields}>
          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className={styles.selectInput}
              aria-label="Priority"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
          </label>
          <label>
            Estimate (minutes)
            <input
              type="number"
              min="0"
              placeholder="Optional estimate"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className={styles.numberInput}
              aria-label="Estimated minutes"
            />
          </label>
          <label>
            Repeat
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as TaskRecurrence)}
              className={styles.selectInput}
              aria-label="Recurring task"
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label>
            Reminder enabled
            <div className={styles.toggleGroup} role="radiogroup" aria-label="Reminder enabled">
              <button
                type="button"
                className={reminderEnabled ? styles.toggleButtonActive : styles.toggleButton}
                aria-pressed={reminderEnabled}
                onClick={() => setReminderEnabled(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={!reminderEnabled ? styles.toggleButtonActive : styles.toggleButton}
                aria-pressed={!reminderEnabled}
                onClick={() => setReminderEnabled(false)}
              >
                No
              </button>
            </div>
          </label>
          <label className={`${styles.wideField} ${styles.reminderField}`}>
            Reminder date and time
            <span className={styles.fieldHint}>Local date and time, used for email reminders.</span>
            <input
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              className={styles.reminderDateInput}
              aria-label="Reminder date and time"
              step="60"
            />
          </label>
          <label className={styles.wideField}>
            Reminder note
            <textarea
              placeholder="Optional reminder message"
              value={scheduledMessage}
              onChange={(e) => setScheduledMessage(e.target.value)}
            />
          </label>

          <div
            className={styles.wideField}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void handleFiles(e.dataTransfer.files);
            }}
          >
            <label className={styles.uploadArea} data-dragging={isDragging ? "true" : "false"}>
              <span className={styles.label}>
                <Upload size={16} /> Upload Document
              </span>
              <span className={styles.muted}>
                PDF, DOC, DOCX, PNG, JPG, ZIP up to 20MB.
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                onChange={(e) => {
                  if (e.target.files) {
                    void handleFiles(e.target.files);
                  }
                }}
              />
            </label>
            {attachments.length > 0 && (
              <div className={styles.attachmentList}>
                {attachments.map((attachment, index) => (
                  <div key={`${attachment.fileName}-${index}`} className={styles.attachmentItem}>
                    <Paperclip size={14} />
                    <span>{attachment.originalName}</span>
                    <span className={styles.muted}>{Math.ceil(attachment.size / 1024)} KB</span>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() =>
                        setAttachments((prev) => prev.filter((_, attachmentIndex) => attachmentIndex !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default TaskForm;
