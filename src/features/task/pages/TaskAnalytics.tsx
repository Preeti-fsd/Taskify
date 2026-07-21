import { useMemo } from "react";
import {
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../styles/TaskAnalytics.module.css";
import { useTheme } from "../../../context/useTheme";
import { taskConstants } from "../styles/constants/constants";
import {
  calculateAnalytics,
  getCompletionTrend,
} from "../utility/taskUtils";
import { useTasks } from "../hooks/useTasks";

const TaskAnalytics = () => {
  const { tasks, isLoading, error } = useTasks();
  const { theme } = useTheme();
  const COLORS = taskConstants.getDonutColors(theme);

  const analytics = useMemo(() => calculateAnalytics(tasks), [tasks]);
  const trendData = useMemo(() => getCompletionTrend(tasks), [tasks]);
  const lineStroke = theme === "dark" ? "#8ca0ff" : "#4257ff";

  const chartData = useMemo(
    () => [
      { name: "Completed", value: analytics.completed },
      { name: "Pending", value: analytics.pending },
    ],
    [analytics.completed, analytics.pending],
  );

  const cards = [
    { label: "Tasks", value: analytics.total },
    { label: "Done", value: analytics.completed },
    { label: "Pending", value: analytics.pending },
    { label: "Score", value: `${analytics.productivityScore}/100` },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <span className={styles.kicker}>Insights</span>
        <h1>Task Analytics</h1>
        <p>Simple overview of task progress, completion rate, and recent activity.</p>
      </section>

      {isLoading && <p className={styles.notice}>Loading analytics...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.statsGrid}>
        {cards.map((card) => (
          <article key={card.label} className={styles.statCard}>
            <h3>{card.label}</h3>
            <p>{card.value}</p>
          </article>
        ))}
      </section>

      <section className={styles.grid}>
        <article className={styles.chartCard}>
          <h2>Completion Mix</h2>
          <div className={styles.chartFrame}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key={theme}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  cornerRadius={10}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.centerLabel}>
              <strong>{analytics.completedPercent}%</strong>
              <span>Completed</span>
            </div>
          </div>
        </article>

        <article className={styles.chartCard}>
          <h2>Completion Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke={lineStroke} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
};

export default TaskAnalytics;
