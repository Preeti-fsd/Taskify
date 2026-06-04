import { useEffect, useState, type FormEvent } from "react";
import { adminApi, type AdminUserRow } from "../../../services/adminApi";
import styles from "../../../styles/sharedPages.module.css";

const AdminUsersPage = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loggedInUsers, setLoggedInUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const result = await adminApi.listUsers(query);
      setUsers(result.users);
      setLoggedInUsers(result.loggedInUsers);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadUsers(search);
  };

  return (
    <main className={styles.page}>
      <section className={`${styles.panel} ${styles.stack}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.stack}>
            <span className={styles.eyebrow}>Admin</span>
            <h1 className={styles.title}>Users</h1>
            <p className={styles.subtitle}>Search by name or email. Passwords stay hidden.</p>
          </div>
          <p className={styles.cardValue}>{total}</p>
        </div>

        <form className={styles.toolbar} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            style={{ maxWidth: 360 }}
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={styles.button} type="submit">
            Search
          </button>
        </form>

        <section className={styles.infoCard}>
          <h2 className={styles.cardTitle}>Logged-in Users</h2>
          <p className={styles.muted}>These accounts have signed in at least once.</p>
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {loggedInUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Just now"}</td>
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

        {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

        {loading ? (
          <p className={styles.muted}>Loading users...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={styles.status}>{user.verified ? "Verified" : "Pending"}</span>
                    </td>
                    <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.muted}>
                      No users found.
                    </td>
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

export default AdminUsersPage;
