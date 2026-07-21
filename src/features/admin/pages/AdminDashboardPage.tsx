import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../../services/adminApi";
import { useAuth } from "../../../context/useAuth";
import styles from "../../../styles/sharedPages.module.css";
import type { AdminUserRow } from "../../../services/adminApi";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [recentUsers, setRecentUsers] = useState<AdminUserRow[]>([]);
  const [loggedInUsers, setLoggedInUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminApi
      .listUsers()
      .then((result) => {
        if (!active) return;
        setRecentUsers(result.recentUsers);
        setLoggedInUsers(result.loggedInUsers);
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
      <section className={`${styles.panel} ${styles.dashboardHero}`}>
        <span className={styles.eyebrow}>Admin dashboard</span>
        <h1 className={styles.title}>Welcome back{user?.email ? `, ${user.email}` : ""}</h1>
        <p className={styles.subtitle}>
          Admins use the same workspace as users, plus admin-only controls for user and email
          management.
        </p>
        <div className={styles.dashboardActions}>
          <Link className={styles.button} to="/admin/users">
            Open users
          </Link>
          <Link className={styles.secondaryButton} to="/admin/email-logs">
            Email logs
          </Link>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.stack}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.stack}>
            <span className={styles.eyebrow}>Admin</span>
            <h2 className={styles.cardTitle}>Logged-in Users</h2>
          </div>
          <Link className={styles.secondaryButton} to="/admin/users">
            Open user list
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {loggedInUsers.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString() : "Now"}</td>
                </tr>
              ))}
              {!loading && loggedInUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.muted}>
                    No logged-in users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.stack}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.stack}>
            <span className={styles.eyebrow}>Users</span>
            <h2 className={styles.cardTitle}>Recent Users</h2>
          </div>
          <Link className={styles.secondaryButton} to="/admin/users">
            View all users
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <span className={styles.status}>{item.verified ? "Verified" : "Pending"}</span>
                  </td>
                </tr>
              ))}
              {!loading && recentUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.muted}>
                    No users to show yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboardPage;
