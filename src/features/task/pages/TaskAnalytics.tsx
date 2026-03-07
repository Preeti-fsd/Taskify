import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import type { Task } from "../../../types/task";
import styles from "../styles/TaskAnalytics.module.css";
import { useTheme } from "../../../context/useTheme";
import { taskConstants } from "../styles/constants/constants";
import { calculateAnalytics } from "../utility/taskUtils";

const TaskAnalytics = () => {
  const [tasks] = useLocalStorage<Task[]>("tasks", []);
  const { theme } = useTheme();

  const COLORS = taskConstants.getDonutColors(theme);

  const analytics = useMemo(() => calculateAnalytics(tasks), [tasks]);

  const chartData = useMemo(
    () => [
      { name: "Completed", value: analytics.completed },
      { name: "Pending", value: analytics.pending },
    ],
    [analytics.completed, analytics.pending],
  );

  const statsConfig = [
    { label: "Total Tasks", value: analytics.total },
    { label: "Completed Task", value: analytics.completed },
    { label: "Completed %", value: `${analytics.completedPercent}%` },
    { label: "Pending %", value: `${analytics.pendingPercent}%` },
    { label: "With Due Date", value: analytics.withDueDate },
    {
      label: "Overdue Tasks",
      value: analytics.overdue,
      className: styles.overdue,
    },
  ];

  return (
    <>
      <h1 className={styles.title}>📊 Task Analytics</h1>

      <main className={styles.container}>
        <div className={styles.statsGrid}>
          {statsConfig.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <h3>{stat.label}</h3>
              <p className={stat.className}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className={styles.chartWrapper}>
          <>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart key={theme}>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={90}
                outerRadius={130}
                paddingAngle={5}
                cornerRadius={10}
                animationDuration={800}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className={styles.centerLabel}>
            <h2>{analytics.completedPercent}%</h2>
            <p>Completed</p>
          </div>
          </>
        </div>
      </main>
    </>
  );
};

export default TaskAnalytics;
