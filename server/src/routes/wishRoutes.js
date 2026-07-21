import { Router } from "express";
import { wishController } from "../controllers/wishController.js";
import { requireUser } from "../middleware/auth.js";

const router = Router();

router.use(requireUser);

router.get("/", wishController.listWishes);
router.post("/", wishController.createWish);
router.patch("/:id", wishController.updateWish);
router.post("/:id/cancel", wishController.cancelWish);
router.post("/:id/send", wishController.sendWishNow);
router.post("/process-due", wishController.processDue);

export default router;
