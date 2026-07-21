import { useNavigate } from "react-router-dom";
import { ArrowUpRight, CalendarDays, ChartColumnBig, CheckSquare2, Mail, Sparkles, TimerReset } from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import styles from "../../../styles/sharedPages.module.css";

const userCards = [
  {
    title: "Task Manager",
    description: "Create, manage, organize, and focus on your daily tasks.",
    path: "/tasks",
    icon: CheckSquare2,
  },
  {
    title: "Task Calendar",
    description: "View due dates, reminders, recurring work, and upcoming plans.",
    path: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Task Analytics",
    description: "Analyze productivity trends, streaks, categories, and task performance.",
    path: "/analytics",
    icon: ChartColumnBig,
  },
  {
    title: "Wish Center",
    description: "Send real emails immediately or on schedule.",
    path: "/wish",
    icon: Mail,
  },
  {
    title: "Productivity",
    description: "Focus mode, Pomodoro timing, and time tracking.",
    path: "/productivity",
    icon: TimerReset,
  },
];

const adminCards = [
  {
    title: "Dashboard",
    description: "Track users, logs, and system activity from one place.",
    path: "/admin",
    icon: Sparkles,
  },
  {
    title: "Users",
    description: "Search accounts, verify onboarding, and monitor access.",
    path: "/admin/users",
    icon: CheckSquare2,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const cards = session?.role === "admin" ? [...adminCards, ...userCards] : userCards;
  const displayName = user?.name?.trim() || user?.email.split("@")[0] || "there";

  return (
    <main className={`${styles.page} ${styles.dashboardShell}`}>
      <section className={`${styles.panel} ${styles.dashboardHero}`}>
        <span className={styles.eyebrow}>Productivity hub</span>
        <h1>Welcome back, {displayName}</h1>
        <p>TASKIFY</p>
        <p>Organize your tasks, track your progress, and stay ahead every day.</p>
      </section>

      <section className={styles.dashboardGrid}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className={`${styles.dashboardCard} ${styles.card}`}
              onClick={() => navigate(card.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate(card.path);
                }
              }}
            >
              <div className={styles.sectionHeader}>
                <Icon size={20} />
                <ArrowUpRight size={16} />
              </div>
              <div className={styles.stack}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default Home;
