import { Router } from "express";
import {
  getNotifications,
  markRead,
  markAllRead,
  clearRead,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/",          getNotifications);
router.put("/read-all",  markAllRead);
router.put("/:id/read",  markRead);
router.delete("/clear",  clearRead);

export default router;
