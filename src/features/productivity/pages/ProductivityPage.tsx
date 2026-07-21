import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTasks } from "../../task/hooks/useTasks";
import { taskApi } from "../../../services/taskApi";
import styles from "../../../styles/sharedPages.module.css";

const MOOD_MODES = {
  energetic: 30 * 60,
  normal: 25 * 60,
  tired: 20 * 60,
} as const;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const ProductivityPage = () => {
  const { tasks, addFocusSession } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState(MOOD_MODES.normal);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [minutesFocused, setMinutesFocused] = useState(0);
  const [mood, setMood] = useState<keyof typeof MOOD_MODES>("normal");
  const focusLocked = running;

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || null,
    [selectedTaskId, tasks],
  );

  const productiveScore = useMemo(() => {
    const focusPoints = Math.min(45, Math.round(minutesFocused * 1.5));
    const sessionPoints = Math.min(30, sessions * 6);
    const taskPoints = Math.min(25, tasks.filter((task) => task.status === "completed").length * 5);
    return Math.min(100, focusPoints + sessionPoints + taskPoints);
  }, [minutesFocused, sessions, tasks]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (secondsLeft > 0 || !running) return;
    setRunning(false);
    toast.success("Focus session completed.");
    setSessions((value) => value + 1);
    setMinutesFocused((value) => value + Math.ceil(MOOD_MODES[mood] / 60));
    setSecondsLeft(MOOD_MODES[mood]);
  }, [mood, running, secondsLeft]);

  useEffect(() => {
    setSecondsLeft(MOOD_MODES[mood]);
    setRunning(false);
  }, [mood]);

  const startFocus = async () => {
    if (!selectedTask) {
      toast.error("Pick a task first.");
      return;
    }

    setRunning(true);
  };

  const logSession = async () => {
    if (!selectedTask) return;

    const minutes = Math.round((MOOD_MODES[mood] - secondsLeft) / 60) || Math.round(MOOD_MODES[mood] / 60);
    const session = {
      id: crypto.randomUUID(),
      startedAt: Date.now() - minutes * 60 * 1000,
      endedAt: Date.now(),
      minutes,
    };

    await addFocusSession(selectedTask, session);
    setSessions((prev) => prev + 1);
    setMinutesFocused((prev) => prev + minutes);
    toast.success("Focus session logged.");
  };

  const handleNotify = async () => {
    await taskApi.sendEmailReminders();
    toast.success("Reminder email check triggered.");
  };

  return (
    <main className={styles.page}>
      <section className={`${styles.panel} ${styles.dashboardHero}`} style={{ marginBottom: 24 }}>
        <span className={styles.eyebrow}>Focus studio</span>
        <h1 className={styles.title}>Productivity</h1>
        <p className={styles.subtitle}>Focus mode, Pomodoro timing, and quick time tracking live here.</p>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={`${styles.card} ${styles.centered}`}>
          <span className={styles.eyebrow}>Timer</span>
          <div style={{ fontSize: "clamp(3rem, 10vw, 6rem)", fontWeight: 900, letterSpacing: "-0.08em", margin: "14px 0" }}>
            {formatTime(secondsLeft)}
          </div>
          <p className={styles.muted}>{mood === "energetic" ? "Energetic mode" : mood === "tired" ? "Tired mode" : "Normal mode"}</p>
          <div className={styles.actions} style={{ justifyContent: "center" }}>
            <button className={styles.button} type="button" onClick={() => setRunning((value) => !value)}>
              {running ? "Pause" : "Start"}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              disabled={focusLocked}
              onClick={() => {
                setRunning(false);
                setSecondsLeft(MOOD_MODES[mood]);
              }}
            >
              Reset
            </button>
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Mood Mode</h2>
          <p className={styles.muted}>Adjust focus length based on your energy level.</p>
          <div className={styles.actions}>
            {(["energetic", "normal", "tired"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={mood === mode ? styles.button : styles.secondaryButton}
                disabled={focusLocked}
                onClick={() => setMood(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Productivity Score</h2>
          <p className={styles.cardValue}>{productiveScore}/100</p>
          <p className={styles.muted}>Daily score based on focused time, sessions, and completed work.</p>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Sessions</h2>
          <p className={styles.cardValue}>{sessions}</p>
          <p className={styles.muted}>Completed focus blocks today.</p>
        </article>
      </section>

      <section className={`${styles.panel} ${styles.stack}`} style={{ marginTop: 18 }}>
        <div className={styles.sectionHeader}>
          <div className={styles.stack}>
            <h2 className={styles.cardTitle}>Daily Focus</h2>
            <p className={styles.muted}>Track today's minutes, recent progress, and your next task.</p>
            {focusLocked && <p className={styles.muted}>Focus mode is locked. Pause the timer to change task or session controls.</p>}
          </div>
          <button className={styles.secondaryButton} type="button" onClick={handleNotify} disabled={focusLocked}>
            Run reminders
          </button>
        </div>

        <select
          className={styles.select}
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          disabled={focusLocked}
        >
          <option value="">Select task</option>
          {tasks.map((task) => (
            <option value={task.id} key={task.id}>
              {task.title}
            </option>
          ))}
        </select>

        <div className={styles.actions}>
          <button className={styles.button} type="button" onClick={() => void startFocus()} disabled={!selectedTask || focusLocked}>
            Start focus mode
          </button>
          <button className={styles.secondaryButton} type="button" onClick={() => void logSession()} disabled={!selectedTask || focusLocked}>
            Log session
          </button>
        </div>

        <p className={styles.muted}>
          Selected task: {selectedTask ? selectedTask.title : "Choose a task below to begin."}
        </p>
      </section>
    </main>
  );
};

export default ProductivityPage;
