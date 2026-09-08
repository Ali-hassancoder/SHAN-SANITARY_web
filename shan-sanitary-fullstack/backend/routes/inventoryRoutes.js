import express from "express";
import { getSummary, listLowStock, listOutOfStock } from "../controllers/inventoryController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate, authorize("admin", "root_admin"));

router.get("/summary", getSummary);
router.get("/low-stock", listLowStock);
router.get("/out-of-stock", listOutOfStock);

export default router;