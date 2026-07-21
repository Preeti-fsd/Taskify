import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAdmin);

router.get("/users", adminController.listUsers);

export default router;
