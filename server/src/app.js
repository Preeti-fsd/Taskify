import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishRoutes from "./routes/wishRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { env } from "./config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../dist");

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/wishes", wishRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
