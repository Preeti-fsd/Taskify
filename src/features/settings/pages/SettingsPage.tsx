import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "../../../styles/sharedPages.module.css";
import { settingsApi } from "../../../services/settingsApi";
import type { UserSettings } from "../../../types/settings";
import { useAuth } from "../../../context/useAuth";

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    settingsApi
      .getSettings()
      .then((result) => {
        if (active) setSettings(result);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateField = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await settingsApi.updateSettings({
        notificationEmail: settings.notificationEmail,
        taskRemindersEnabled: settings.taskRemindersEnabled,
        reminderType: settings.reminderType,
        reminderTiming: settings.reminderTiming,
        dailySummaryEnabled: settings.dailySummaryEnabled,
        dailySummaryTime: settings.dailySummaryTime,
        weeklyReportEnabled: settings.weeklyReportEnabled,
        weeklyReportDay: settings.weeklyReportDay,
        monthlyReportEnabled: settings.monthlyReportEnabled,
        productivityReportEnabled: settings.productivityReportEnabled,
        productivityReportFrequency: settings.productivityReportFrequency,
        darkMode: settings.darkMode,
        silentMode: settings.silentMode,
        vacationMode: settings.vacationMode,
      });
      setSettings(updated);
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={`${styles.panel} ${styles.stack}`}>
          <p className={styles.muted}>Loading settings...</p>
        </section>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className={styles.page}>
        <section className={`${styles.panel} ${styles.stack}`}>
          <p className={styles.muted}>No settings found.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={`${styles.panel} ${styles.stack}`}>
        <span className={styles.eyebrow}>Personal</span>
        <h1 className={styles.title}>Notification Settings</h1>
        <p className={styles.subtitle}>
          Taskify uses your logged-in email by default. You can override it here if you need reminders
          sent somewhere else.
        </p>

        <div className={styles.twoCol}>
          <label className={styles.field}>
            <span className={styles.label}>Notification Email</span>
            <input
              className={styles.input}
              type="email"
              value={settings.notificationEmail || user?.email || ""}
              onChange={(e) => updateField("notificationEmail", e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Task Reminders</span>
            <select
              className={styles.input}
              value={String(settings.taskRemindersEnabled)}
              onChange={(e) => updateField("taskRemindersEnabled", e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Reminder Type</span>
            <select
              className={styles.input}
              value={settings.reminderType}
              onChange={(e) => updateField("reminderType", e.target.value as UserSettings["reminderType"])}
            >
              <option value="email">Email</option>
              <option value="in-app">In-App</option>
              <option value="both">Both</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Reminder Timing</span>
            <select
              className={styles.input}
              value={settings.reminderTiming}
              onChange={(e) => updateField("reminderTiming", e.target.value)}
            >
              <option value="5 min before">5 min before</option>
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
              <option value="1 hour">1 hour</option>
              <option value="1 day">1 day</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Daily Summary</span>
            <select
              className={styles.input}
              value={String(settings.dailySummaryEnabled)}
              onChange={(e) => updateField("dailySummaryEnabled", e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Summary Time</span>
            <input
              className={styles.input}
              type="time"
              value={settings.dailySummaryTime}
              onChange={(e) => updateField("dailySummaryTime", e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Weekly Report</span>
            <select
              className={styles.input}
              value={String(settings.weeklyReportEnabled)}
              onChange={(e) => updateField("weeklyReportEnabled", e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Weekly Day</span>
            <select
              className={styles.input}
              value={settings.weeklyReportDay}
              onChange={(e) => updateField("weeklyReportDay", e.target.value)}
            >
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Monthly Report</span>
            <select
              className={styles.input}
              value={String(settings.monthlyReportEnabled)}
              onChange={(e) => updateField("monthlyReportEnabled", e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Productivity Report</span>
            <select
              className={styles.input}
              value={String(settings.productivityReportEnabled)}
              onChange={(e) => updateField("productivityReportEnabled", e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Productivity Frequency</span>
            <select
              className={styles.input}
              value={settings.productivityReportFrequency}
              onChange={(e) => updateField("productivityReportFrequency", e.target.value as UserSettings["productivityReportFrequency"])}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Dark Mode</span>
            <select
              className={styles.input}
              value={String(settings.darkMode)}
              onChange={(e) => updateField("darkMode", e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Silent Mode</span>
            <select
              className={styles.input}
              value={String(settings.silentMode)}
              onChange={(e) => updateField("silentMode", e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Vacation Mode</span>
            <select
              className={styles.input}
              value={String(settings.vacationMode)}
              onChange={(e) => updateField("vacationMode", e.target.value === "true")}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
        </div>

        <div className={styles.actions}>
          <button className={styles.button} type="button" onClick={() => void saveSettings()} disabled={saving}>
            Save Settings
          </button>
        </div>
      </section>
    </main>
  );
};

export default SettingsPage;
