import { Link, useSearchParams } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../../context/useAuth";
import styles from "../../../styles/sharedPages.module.css";

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const { resetPassword } = useAuth();
  const [token] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      setMessage(await resetPassword(token, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`${styles.page} ${styles.authShell}`}>
      <div className={styles.authGrid}>
        <section className={styles.authHero}>
          <span className={styles.eyebrow}>Reset password</span>
          <h1 className={styles.brandMark}>TASKIFY</h1>
          <p className={styles.brandSubtext}>Plan • Focus • Achieve</p>
          <p className={styles.brandSubtext}>Choose a new password and get right back into your workspace.</p>
        </section>

        <section className={styles.authCard}>
          <div className={styles.stack}>
            <div>
              <h2 className={styles.title}>Reset Password</h2>
              <p className={styles.subtitle}>Create a strong new password for your account.</p>
            </div>

            {message && <p className={`${styles.message} ${styles.success}`}>{message}</p>}
            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>New Password</span>
                <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Confirm Password</span>
                <input className={styles.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </label>
              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={loading || !token}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <Link className={styles.ghostButton} to="/login">
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
