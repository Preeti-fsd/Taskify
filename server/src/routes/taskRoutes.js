import { Router } from "express";
import { taskController } from "../controllers/taskController.js";
import { requireUser } from "../middleware/auth.js";

const router = Router();

router.use(requireUser);

router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.post("/send-reminders", taskController.sendDueEmailReminders);
router.post("/:id/focus-sessions", taskController.addFocusSession);
router.get("/:id/attachments", taskController.listAttachments);
router.get("/:id/attachments/:attachmentId/download", taskController.downloadAttachment);
router.put("/reorder", taskController.reorderTasks);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
