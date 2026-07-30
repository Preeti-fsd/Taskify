const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, fallback = []) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .concat(fallback)
    .filter((item, index, items) => items.indexOf(item) === index);

export const env = {
  port: toNumber(process.env.PORT, 5000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  appUrl: process.env.APP_URL || "http://localhost:5173",
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: toNumber(process.env.DB_PORT, 3306),
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "taskify_db",
  jwtSecret: process.env.JWT_SECRET || "taskify-dev-secret",
  otpSecret: process.env.OTP_SECRET || "taskify-otp-secret",
  emailHost: process.env.EMAIL_HOST || "",
  emailPort: toNumber(process.env.EMAIL_PORT, 587),
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || "",
  emailReminderIntervalMs: toNumber(
    process.env.EMAIL_REMINDER_INTERVAL_MS,
    300000,
  ),
  adminEmails: toList(process.env.ADMIN_EMAILS, ["preetiny77@gmail.com"]),
};
