import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { settingsController } from "../controllers/settingsController.js";

const router = Router();

router.use(requireAuth);

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);

export default router;
