import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { notificationController } from "../controllers/notificationController.js";

const router = Router();

router.use(requireAuth);

router.get("/", notificationController.listNotifications);
router.post("/:id/retry", notificationController.retryNotification);

export default router;
