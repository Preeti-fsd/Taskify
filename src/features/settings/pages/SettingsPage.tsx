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
        darkMode: settings.darkMode,
      });
      setSettings(updated);
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggleButton = (enabled: boolean) =>
    enabled ? styles.button : styles.secondaryButton;

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
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>
          Keep only the core preferences: where reminders go, whether reminders are active, and
          whether the app should use dark mode.
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
          <div className={styles.field}>
            <span className={styles.label}>Task Reminders</span>
            <div className={styles.actions}>
              <button
                type="button"
                className={toggleButton(settings.taskRemindersEnabled)}
                onClick={() => updateField("taskRemindersEnabled", true)}
                aria-pressed={settings.taskRemindersEnabled}
              >
                On
              </button>
              <button
                type="button"
                className={toggleButton(!settings.taskRemindersEnabled)}
                onClick={() => updateField("taskRemindersEnabled", false)}
                aria-pressed={!settings.taskRemindersEnabled}
              >
                Off
              </button>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Dark Mode</span>
            <div className={styles.actions}>
              <button
                type="button"
                className={toggleButton(settings.darkMode)}
                onClick={() => updateField("darkMode", true)}
                aria-pressed={settings.darkMode}
              >
                On
              </button>
              <button
                type="button"
                className={toggleButton(!settings.darkMode)}
                onClick={() => updateField("darkMode", false)}
                aria-pressed={!settings.darkMode}
              >
                Off
              </button>
            </div>
          </div>
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
