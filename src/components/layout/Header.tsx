import React from "react";
import { useTheme } from "../../context/useTheme";
import styles from "./Layout.module.css";
import { Sun, Moon } from "lucide-react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className={styles.header}>
      <NavLink className={styles.title} to='/' >
        Taskify
      </NavLink>
      <button
        className={styles.themeButton}
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </nav>
  );
};

export default React.memo(Header);
