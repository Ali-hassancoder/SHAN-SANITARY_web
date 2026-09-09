import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate, authorize("root_admin"));

router.get("/", getAuditLogs);

export default router;