import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "../../../styles/sharedPages.module.css";
import { notificationApi } from "../../../services/notificationApi";
import type { NotificationEvent } from "../../../types/notification";

const NotificationCenterPage = () => {
  const [items, setItems] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    notificationApi
      .listNotifications()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load notifications."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(
    () => ({
      scheduled: items.filter((item) => item.status === "scheduled"),
      sent: items.filter((item) => item.status === "sent"),
      failed: items.filter((item) => item.status === "failed"),
    }),
    [items],
  );

  const handleRetry = async (id: number) => {
    try {
      const updated = await notificationApi.retryNotification(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success("Notification queued for retry.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to retry notification.");
    }
  };

  const renderSection = (title: string, rows: NotificationEvent[]) => (
    <section className={`${styles.panel} ${styles.stack}`}>
      <div className={styles.sectionHeader}>
        <div className={styles.stack}>
          <span className={styles.eyebrow}>{title}</span>
          <h2 className={styles.cardTitle}>{title}</h2>
        </div>
        <span className={styles.status}>{rows.length} items</span>
      </div>
      {rows.length === 0 ? (
        <p className={styles.muted}>No {title.toLowerCase()} notifications yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Title</th>
                <th>Status</th>
                <th>Retry</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.event}</td>
                  <td>
                    <strong>{item.title}</strong>
                    <p className={styles.muted}>{item.message}</p>
                  </td>
                  <td><span className={styles.status}>{item.status}</span></td>
                  <td>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => void handleRetry(item.id)}
                      disabled={item.status !== "failed"}
                    >
                      Retry
                    </button>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={`${styles.panel} ${styles.stack}`}>
          <p className={styles.muted}>Loading notification center...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={`${styles.panel} ${styles.stack}`}>
        <span className={styles.eyebrow}>Inbox</span>
        <h1 className={styles.title}>Notification Center</h1>
        <p className={styles.subtitle}>
          Track scheduled, sent, and failed email events here. Failed items can be retried from this
          screen.
        </p>
      </section>

      <div className={styles.listStack} style={{ marginTop: 18 }}>
        {renderSection("Scheduled", grouped.scheduled)}
        {renderSection("Sent", grouped.sent)}
        {renderSection("Failed", grouped.failed)}
      </div>
    </main>
  );
};

export default NotificationCenterPage;
