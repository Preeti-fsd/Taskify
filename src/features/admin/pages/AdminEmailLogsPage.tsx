import { useEffect, useState } from "react";
import { adminApi } from "../../../services/adminApi";
import styles from "../../../styles/sharedPages.module.css";

const AdminEmailLogsPage = () => {
  const [logs, setLogs] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminApi
      .listUsers()
      .then((result) => {
        if (!active) return;
        setLogs(result.emailLogs);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={`${styles.panel} ${styles.stack}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.stack}>
            <span className={styles.eyebrow}>Admin</span>
            <h1 className={styles.title}>Email Logs</h1>
          </div>
        </div>
        {loading ? (
          <p className={styles.muted}>Loading email logs...</p>
        ) : (
          <pre className={styles.notice} style={{ overflowX: "auto", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(logs, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
};

export default AdminEmailLogsPage;
