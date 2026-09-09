import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate, authorize("root_admin"));

router.get("/", getSettings);
router.patch("/", updateSettings);

export default router;