import styles from "../../../styles/sharedPages.module.css";

const AdminSettingsPage = () => {
  return (
    <main className={styles.page}>
      <section className={`${styles.panel} ${styles.stack}`}>
        <span className={styles.eyebrow}>Admin</span>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>
          Admin settings are reserved for environment, email, and access configuration.
        </p>
        <div className={styles.twoCol}>
          <article className={styles.infoCard}>
            <h2 className={styles.cardTitle}>Email</h2>
            <p className={styles.muted}>SMTP delivery, templates, and retry behavior live in server configuration.</p>
          </article>
          <article className={styles.infoCard}>
            <h2 className={styles.cardTitle}>Access</h2>
            <p className={styles.muted}>Admins sign in through the regular login route and inherit user features automatically.</p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default AdminSettingsPage;
