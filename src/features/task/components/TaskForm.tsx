import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Paperclip, SlidersHorizontal, Upload } from "lucide-react";
import styles from "../styles/Task.module.css";
import { useAuth } from "../../../context/useAuth";
import type {
  PendingAttachment,
  TaskActionType,
  TaskInput,
  TaskPriority,
  TaskRecurrence,
  ReminderTiming,
  ReminderType,
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

const reminderOffsets: Record<Exclude<ReminderTiming, "custom">, number> = {
  "5 min before": 5,
  "15 min": 15,
  "30 min": 30,
  "1 hour": 60,
  "1 day": 24 * 60,
};

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
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [recurring, setRecurring] = useState<TaskRecurrence>("none");
  const [subtasks, setSubtasks] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [actionType, setActionType] = useState<TaskActionType>("task");
  const [targetEmail, setTargetEmail] = useState("");
  const [targetPlatform, setTargetPlatform] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [scheduledMessage, setScheduledMessage] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderType, setReminderType] = useState<ReminderType>("both");
  const [reminderTiming, setReminderTiming] = useState<ReminderTiming>("15 min");
  const [reminderCustomMinutes, setReminderCustomMinutes] = useState("15");
  const [reminderAt, setReminderAt] = useState("");
  const [sendEmailAfterCompletion, setSendEmailAfterCompletion] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [includeAttachment, setIncludeAttachment] = useState(true);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!recipientEmail && user?.email) {
      setRecipientEmail(user.email);
    }
  }, [recipientEmail, user?.email]);

  const computedReminderAt = useMemo(() => {
    if (!reminderEnabled) return null;
    if (dueDate) {
      const due = new Date(dueDate);
      const offsetMinutes =
        reminderTiming === "custom"
          ? Number(reminderCustomMinutes || 0)
          : reminderOffsets[reminderTiming] || 15;
      if (!Number.isFinite(offsetMinutes) || offsetMinutes < 0) return null;
      return new Date(due.getTime() - offsetMinutes * 60 * 1000).toISOString();
    }
    return reminderAt || null;
  }, [dueDate, reminderAt, reminderCustomMinutes, reminderEnabled, reminderTiming]);

  const buildPayload = (smart = false): TaskInput => ({
    title: title.trim(),
    dueDate: dueDate || null,
    priority: smart ? (dueDate ? "high" : priority) : priority,
    category: category.trim() || null,
    tags: tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
    reminderEnabled,
    reminderType,
    reminderTiming,
    reminderCustomMinutes:
      reminderTiming === "custom" ? Number(reminderCustomMinutes || 0) : null,
    reminderAt: computedReminderAt,
    recurring,
    actionType,
    targetEmail: targetEmail.trim() || null,
    targetPlatform: targetPlatform.trim() || null,
    targetAccount: targetAccount.trim() || null,
    scheduledMessage: scheduledMessage.trim() || null,
    attachments,
    sendEmailAfterCompletion,
    recipientEmail: recipientEmail.trim() || null,
    emailSubject: emailSubject.trim() || null,
    emailMessage: emailMessage.trim() || null,
    includeAttachment,
    subtasks: subtasks
      .split(",")
      .map((subtask) => subtask.trim())
      .filter(Boolean)
      .map((subtask) => ({
        id: crypto.randomUUID(),
        title: subtask,
        completed: false,
      })),
  });

  const resetFields = () => {
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setCategory("");
    setTags("");
    setEstimatedMinutes("");
    setRecurring("none");
    setSubtasks("");
    setActionType("task");
    setTargetEmail("");
    setTargetPlatform("");
    setTargetAccount("");
    setScheduledMessage("");
    setReminderEnabled(false);
    setReminderType("both");
    setReminderTiming("15 min");
    setReminderCustomMinutes("15");
    setReminderAt("");
    setSendEmailAfterCompletion(false);
    setRecipientEmail(user?.email || "");
    setEmailSubject("");
    setEmailMessage("");
    setIncludeAttachment(true);
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

    if (reminderTiming === "custom" && Number.isNaN(Number(reminderCustomMinutes))) {
      setError("Custom reminder minutes must be a valid number.");
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
            Category
            <input
              className={styles.input}
              type="text"
              placeholder="Optional category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
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
            <select
              value={String(reminderEnabled)}
              onChange={(e) => setReminderEnabled(e.target.value === "true")}
              className={styles.selectInput}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label>
            Reminder type
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as ReminderType)}
              className={styles.selectInput}
            >
              <option value="email">Email</option>
              <option value="in-app">In-App</option>
              <option value="both">Both</option>
            </select>
          </label>
          <label>
            Reminder timing
            <select
              value={reminderTiming}
              onChange={(e) => setReminderTiming(e.target.value as ReminderTiming)}
              className={styles.selectInput}
            >
              <option value="5 min before">5 min before</option>
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
              <option value="1 hour">1 hour</option>
              <option value="1 day">1 day</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          {reminderTiming === "custom" ? (
            <label>
              Custom reminder minutes
              <input
                type="number"
                min="1"
                value={reminderCustomMinutes}
                onChange={(e) => setReminderCustomMinutes(e.target.value)}
                className={styles.numberInput}
              />
            </label>
          ) : (
            <label>
              Reminder time
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className={styles.dateInput}
                aria-label="Reminder time"
              />
            </label>
          )}
          <label className={styles.wideField}>
            Reminder note
            <textarea
              placeholder="Optional reminder message"
              value={scheduledMessage}
              onChange={(e) => setScheduledMessage(e.target.value)}
            />
          </label>
          <label>
            Action type
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as TaskActionType)}
              className={styles.selectInput}
              aria-label="Action type"
            >
              <option value="task">Normal task</option>
              <option value="email">Email reminder</option>
              <option value="wish">Wish/message reminder</option>
            </select>
          </label>
          {(actionType === "email" || actionType === "wish") && (
            <label>
              Email target
              <input
                className={styles.input}
                type="email"
                placeholder="Optional email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </label>
          )}
          {actionType === "wish" && (
            <>
              <label>
                Platform
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className={styles.selectInput}
                  aria-label="Wish platform"
                >
                  <option value="">Optional platform</option>
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                Account name
                <input
                  className={styles.input}
                  type="text"
                  placeholder="@username"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                />
              </label>
            </>
          )}
          <label>
            Tags
            <input
              className={styles.input}
              type="text"
              placeholder="Optional tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </label>
          <label className={styles.wideField}>
            Subtasks
            <input
              className={styles.input}
              type="text"
              placeholder="Optional subtasks"
              value={subtasks}
              onChange={(e) => setSubtasks(e.target.value)}
            />
          </label>

          <div className={styles.wideField} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}>
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

          <label className={styles.wideField}>
            Completion email subject
            <input
              className={styles.input}
              type="text"
              placeholder={`Task Completed: ${title || "Task"}`}
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </label>
          <label className={styles.wideField}>
            Completion email message
            <textarea
              placeholder="Optional custom completion message"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
            />
          </label>
          <label>
            Send Email After Completion
            <select
              value={String(sendEmailAfterCompletion)}
              onChange={(e) => setSendEmailAfterCompletion(e.target.value === "true")}
              className={styles.selectInput}
            >
              <option value="false">Off</option>
              <option value="true">On</option>
            </select>
          </label>
          <label>
            Recipient Email
            <input
              className={styles.input}
              type="email"
              placeholder={user?.email || "recipient@example.com"}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </label>
          <label>
            Include Attachments
            <select
              value={String(includeAttachment)}
              onChange={(e) => setIncludeAttachment(e.target.value === "true")}
              className={styles.selectInput}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        </div>
      )}
    </form>
  );
};

export default TaskForm;
