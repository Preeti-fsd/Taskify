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

  const stats = useMemo(
    () => ({
      total: items.length,
      failed: items.filter((item) => item.status === "failed").length,
      sent: items.filter((item) => item.status === "sent").length,
      scheduled: items.filter((item) => item.status === "scheduled").length,
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
        <h1 className={styles.title}>Notifications</h1>
        <p className={styles.subtitle}>
          One simple list for recent notification activity. Retry only failed items when needed.
        </p>
        <div className={styles.dashboardActions}>
          <span className={styles.status}>Total {stats.total}</span>
          <span className={styles.status}>Scheduled {stats.scheduled}</span>
          <span className={styles.status}>Sent {stats.sent}</span>
          <span className={styles.status}>Failed {stats.failed}</span>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.stack}`} style={{ marginTop: 18 }}>
        {items.length === 0 ? (
          <p className={styles.muted}>No notifications yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <p className={styles.muted}>{item.message}</p>
                    </td>
                    <td>
                      <span className={styles.status}>{item.status}</span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default NotificationCenterPage;
