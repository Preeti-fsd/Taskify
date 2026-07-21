import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../../context/useAuth";
import styles from "../../../styles/sharedPages.module.css";

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      setMessage(await forgotPassword(email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`${styles.page} ${styles.authShell}`}>
      <div className={styles.authGrid}>
        <section className={styles.authHero}>
          <span className={styles.eyebrow}>Account recovery</span>
          <h1 className={styles.brandMark}>TASKIFY</h1>
          <p className={styles.brandSubtext}>Plan • Focus • Achieve</p>
          <p className={styles.brandSubtext}>We’ll send a secure reset email with a Change Password button that expires in 15 minutes.</p>
        </section>

        <section className={styles.authCard}>
          <div className={styles.stack}>
            <div>
              <h2 className={styles.title}>Forgot Password</h2>
              <p className={styles.subtitle}>Enter the email attached to your account.</p>
            </div>

            {message && <p className={`${styles.message} ${styles.success}`}>{message}</p>}
            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>

              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Email"}
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

export default ForgotPasswordPage;
