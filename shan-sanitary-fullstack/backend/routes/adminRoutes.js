import express from "express";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  toggleAdminStatus,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate, authorize("root_admin"));

router.get("/", getAdmins);
router.post("/", createAdmin);
router.patch("/:id", updateAdmin);
router.patch("/:id/status", toggleAdminStatus);

export default router;