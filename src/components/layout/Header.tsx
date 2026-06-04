import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { useAuth } from "../../context/useAuth";
import styles from "./Layout.module.css";

const authRoutes = new Set(["/login", "/signup", "/verify-otp", "/forgot-password", "/reset-password"]);

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute = authRoutes.has(location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <NavLink className={styles.brand} to={session ? "/dashboard" : "/login"}>
        <span className={styles.brandMark}>T</span>
        <span>Taskify</span>
      </NavLink>

      {session?.role === "admin" && (
        <span className={styles.adminBadge} aria-label="Admin mode">
          Admin Mode
        </span>
      )}

      {!isAuthRoute && session && (
        <nav className={styles.navLinks} aria-label="Primary">
          <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/dashboard">
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/tasks">
            Tasks
          </NavLink>
          <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/calendar">
            Calendar
          </NavLink>
          <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/analytics">
            Analytics
          </NavLink>
          <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/wish">
            Wish Center
          </NavLink>
          <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/productivity">
            Productivity
          </NavLink>
          <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/settings">
            Settings
          </NavLink>
          <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/notifications">
            Notifications
          </NavLink>
          {session.role === "admin" && (
            <>
              <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/admin">
                Admin
              </NavLink>
              <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/admin/users">
                Users
              </NavLink>
              <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/admin/email-logs">
                Email Logs
              </NavLink>
              <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/admin/analytics">
                Admin Analytics
              </NavLink>
              <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} to="/admin/settings">
                Settings
              </NavLink>
            </>
          )}
        </nav>
      )}

      <div className={styles.actions}>
        <button className={`${styles.themeButton} ${styles.navLink}`} onClick={toggleTheme} aria-label="Toggle theme" type="button">
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {session && !isAuthRoute && (
          <button className={`${styles.themeButton} ${styles.navLink}`} onClick={handleLogout} aria-label="Logout" type="button">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
