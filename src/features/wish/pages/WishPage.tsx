import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { wishApi } from "../../../services/wishApi";
import type { Wish } from "../../../types/wish";
import styles from "../../../styles/sharedPages.module.css";

const emptyWish = {
  recipientEmail: "",
  subject: "",
  message: "",
  scheduledTime: "",
};

const WishPage = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [form, setForm] = useState(emptyWish);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadWishes = async () => {
    setLoading(true);
    setError("");
    try {
      setWishes(await wishApi.listWishes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load wishes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWishes();
  }, []);

  const editingWish = useMemo(() => wishes.find((wish) => wish.id === editingId) || null, [editingId, wishes]);

  useEffect(() => {
    if (!editingWish) return;
    setForm({
      recipientEmail: editingWish.recipient_email,
      subject: editingWish.subject,
      message: editingWish.message,
      scheduledTime: editingWish.scheduled_time ? editingWish.scheduled_time.slice(0, 16) : "",
    });
  }, [editingWish]);

  const resetForm = () => {
    setForm(emptyWish);
    setEditingId(null);
  };

  const submitWish = async (sendNow = false) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        const updated = await wishApi.updateWish(editingId, {
          recipientEmail: form.recipientEmail,
          subject: form.subject,
          message: form.message,
          scheduledTime: form.scheduledTime || undefined,
        });
        setWishes((prev) => prev.map((wish) => (wish.id === updated.id ? updated : wish)));
        toast.success("Scheduled wish updated.");
      } else {
        const created = await wishApi.createWish({
          recipientEmail: form.recipientEmail,
          subject: form.subject,
          message: form.message,
          scheduledTime: form.scheduledTime || undefined,
          sendNow,
        });
        setWishes((prev) => [created, ...prev]);
        toast.success(sendNow ? "Wish sent." : "Wish scheduled.");
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save wish.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWishNow = async (id: string) => {
    try {
      const updated = await wishApi.sendWishNow(id);
      setWishes((prev) => prev.map((wish) => (wish.id === id ? updated : wish)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send wish.");
    }
  };

  const handleCancelWish = async (id: string) => {
    try {
      const updated = await wishApi.cancelWish(id);
      setWishes((prev) => prev.map((wish) => (wish.id === id ? updated : wish)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel wish.");
    }
  };

  const exportCopy = () => {
    const content = [form.subject, "", form.message].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wish-copy.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.titleBlock}>
          <span className={styles.eyebrow}>Email workspace</span>
          <h1 className={styles.title}>Mail Studio</h1>
          <p className={styles.subtitle}>Compose, schedule, and track emails in one place.</p>
        </div>
        <div className={styles.notice}>
          <strong>Fast flow</strong>
          <p className={styles.muted}>Write a message, send it now, or queue it for later without leaving the page.</p>
        </div>
      </section>

      {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

      <section className={`${styles.panel} ${styles.stack}`}>
        <div className={styles.threeCol}>
          <label className={styles.field}>
            <span className={styles.label}>Recipient Email</span>
            <input className={styles.input} type="email" value={form.recipientEmail} onChange={(e) => setForm((prev) => ({ ...prev, recipientEmail: e.target.value }))} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Subject</span>
            <input className={styles.input} value={form.subject} onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Schedule Time</span>
            <input className={styles.input} type="datetime-local" value={form.scheduledTime} onChange={(e) => setForm((prev) => ({ ...prev, scheduledTime: e.target.value }))} />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.label}>Message</span>
            <textarea className={styles.textarea} value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} />
          </label>
        </div>

        <div className={styles.actions}>
          <button className={styles.button} type="button" disabled={submitting} onClick={() => void submitWish(true)}>Send Now</button>
          <button className={styles.secondaryButton} type="button" disabled={submitting} onClick={() => void submitWish(false)}>Schedule</button>
          <button className={styles.secondaryButton} type="button" onClick={exportCopy}>Download Copy</button>
          {editingId && <button className={styles.dangerButton} type="button" onClick={resetForm}>Cancel edit</button>}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.stack}`} style={{ marginTop: 18 }}>
        <h2 className={styles.cardTitle}>Scheduled Wishes</h2>
        {loading ? (
          <p className={styles.muted}>Loading wishes...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wishes.map((wish) => (
                  <tr key={wish.id}>
                    <td>{wish.recipient_email}</td>
                    <td>{wish.subject}</td>
                    <td>{wish.scheduled_time ? new Date(wish.scheduled_time).toLocaleString() : "Send now"}</td>
                    <td><span className={styles.status}>{wish.status}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.secondaryButton} type="button" onClick={() => setEditingId(wish.id)}>Edit</button>
                        <button className={styles.secondaryButton} type="button" onClick={() => void handleSendWishNow(wish.id)}>Send</button>
                        <button className={styles.dangerButton} type="button" onClick={() => void handleCancelWish(wish.id)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {wishes.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.muted}>No wishes yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default WishPage;
