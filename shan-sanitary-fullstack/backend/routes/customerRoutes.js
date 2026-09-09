import express from "express";
import {
  getCustomers,
  getCustomerById,
  toggleCustomerStatus,
} from "../controllers/customerController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate, authorize("admin", "root_admin"));

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.patch("/:id/status", toggleCustomerStatus);

export default router;