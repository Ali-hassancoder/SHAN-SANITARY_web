import express from "express";
import {
  checkout,
  validateCouponPreview,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate); // every order route requires login

router.post("/checkout", checkout);
router.post("/validate-coupon", validateCouponPreview);
router.get("/my-orders", getMyOrders);
router.get("/", authorize("admin", "root_admin"), getAllOrdersAdmin);
router.get("/:id", getOrderById); // ownership checked inside the controller
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/status", authorize("admin", "root_admin"), updateOrderStatus);

export default router;