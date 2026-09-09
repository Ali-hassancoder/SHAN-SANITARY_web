import express from "express";
import {
  getSummary,
  getSalesOverTime,
  getTopProducts,
  getCategoryPerformance,
} from "../controllers/dashboardController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate, authorize("admin", "root_admin"));

router.get("/summary", getSummary);
router.get("/sales-over-time", getSalesOverTime);
router.get("/top-products", getTopProducts);
router.get("/category-performance", getCategoryPerformance);

export default router;