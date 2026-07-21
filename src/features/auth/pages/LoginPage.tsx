import { useNavigate, Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../../context/useAuth";
import styles from "../../../styles/sharedPages.module.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const session = await login(email, password);
      navigate(session.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`${styles.page} ${styles.authShell}`}>
      <div className={styles.authGrid}>
        <section className={styles.authHero}>
          <span className={styles.eyebrow}>Productivity platform</span>
          <h1 className={styles.brandMark}>TASKIFY</h1>
          <p className={styles.brandSubtext}>Plan • Focus • Achieve</p>
          <p className={styles.brandSubtext}>
            Organize tasks, manage email workflows, track productivity, and keep every part of your day moving in one polished workspace.
          </p>
          <div className={styles.featureGrid}>
            <article className={styles.featureCard}>
              <h3>Task Manager</h3>
              <p>Create, manage, organize, and focus on your daily tasks.</p>
            </article>
            <article className={styles.featureCard}>
              <h3>Wish Center</h3>
              <p>Send real emails immediately or on schedule with tracked delivery.</p>
            </article>
            <article className={styles.featureCard}>
              <h3>Analytics</h3>
              <p>Measure trends, streaks, completion, and productivity scores.</p>
            </article>
            <article className={styles.featureCard}>
              <h3>Productivity</h3>
              <p>Focus mode, Pomodoro timing, and time tracking in one place.</p>
            </article>
          </div>
        </section>

        <section className={styles.authCard}>
          <div className={styles.stack}>
            <div>
              <h2 className={styles.title}>Welcome back</h2>
              <p className={styles.subtitle}>Sign in with your verified Taskify account.</p>
            </div>

            {message && <p className={`${styles.message} ${styles.success}`}>{message}</p>}
            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Password</span>
                <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>

              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
                <Link className={styles.ghostButton} to="/forgot-password">
                  Forgot Password
                </Link>
              </div>
            </form>

            <div className={styles.linkRow}>
              <Link className={styles.link} to="/signup">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
