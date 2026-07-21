import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../../context/useAuth";
import styles from "../../../styles/sharedPages.module.css";

const VerifyOtpPage = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [email, setEmail] = useState(params.get("email") || localStorage.getItem("taskify-pending-verification") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message] = useState((location.state as { message?: string } | null)?.message || "OTP sent to your email.");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await verifyOtp(email, otp);
      localStorage.removeItem("taskify-pending-verification");
      navigate(session.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`${styles.page} ${styles.authShell}`}>
      <div className={styles.authGrid}>
        <section className={styles.authHero}>
          <span className={styles.eyebrow}>Verify account</span>
          <h1 className={styles.brandMark}>TASKIFY</h1>
          <p className={styles.brandSubtext}>Plan • Focus • Achieve</p>
          <p className={styles.brandSubtext}>Enter the 6-digit code we sent to your inbox to unlock your workspace.</p>
        </section>

        <section className={styles.authCard}>
          <div className={styles.stack}>
            <div>
              <h2 className={styles.title}>Verify OTP</h2>
              <p className={styles.subtitle}>We sent a security code to {email || "your email address"}.</p>
            </div>

            {message && <p className={`${styles.message} ${styles.success}`}>{message}</p>}
            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>OTP</span>
                <input className={styles.input} value={otp} onChange={(e) => setOtp(e.target.value)} />
              </label>
              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify"}
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

export default VerifyOtpPage;
