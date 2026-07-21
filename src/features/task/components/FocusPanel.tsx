import { useEffect, useMemo, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import type { FocusSession, Task } from "../../../types/task";
import styles from "../styles/Task.module.css";

interface FocusPanelProps {
  task: Task | null;
  onClose: () => void;
  onCompleteSession: (task: Task, session: FocusSession) => void;
}

const FocusPanel = ({ task, onClose, onCompleteSession }: FocusPanelProps) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!task || !isRunning) return undefined;

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, task]);

  useEffect(() => {
    if (secondsLeft === 0 && task && startedAt) {
      handleStop();
    }
  }, [secondsLeft, task, startedAt]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  if (!task) return null;

  const handleStart = () => {
    setStartedAt(Date.now());
    setIsRunning(true);
  };

  function handleStop() {
    if (!task) return;

    const end = Date.now();
    const start = startedAt || end - (25 * 60 - secondsLeft) * 1000;
    const minutes = Math.max(1, Math.round((end - start) / 60000));

    onCompleteSession(task, {
      id: crypto.randomUUID(),
      startedAt: start,
      endedAt: end,
      minutes,
    });
    setIsRunning(false);
    setStartedAt(null);
    setSecondsLeft(25 * 60);
  }

  return (
    <section className={styles.focusPanel}>
      <div>
        <span className={styles.kicker}>Focus mode</span>
        <h2>{task.title}</h2>
        <p>{task.actualMinutes || 0} actual minutes logged</p>
      </div>
      <strong className={styles.timer}>{timeLabel}</strong>
      <div className={styles.focusActions}>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={isRunning ? () => setIsRunning(false) : handleStart}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className={styles.secondaryButton} type="button" onClick={handleStop}>
          <Square size={16} /> Log session
        </button>
        <button className={styles.iconButton} type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </section>
  );
};

export default FocusPanel;
