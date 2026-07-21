import { useNavigate, Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../../context/useAuth";
import styles from "../../../styles/sharedPages.module.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await signup(name, email, password);
      localStorage.setItem("taskify-pending-verification", email);
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`, {
        state: { message: result.message },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`${styles.page} ${styles.authShell}`}>
      <div className={styles.authGrid}>
        <section className={styles.authHero}>
          <span className={styles.eyebrow}>Start free</span>
          <h1 className={styles.brandMark}>TASKIFY</h1>
          <p className={styles.brandSubtext}>Plan • Focus • Achieve</p>
          <p className={styles.brandSubtext}>
            Create your account to unlock tasks, wish scheduling, analytics, and the full productivity stack.
          </p>
        </section>

        <section className={styles.authCard}>
          <div className={styles.stack}>
            <div>
              <h2 className={styles.title}>Create account</h2>
              <p className={styles.subtitle}>We’ll send a one-time code to your inbox after signup.</p>
            </div>

            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Name</span>
                <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Password</span>
                <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Confirm Password</span>
                <input className={styles.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </label>

              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
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

export default SignupPage;
