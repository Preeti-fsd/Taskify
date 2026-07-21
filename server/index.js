import "dotenv/config";
import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { startReminderScheduler } from "./src/services/reminderScheduler.js";
import { ensureSchema } from "./src/services/ensureSchema.js";

await ensureSchema();
startReminderScheduler();

app.listen(env.port, () => {
  console.log(`Taskify API running at http://localhost:${env.port}`);
});
