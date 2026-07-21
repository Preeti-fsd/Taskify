import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../../services/adminApi";
import styles from "../../../styles/sharedPages.module.css";

const AdminAnalyticsPage = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [emailLogs, setEmailLogs] = useState<unknown[]>([]);

  useEffect(() => {
    let active = true;
    adminApi.listUsers().then((result) => {
      if (!active) return;
      setTotalUsers(result.total);
      setEmailLogs(result.emailLogs);
    });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Users", value: totalUsers },
      { label: "Email Logs", value: emailLogs.length },
      { label: "Admin Score", value: Math.min(100, 60 + emailLogs.length) },
      { label: "Health", value: totalUsers > 0 ? "Good" : "Needs data" },
    ],
    [emailLogs.length, totalUsers],
  );

  return (
    <main className={styles.page}>
      <section className={styles.dashboardShell}>
        <section className={`${styles.panel} ${styles.dashboardHero}`}>
          <span className={styles.eyebrow}>Admin analytics</span>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>User growth, email activity, and platform health at a glance.</p>
        </section>

        <section className={styles.statsGrid}>
          {stats.map((stat) => (
            <article key={stat.label} className={styles.statsCard}>
              <h3 className={styles.cardTitle}>{stat.label}</h3>
              <p className={styles.cardValue}>{stat.value}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
};

export default AdminAnalyticsPage;
